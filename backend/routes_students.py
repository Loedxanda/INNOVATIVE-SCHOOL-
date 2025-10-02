from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from database_service import DatabaseService
from models import StudentCreate, StudentOut, UserCreate, UserOut, UserRole, Student, ClassAssignment, Attendance, Grade
from auth import get_current_user
from rbac import require_permission, Permission, can_manage_students

router = APIRouter(prefix="/api/students", tags=["students"])

@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
@require_permission(Permission.CREATE_STUDENT)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Create a new student profile"""
    
    db_service = DatabaseService(db)
    
    # Check if user exists
    user = db_service.get_user_by_id(student.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user already has a student profile
    existing_student = db_service.get_student_by_user_id(student.user_id)
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a student profile"
        )
    
    # Check if student_id is already taken
    existing_student_id = db_service.db.query(db_service.db.query(Student).filter(Student.student_id == student.student_id).first())
    if existing_student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID already exists"
        )
    
    new_student = db_service.create_student(student)
    return new_student

@router.get("/", response_model=List[StudentOut])
def list_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """List all students with pagination"""
    # Only admins and teachers can list all students
    if current_user.role not in [UserRole.admin, UserRole.teacher]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view student list"
        )
    
    db_service = DatabaseService(db)
    return db_service.list_students(skip=skip, limit=limit)

@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get a specific student by ID"""
    db_service = DatabaseService(db)
    student = db_service.get_student_by_id(student_id)
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.student:
        # Students can only view their own profile
        student_profile = db_service.get_student_by_user_id(current_user.id)
        if not student_profile or student_profile.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own profile"
            )
    elif current_user.role == UserRole.parent:
        # Parents can only view their children's profiles
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
                detail="Can only view your children's profiles"
            )
    
    return student

@router.get("/me/profile", response_model=StudentOut)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get current user's student profile"""
    if current_user.role != UserRole.student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only students can access this endpoint"
        )
    
    db_service = DatabaseService(db)
    student = db_service.get_student_by_user_id(current_user.id)
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    
    return student

@router.get("/{student_id}/enrollments", response_model=List[dict])
def get_student_enrollments(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get all enrollments for a student"""
    db_service = DatabaseService(db)
    
    # Check permissions
    if current_user.role == UserRole.student:
        student_profile = db_service.get_student_by_user_id(current_user.id)
        if not student_profile or student_profile.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own enrollments"
            )
    
    enrollments = db_service.get_student_enrollments(student_id)
    
    # Convert to response format
    result = []
    for enrollment in enrollments:
        class_info = db_service.get_class_by_id(enrollment.class_id)
        result.append({
            "id": enrollment.id,
            "class_id": enrollment.class_id,
            "class_name": class_info.name if class_info else "Unknown",
            "grade_level": class_info.grade_level if class_info else None,
            "academic_year": class_info.academic_year if class_info else None,
            "enrollment_date": enrollment.enrollment_date,
            "is_active": enrollment.is_active
        })
    
    return result

@router.get("/{student_id}/attendance", response_model=List[dict])
def get_student_attendance(
    student_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get attendance records for a student"""
    db_service = DatabaseService(db)
    
    # Check permissions
    if current_user.role == UserRole.student:
        student_profile = db_service.get_student_by_user_id(current_user.id)
        if not student_profile or student_profile.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own attendance"
            )
    
    attendances = db_service.get_attendance_by_student(student_id, start_date, end_date)
    
    # Convert to response format
    result = []
    for attendance in attendances:
        class_info = db_service.get_class_by_id(attendance.class_id)
        result.append({
            "id": attendance.id,
            "class_id": attendance.class_id,
            "class_name": class_info.name if class_info else "Unknown",
            "date": attendance.date,
            "status": attendance.status,
            "notes": attendance.notes,
            "marked_by": attendance.marked_by
        })
    
    return result

@router.get("/{student_id}/grades", response_model=List[dict])
def get_student_grades(
    student_id: int,
    subject_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get grades for a student"""
    db_service = DatabaseService(db)
    
    # Check permissions
    if current_user.role == UserRole.student:
        student_profile = db_service.get_student_by_user_id(current_user.id)
        if not student_profile or student_profile.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own grades"
            )
    
    grades = db_service.get_grades_by_student(student_id, subject_id)
    
    # Convert to response format
    result = []
    for grade in grades:
        subject_info = db_service.get_subject_by_id(grade.subject_id)
        class_info = db_service.get_class_by_id(grade.class_id)
        result.append({
            "id": grade.id,
            "subject_id": grade.subject_id,
            "subject_name": subject_info.name if subject_info else "Unknown",
            "class_id": grade.class_id,
            "class_name": class_info.name if class_info else "Unknown",
            "grade_value": grade.grade_value,
            "max_grade": grade.max_grade,
            "percentage": (grade.grade_value / grade.max_grade) * 100 if grade.max_grade > 0 else 0,
            "grade_type": grade.grade_type,
            "description": grade.description,
            "date_given": grade.date_given
        })
    
    return result
