"""
app/api/main.py
FastAPI application factory — mounts all routers, configures CORS & startup
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.domain.database import create_tables, seed_default_user
from app.api.v1 import users, documents, chat, experiments, reports

app = FastAPI(
    title="ChatBot Nhóm 9 — RAG & Benchmarking API",
    description=(
        "Hệ thống Chatbot Học Tập tích hợp RAG (Retrieval-Augmented Generation) "
        "và Benchmarking so sánh Chunking Strategies & Embedding Models."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    """Create database tables on first run."""
    create_tables()
    seed_default_user()

# ─────────────────────────────────────────────
# ROUTERS
# ─────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(users.router, prefix=API_PREFIX)
app.include_router(documents.router, prefix=API_PREFIX)
app.include_router(chat.router, prefix=API_PREFIX)
app.include_router(experiments.router, prefix=API_PREFIX)
app.include_router(reports.router, prefix=API_PREFIX)


# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "ChatBot Nhóm 9 API",
        "docs": "/docs",
        "health": "/health",
    }
