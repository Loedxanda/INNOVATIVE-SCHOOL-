"""
Grade Management API routes
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel

from database import get_db
from database_service import DatabaseService
from models import Grade, UserOut, UserRole, Student, Teacher, Subject, Class
from auth import get_current_user
from rbac import require_permission, Permission

router = APIRouter(prefix="/api/grades", tags=["grades"])

class GradeCreate(BaseModel):
    student_id: int
    teacher_id: int
    subject_id: int
    class_id: int
    grade_value: float
    max_grade: float = 100.0
    grade_type: Optional[str] = None
    description: Optional[str] = None

class GradeOut(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    subject_id: int
    class_id: int
    grade_value: float
    max_grade: float
    grade_type: Optional[str]
    description: Optional[str]
    date_given: date
    created_at: datetime
    
    class Config:
        from_attributes = True

class GradeUpdate(BaseModel):
    grade_value: Optional[float] = None
    max_grade: Optional[float] = None
    grade_type: Optional[str] = None
    description: Optional[str] = None

@router.post("/", response_model=GradeOut, status_code=status.HTTP_201_CREATED)
@require_permission(Permission.CREATE_GRADE)
def create_grade(
    grade: GradeCreate,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Create a new grade"""
    db_service = DatabaseService(db)
    
    # Verify student exists
    student = db_service.get_student_by_id(grade.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Verify teacher exists
    teacher = db_service.get_teacher_by_id(grade.teacher_id)
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    # Verify subject exists
    subject = db_service.get_subject_by_id(grade.subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Verify class exists
    class_obj = db_service.get_class_by_id(grade.class_id)
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Create grade
    new_grade = db_service.add_grade(
        student_id=grade.student_id,
        teacher_id=grade.teacher_id,
        subject_id=grade.subject_id,
        class_id=grade.class_id,
        grade_value=grade.grade_value,
        max_grade=grade.max_grade,
        grade_type=grade.grade_type,
        description=grade.description
    )
    
    return GradeOut.model_validate(new_grade)

@router.get("/", response_model=List[GradeOut])
def list_grades(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    student_id: Optional[int] = Query(None),
    teacher_id: Optional[int] = Query(None),
    subject_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """List grades with optional filtering"""
    db_service = DatabaseService(db)
    
    # Build query
    query = db.query(Grade)
    
    if student_id:
        query = query.filter(Grade.student_id == student_id)
    if teacher_id:
        query = query.filter(Grade.teacher_id == teacher_id)
    if subject_id:
        query = query.filter(Grade.subject_id == subject_id)
    if class_id:
        query = query.filter(Grade.class_id == class_id)
    
    # Apply pagination
    grades = query.offset(skip).limit(limit).all()
    
    return [GradeOut.model_validate(grade) for grade in grades]

@router.get("/{grade_id}", response_model=GradeOut)
def get_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get a specific grade by ID"""
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    # Check permissions based on role
    if current_user.role == UserRole.student:
        # Students can only view their own grades
        student_profile = db_service.get_student_by_user_id(current_user.id)
        if not student_profile or student_profile.id != grade.student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own grades"
            )
    elif current_user.role == UserRole.parent:
        # Parents can only view their children's grades
        parent_profile = db_service.get_parent_by_user_id(current_user.id)
        if not parent_profile:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Parent profile not found"
            )
        
        student_parents = db_service.get_student_parents(grade.student_id)
        if parent_profile.id not in [p.id for p in student_parents]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your children's grades"
            )
    
    return GradeOut.model_validate(grade)

@router.patch("/{grade_id}", response_model=GradeOut)
@require_permission(Permission.UPDATE_GRADE)
def update_grade(
    grade_id: int,
    grade_update: GradeUpdate,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Update a grade"""
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    # Update fields
    update_data = grade_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(grade, field, value)
    
    db.commit()
    db.refresh(grade)
    
    return GradeOut.model_validate(grade)

@router.delete("/{grade_id}")
@require_permission(Permission.DELETE_GRADE)
def delete_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Delete a grade"""
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    db.delete(grade)
    db.commit()
    
    return {"message": "Grade deleted successfully"}

@router.get("/student/{student_id}/summary")
def get_student_grade_summary(
    student_id: int,
    subject_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get grade summary for a student"""
    db_service = DatabaseService(db)
    
    # Check permissions
    if current_user.role == UserRole.student:
        student_profile = db_service.get_student_by_user_id(current_user.id)
        if not student_profile or student_profile.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own grades"
            )
    elif current_user.role == UserRole.parent:
        parent_profile = db_service.get_parent_by_user_id(current_user.id)
        if not parent_profile:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Parent profile not found"
            )
        
        student_parents = db_service.get_student_parents(student_id)
        if parent_profile.id not in [p.id for p in student_parents]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your children's grades"
            )
    
    # Get grades
    grades = db_service.get_grades_by_student(student_id, subject_id)
    
    if not grades:
        return {
            "student_id": student_id,
            "total_grades": 0,
            "average_percentage": 0,
            "grades_by_subject": {}
        }
    
    # Calculate summary
    total_grades = len(grades)
    total_percentage = sum((g.grade_value / g.max_grade) * 100 for g in grades if g.max_grade > 0)
    average_percentage = total_percentage / total_grades if total_grades > 0 else 0
    
    # Group by subject
    grades_by_subject = {}
    for grade in grades:
        subject = db_service.get_subject_by_id(grade.subject_id)
        subject_name = subject.name if subject else "Unknown"
        
        if subject_name not in grades_by_subject:
            grades_by_subject[subject_name] = []
        
        grades_by_subject[subject_name].append({
            "id": grade.id,
            "grade_value": grade.grade_value,
            "max_grade": grade.max_grade,
            "percentage": (grade.grade_value / grade.max_grade) * 100 if grade.max_grade > 0 else 0,
            "grade_type": grade.grade_type,
            "date_given": grade.date_given
        })
    
    return {
        "student_id": student_id,
        "total_grades": total_grades,
        "average_percentage": round(average_percentage, 2),
        "grades_by_subject": grades_by_subject
    }
