from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models import Teacher, TeacherCreate, TeacherUpdate, TeacherOut
from database import get_db
from database_service import DatabaseService
from auth import get_current_user
from rbac import require_permission

router = APIRouter(prefix="/api/teachers", tags=["teachers"])

@router.get("/", response_model=List[TeacherOut])
async def get_teachers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all teachers"""
    require_permission(current_user, "teachers", "read")
    
    db_service = DatabaseService(db)
    teachers = db_service.get_teachers(skip=skip, limit=limit)
    return teachers

@router.get("/{teacher_id}", response_model=TeacherOut)
async def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get teacher by ID"""
    require_permission(current_user, "teachers", "read")
    
    db_service = DatabaseService(db)
    teacher = db_service.get_teacher(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.post("/", response_model=TeacherOut)
async def create_teacher(
    teacher: TeacherCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create new teacher"""
    require_permission(current_user, "teachers", "create")
    
    db_service = DatabaseService(db)
    return db_service.create_teacher(teacher)

@router.put("/{teacher_id}", response_model=TeacherOut)
async def update_teacher(
    teacher_id: int,
    teacher: TeacherUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update teacher"""
    require_permission(current_user, "teachers", "update")
    
    db_service = DatabaseService(db)
    updated_teacher = db_service.update_teacher(teacher_id, teacher)
    if not updated_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return updated_teacher

@router.delete("/{teacher_id}")
async def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete teacher"""
    require_permission(current_user, "teachers", "delete")
    
    db_service = DatabaseService(db)
    success = db_service.delete_teacher(teacher_id)
    if not success:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return {"message": "Teacher deleted successfully"}