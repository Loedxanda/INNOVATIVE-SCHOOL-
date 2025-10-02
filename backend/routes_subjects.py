from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from database_service import DatabaseService
from models import Subject, UserOut, UserRole, ClassAssignment, Grade
from pydantic import BaseModel
from datetime import datetime
from auth import get_current_user

router = APIRouter(prefix="/api/subjects", tags=["subjects"])

class SubjectCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class SubjectOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

@router.post("/", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Create a new subject"""
    # Only admins can create subjects
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create subjects"
        )
    
    db_service = DatabaseService(db)
    
    # Check if subject code already exists
    existing_subject = db_service.db.query(Subject).filter(
        Subject.code == subject.code,
        Subject.is_active == True
    ).first()
    
    if existing_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject with this code already exists"
        )
    
    new_subject = db_service.create_subject(
        name=subject.name,
        code=subject.code,
        description=subject.description
    )
    
    return SubjectOut.model_validate(new_subject)

@router.get("/", response_model=List[SubjectOut])
def list_subjects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """List all subjects with optional filtering"""
    db_service = DatabaseService(db)
    
    # Build query
    query = db_service.db.query(Subject)
    
    if active_only:
        query = query.filter(Subject.is_active == True)
    
    subjects = query.offset(skip).limit(limit).all()
    return [SubjectOut.model_validate(subject) for subject in subjects]

@router.get("/{subject_id}", response_model=SubjectOut)
def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get a specific subject by ID"""
    db_service = DatabaseService(db)
    subject = db_service.get_subject_by_id(subject_id)
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    return SubjectOut.model_validate(subject)

@router.put("/{subject_id}", response_model=SubjectOut)
def update_subject(
    subject_id: int,
    subject_update: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Update a subject"""
    # Only admins can update subjects
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update subjects"
        )
    
    db_service = DatabaseService(db)
    subject = db_service.get_subject_by_id(subject_id)
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Check if new code conflicts with existing subjects
    if subject_update.code != subject.code:
        existing_subject = db_service.db.query(Subject).filter(
            Subject.code == subject_update.code,
            Subject.id != subject_id,
            Subject.is_active == True
        ).first()
        
        if existing_subject:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subject with this code already exists"
            )
    
    # Update subject
    subject.name = subject_update.name
    subject.code = subject_update.code
    subject.description = subject_update.description
    subject.updated_at = datetime.utcnow()
    
    db_service.db.commit()
    db_service.db.refresh(subject)
    
    return SubjectOut.model_validate(subject)

@router.delete("/{subject_id}", response_model=dict)
def deactivate_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Deactivate a subject (soft delete)"""
    # Only admins can deactivate subjects
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can deactivate subjects"
        )
    
    db_service = DatabaseService(db)
    subject = db_service.get_subject_by_id(subject_id)
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Check if subject is being used in any active class assignments
    active_assignments = db_service.db.query(ClassAssignment).filter(
        ClassAssignment.subject_id == subject_id,
        ClassAssignment.is_active == True
    ).count()
    
    if active_assignments > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate subject that is currently assigned to classes"
        )
    
    # Deactivate subject
    subject.is_active = False
    subject.updated_at = datetime.utcnow()
    
    db_service.db.commit()
    
    return {"message": "Subject deactivated successfully"}

@router.get("/{subject_id}/classes", response_model=List[dict])
def get_subject_classes(
    subject_id: int,
    academic_year: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get all classes that teach this subject"""
    db_service = DatabaseService(db)
    
    # Check if subject exists
    subject = db_service.get_subject_by_id(subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Get class assignments for this subject
    assignments_query = db_service.db.query(ClassAssignment).filter(
        ClassAssignment.subject_id == subject_id,
        ClassAssignment.is_active == True
    )
    
    if academic_year:
        assignments_query = assignments_query.filter(ClassAssignment.academic_year == academic_year)
    
    assignments = assignments_query.all()
    
    # Convert to response format
    result = []
    for assignment in assignments:
        class_info = db_service.get_class_by_id(assignment.class_id)
        teacher = db_service.get_teacher_by_id(assignment.teacher_id)
        
        if class_info:
            result.append({
                "assignment_id": assignment.id,
                "class_id": class_info.id,
                "class_name": class_info.name,
                "grade_level": class_info.grade_level,
                "academic_year": assignment.academic_year,
                "teacher_id": assignment.teacher_id,
                "teacher_name": teacher.user.full_name if teacher and teacher.user else "Unknown"
            })
    
    return result

@router.get("/{subject_id}/teachers", response_model=List[dict])
def get_subject_teachers(
    subject_id: int,
    academic_year: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get all teachers who teach this subject"""
    db_service = DatabaseService(db)
    
    # Check if subject exists
    subject = db_service.get_subject_by_id(subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Get class assignments for this subject
    assignments_query = db_service.db.query(ClassAssignment).filter(
        ClassAssignment.subject_id == subject_id,
        ClassAssignment.is_active == True
    )
    
    if academic_year:
        assignments_query = assignments_query.filter(ClassAssignment.academic_year == academic_year)
    
    assignments = assignments_query.all()
    
    # Get unique teachers
    teacher_ids = list(set([assignment.teacher_id for assignment in assignments]))
    teachers = db_service.db.query(Teacher).filter(Teacher.id.in_(teacher_ids)).all()
    
    # Convert to response format
    result = []
    for teacher in teachers:
        # Count classes for this teacher and subject
        class_count = db_service.db.query(ClassAssignment).filter(
            ClassAssignment.teacher_id == teacher.id,
            ClassAssignment.subject_id == subject_id,
            ClassAssignment.is_active == True
        ).count()
        
        result.append({
            "teacher_id": teacher.id,
            "teacher_name": teacher.user.full_name if teacher.user else "Unknown",
            "teacher_id_number": teacher.teacher_id,
            "specialization": teacher.specialization,
            "qualification": teacher.qualification,
            "classes_count": class_count
        })
    
    return result

@router.get("/{subject_id}/grades", response_model=List[dict])
def get_subject_grades(
    subject_id: int,
    class_id: Optional[int] = Query(None),
    student_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get all grades for a subject"""
    db_service = DatabaseService(db)
    
    # Check if subject exists
    subject = db_service.get_subject_by_id(subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Build query
    query = db_service.db.query(Grade).filter(Grade.subject_id == subject_id)
    
    if class_id:
        query = query.filter(Grade.class_id == class_id)
    
    if student_id:
        query = query.filter(Grade.student_id == student_id)
    
    grades = query.order_by(Grade.date_given.desc()).all()
    
    # Convert to response format
    result = []
    for grade in grades:
        student = db_service.get_student_by_id(grade.student_id)
        class_info = db_service.get_class_by_id(grade.class_id)
        teacher = db_service.get_teacher_by_id(grade.teacher_id)
        
        if student:
            result.append({
                "grade_id": grade.id,
                "student_id": student.id,
                "student_name": student.user.full_name if student.user else "Unknown",
                "student_id_number": student.student_id,
                "class_id": grade.class_id,
                "class_name": class_info.name if class_info else "Unknown",
                "grade_value": grade.grade_value,
                "max_grade": grade.max_grade,
                "percentage": (grade.grade_value / grade.max_grade) * 100 if grade.max_grade > 0 else 0,
                "grade_type": grade.grade_type,
                "description": grade.description,
                "date_given": grade.date_given,
                "teacher_name": teacher.user.full_name if teacher and teacher.user else "Unknown"
            })
    
    return result
