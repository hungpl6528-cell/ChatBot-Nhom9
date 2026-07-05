"""
app/api/v1/users.py
User registration, login, and profile endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.domain.database import get_db
from app.domain.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.repositories.mysql_repo import UserRepository
from app.core.security import verify_password, create_access_token, get_current_user
from app.domain import models

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Đăng ký tài khoản mới."""
    repo = UserRepository(db)
    existing = repo.get_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email đã được sử dụng"
        )
    user = repo.create(ten=payload.ten, email=payload.email, mat_khau=payload.mat_khau)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Đăng nhập — trả về JWT token."""
    repo = UserRepository(db)
    user = repo.get_by_email(payload.email)
    if not user or not verify_password(payload.mat_khau, user.mat_khau):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng"
        )
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Lấy thông tin user hiện tại."""
    return current_user


@router.get("/", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Danh sách tất cả user (admin only — bổ sung role check nếu cần)."""
    return UserRepository(db).list_all()
