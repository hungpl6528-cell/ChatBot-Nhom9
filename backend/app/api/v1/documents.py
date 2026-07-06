"""
app/api/v1/documents.py
Document upload, list, and status endpoints
"""
import os
import tempfile
from typing import Optional, List

from fastapi import (
    APIRouter, Depends, HTTPException, UploadFile, File, Form, status, BackgroundTasks
)
from sqlalchemy.orm import Session

from app.domain.database import get_db
from app.domain.schemas import DocumentResponse, DocumentListResponse
from app.domain import models
from app.core.security import get_current_user_optional
from app.repositories.mysql_repo import DocumentRepository
from app.use_cases.ingestion import ingest_document

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload", response_model=dict, status_code=202)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mon_hoc: Optional[str] = Form(None),
    embedding_model: str = Form(default="text-embedding-3-small"),
    chunking_strategy: str = Form(default="recursive"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """
    Upload PDF hoặc DOCX → tự động chunk, embed, lưu vào ChromaDB (chạy nền).
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail=f"Chỉ hỗ trợ {', '.join(ALLOWED_EXTENSIONS)}")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File quá lớn (tối đa 50MB)")

    user_id = current_user.id if current_user else 1

    # Tạo record pending trước để giao diện có thể hiển thị trạng thái "Đang xử lý"
    from app.repositories.mysql_repo import DocumentRepository
    doc = DocumentRepository(db).create(user_id=user_id, ten_file=file.filename, mon_hoc=mon_hoc)
    DocumentRepository(db).update_status(doc.id, "processing")

    # Đẩy tác vụ xử lý file vào background để trả về HTTP response ngay lập tức
    background_tasks.add_task(
        _ingest_background_task,
        doc.id,
        file_bytes,
        file.filename,
        user_id,
        mon_hoc,
        embedding_model,
        chunking_strategy
    )

    return {
        "message": "Tài liệu đang được xử lý ngầm",
        "document_id": doc.id,
    }

async def _ingest_background_task(doc_id: int, file_bytes: bytes, filename: str, user_id: int, mon_hoc: str, embedding_model: str, chunking_strategy: str):
    from app.domain.database import SessionLocal
    from app.use_cases.ingestion import ingest_document
    from app.repositories.mysql_repo import DocumentRepository
    db = SessionLocal()
    try:
        # Pass doc_id to ingest_document to avoid creating another row
        await ingest_document(
            db=db,
            file_bytes=file_bytes,
            filename=filename,
            user_id=user_id,
            mon_hoc=mon_hoc,
            embedding_model_name=embedding_model,
            chunking_strategy=chunking_strategy,
            existing_doc_id=doc_id
        )
    except Exception as e:
        DocumentRepository(db).update_status(doc_id, "error")
    finally:
        db.close()


@router.get("/", response_model=DocumentListResponse)
def list_documents(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """Danh sách tất cả tài liệu (hoặc của user hiện tại)."""
    repo = DocumentRepository(db)
    if current_user:
        docs = repo.list_by_user(current_user.id)
    else:
        docs = repo.list_all()
    return DocumentListResponse(total=len(docs), items=docs)


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    """Chi tiết một tài liệu."""
    doc = DocumentRepository(db).get_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Tài liệu không tồn tại")
    return doc


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user_optional),
):
    """Xóa tài liệu khỏi MySQL (chunks trong ChromaDB cần xóa riêng)."""
    deleted = DocumentRepository(db).delete(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tài liệu không tồn tại")
