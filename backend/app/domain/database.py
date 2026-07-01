"""
app/domain/database.py
Database connection & session management
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.domain.models import Base

DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    f"?charset=utf8mb4"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.APP_ENV == "development",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency — yields DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables on startup."""
    Base.metadata.create_all(bind=engine)

def seed_default_user():
    """
    Tạo user mặc định (guest) nếu chưa có user nào trong DB.
    Cần thiết để upload file mà không cần đăng nhập.
    """
    from app.domain.models import User
    import bcrypt

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "guest@system.local").first()
        if not existing:
            hashed = bcrypt.hashpw(b"guest_no_login", bcrypt.gensalt()).decode("utf-8")
            default_user = User(
                ten="Guest",
                email="guest@system.local",
                mat_khau=hashed,
                is_active=True,
            )
            db.add(default_user)
            db.commit()
    finally:
        db.close()

