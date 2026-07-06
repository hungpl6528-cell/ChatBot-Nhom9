"""
app/use_cases/ingestion.py
Document ingestion pipeline:
  1. Parse PDF / DOCX
  2. Chunk with selected strategy (fixed-size | semantic | recursive)
  3. Embed with selected model
  4. Save chunks to ChromaDB
  5. Update document status in MySQL
"""
from __future__ import annotations
import os
import io
import json
import logging
from typing import List, Dict, Any, Optional

from sqlalchemy.orm import Session

# Document parsers
from pypdf import PdfReader
from docx import Document as DocxDocument

# LangChain text splitters
from langchain.text_splitter import (
    CharacterTextSplitter,
    RecursiveCharacterTextSplitter,
)

# Embeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.embeddings import Embeddings
import google.generativeai as genai
import time

from app.core.config import settings
from app.repositories.mysql_repo import DocumentRepository
from app.repositories.vector_repo import VectorRepository

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# AI & Embedding
# ─────────────────────────────────────────────
class NativeGeminiEmbeddings(Embeddings):
    def __init__(self, model_name: str, api_key: str):
        self.model_name = model_name
        genai.configure(api_key=api_key)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        results = []
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            res = genai.embed_content(
                model=self.model_name,
                content=batch,
                task_type='retrieval_document'
            )
            results.extend(res['embedding'])
        return results

    def embed_query(self, text: str) -> List[float]:
        res = genai.embed_content(
            model=self.model_name,
            content=text,
            task_type='retrieval_query'
        )
        return res['embedding']


# ─────────────────────────────────────────────
# EMBEDDING MODEL FACTORY
# ─────────────────────────────────────────────
def get_embedding_model(model_name: str):
    """Return a LangChain-compatible embedding model."""
    if model_name == "models/gemini-embedding-2":
        return NativeGeminiEmbeddings(
            model_name="models/gemini-embedding-2",
            api_key=settings.GEMINI_API_KEY,
        )
    elif model_name == "models/text-embedding-004":
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        return GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=settings.GEMINI_API_KEY,
        )
    elif model_name == "text-embedding-3-small":
        # Fallback in case old data is present
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=getattr(settings, "OPENAI_API_KEY", settings.GEMINI_API_KEY),
        )
    else:
        # HuggingFace models: multilingual-e5-base, BAAI/bge-m3, vinai/phobert-base-v2
        hf_model_id = model_name
        if model_name == "multilingual-e5-base":
            hf_model_id = "intfloat/multilingual-e5-base"
        return HuggingFaceEmbeddings(
            model_name=hf_model_id,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )


# ─────────────────────────────────────────────
# DOCUMENT PARSER
# ─────────────────────────────────────────────
def parse_pdf(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Extract text from PDF — returns list of {page, text}."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            pages.append({"page": i + 1, "text": text})
    return pages


def parse_docx(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Extract text from DOCX — returns list of {page, text}."""
    doc = DocxDocument(io.BytesIO(file_bytes))
    full_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    return [{"page": 1, "text": full_text}]


def extract_text(file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return parse_pdf(file_bytes)
    elif ext in (".docx", ".doc"):
        return parse_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


# ─────────────────────────────────────────────
# CHUNKING STRATEGIES
# ─────────────────────────────────────────────
def chunk_fixed_size(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Fixed-size character-based chunking."""
    splitter = CharacterTextSplitter(
        separator=" ",
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        length_function=len,
    )
    return splitter.split_text(text)


def chunk_recursive(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Recursive character splitter — tries paragraphs, sentences, words."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ".", "!", "?", ",", " "],
        length_function=len,
    )
    return splitter.split_text(text)


def chunk_semantic(text: str, chunk_size: int = 300) -> List[str]:
    """
    Semantic chunking — split by sentence groups.
    Simple implementation: split by sentences then group into windows.
    """
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = []
    current_len = 0
    for s in sentences:
        s = s.strip()
        if not s:
            continue
        if current_len + len(s) > chunk_size and current:
            chunks.append(" ".join(current))
            current = []
            current_len = 0
        current.append(s)
        current_len += len(s)
    if current:
        chunks.append(" ".join(current))
    return chunks


def apply_chunking(text: str, strategy: str) -> List[str]:
    if strategy == "fixed-size":
        return chunk_fixed_size(text)
    elif strategy == "semantic":
        return chunk_semantic(text)
    else:  # recursive (default)
        return chunk_recursive(text)


# ─────────────────────────────────────────────
# MAIN INGESTION USE CASE
# ─────────────────────────────────────────────
async def ingest_document(
    db: Session,
    file_bytes: bytes,
    filename: str,
    user_id: int,
    mon_hoc: Optional[str],
    embedding_model_name: str = "models/gemini-embedding-2",
    chunking_strategy: str = "recursive",
    existing_doc_id: Optional[int] = None,
) -> dict:
    """
    Full ingestion pipeline.
    Returns: {document_id, chunks_count, embedding_model, chunking_strategy}
    """
    import asyncio
    from concurrent.futures import ThreadPoolExecutor

    doc_repo = DocumentRepository(db)
    vector_repo = VectorRepository()

    # 1. Create or get document record
    if existing_doc_id:
        doc = doc_repo.get_by_id(existing_doc_id)
        if not doc:
            raise ValueError("Document ID not found")
    else:
        doc = doc_repo.create(user_id=user_id, ten_file=filename, mon_hoc=mon_hoc)
        
    doc_repo.update_status(doc.id, "processing")

    try:
        # 2. Parse document
        pages = extract_text(file_bytes, filename)
        full_text = "\n\n".join([p["text"] for p in pages])

        if not full_text.strip():
            doc_repo.update_status(doc.id, "error")
            raise ValueError("Document contains no extractable text")

        # 3. Chunk
        chunks = apply_chunking(full_text, chunking_strategy)
        logger.info(f"[Ingestion] {filename} → {len(chunks)} chunks via '{chunking_strategy}'")

        # 4. Embed — chạy trong thread pool để KHÔNG block event loop của uvicorn
        embedder = get_embedding_model(embedding_model_name)
        loop = asyncio.get_event_loop()

        def _embed():
            return embedder.embed_documents(chunks)

        embeddings = await loop.run_in_executor(None, _embed)

        # 5. Build metadata for each chunk
        metadatas = [
            {
                "document_id": doc.id,
                "filename": filename,
                "chunk_index": i,
                "strategy": chunking_strategy,
            }
            for i in range(len(chunks))
        ]

        # 6. Store in ChromaDB — cũng chạy trong thread pool
        def _store():
            return vector_repo.add_chunks(
                chunks=chunks,
                embeddings=embeddings,
                metadatas=metadatas,
                embedding_model=embedding_model_name,
            )

        with ThreadPoolExecutor(max_workers=1) as pool:
            await loop.run_in_executor(pool, _store)

        # 7. Update document record
        doc_repo.update_status(
            doc.id, "ready",
            so_chunks=len(chunks),
            embedding_model=embedding_model_name,
        )

        return {
            "document_id": doc.id,
            "chunks_count": len(chunks),
            "embedding_model": embedding_model_name,
            "chunking_strategy": chunking_strategy,
        }

    except Exception as e:
        logger.error(f"[Ingestion] Error processing {filename}: {e}")
        doc_repo.update_status(doc.id, "error")
        raise
