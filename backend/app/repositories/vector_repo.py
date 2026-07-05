"""
app/repositories/vector_repo.py
ChromaDB vector store operations
"""
from __future__ import annotations
import uuid
from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings


class VectorRepository:
    """
    Singleton-like wrapper around ChromaDB client.
    Each embedding model gets its own collection.
    """

    _client: Optional[chromadb.PersistentClient] = None

    def __init__(self):
        if VectorRepository._client is None:
            VectorRepository._client = chromadb.PersistentClient(
                path=settings.CHROMA_PATH,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
        self.client = VectorRepository._client

    def _get_collection(self, embedding_model: str) -> chromadb.Collection:
        """Get or create a collection named after the embedding model."""
        # Sanitize collection name
        safe_name = embedding_model.replace("/", "_").replace("-", "_").replace(".", "_").lower()
        collection_name = f"docs_{safe_name}"
        return self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def add_chunks(
        self,
        chunks: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]],
        embedding_model: str,
    ) -> List[str]:
        """
        Add text chunks with their precomputed embeddings into ChromaDB.
        Returns list of generated chunk IDs.
        """
        collection = self._get_collection(embedding_model)
        ids = [str(uuid.uuid4()) for _ in chunks]
        collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        return ids

    def query(
        self,
        query_embedding: List[float],
        embedding_model: str,
        top_k: int = 5,
        where: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Query the vector store for the most similar chunks.
        Returns raw ChromaDB results dict.
        """
        collection = self._get_collection(embedding_model)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        return results

    def delete_by_document_id(self, document_id: int, embedding_model: str) -> int:
        """Delete all chunks belonging to a document."""
        collection = self._get_collection(embedding_model)
        results = collection.get(where={"document_id": document_id})
        if results["ids"]:
            collection.delete(ids=results["ids"])
            return len(results["ids"])
        return 0

    def list_collections(self) -> List[str]:
        return [c.name for c in self.client.list_collections()]

    def collection_count(self, embedding_model: str) -> int:
        try:
            collection = self._get_collection(embedding_model)
            return collection.count()
        except Exception:
            return 0
