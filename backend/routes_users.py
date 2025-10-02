from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from models import UserCreate, UserOut, UserUpdate
from database import get_db
from database_service import DatabaseService
from auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_service = DatabaseService(db)
    existing_user = db_service.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    new_user = db_service.create_user(user)
    return new_user

@router.get("/me", response_model=UserOut)
def read_profile(current_user: UserOut = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserOut)
def update_profile(
    user_update: UserUpdate,
    current_user: UserOut = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_service = DatabaseService(db)
    updated = db_service.update_user(current_user.id, user_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated

# Optional: Admin - List all users (protect with admin rights in future)
@router.get("/", response_model=List[UserOut])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    db_service = DatabaseService(db)
    return db_service.list_users(skip=skip, limit=limit)