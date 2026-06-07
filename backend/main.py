from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from dotenv import load_dotenv
import os, shutil, uuid

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection("documents")

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

chat_histories = {}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1].lower()
    tmp_path = f"./tmp_{file.filename}"
    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    if ext == "pdf":
        loader = PyPDFLoader(tmp_path)
    elif ext == "docx":
        loader = Docx2txtLoader(tmp_path)
    else:
        os.remove(tmp_path)
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ PDF và DOCX")
    
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)
    
    for chunk in chunks:
        emb = openai.embeddings.create(input=chunk.page_content, model="text-embedding-3-small").data[0].embedding
        collection.add(documents=[chunk.page_content], embeddings=[emb], ids=[str(uuid.uuid4())])
    
    os.remove(tmp_path)
    return {"message": f"Đã upload {file.filename}, chunk thành {len(chunks)} đoạn"}

@app.post("/chat")
async def chat(req: ChatRequest):
    emb = openai.embeddings.create(input=req.message, model="text-embedding-3-small").data[0].embedding
    results = collection.query(query_embeddings=[emb], n_results=3)
    context = "\n".join(results["documents"][0]) if results["documents"] else ""
    
    history = chat_histories.get(req.session_id, [])
    history.append({"role": "user", "content": req.message})
    
    messages = [
        {"role": "system", "content": f"Bạn là trợ lý học tập. Chỉ trả lời dựa trên tài liệu sau:\n{context}"},
        *history
    ]
    
    response = openai.chat.completions.create(model="gpt-4o-mini", messages=messages)
    answer = response.choices[0].message.content
    
    history.append({"role": "assistant", "content": answer})
    chat_histories[req.session_id] = history
    
    return {"answer": answer, "sources": results["documents"][0] if results["documents"] else []}

@app.get("/documents")
async def list_documents():
    docs = collection.get()
    return {"count": len(docs["ids"]), "ids": docs["ids"]}