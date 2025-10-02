from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from database_service import DatabaseService
from models import Class, Subject, GradeLevel, UserOut, UserRole, ClassAssignment, Enrollment, Attendance, Grade
from pydantic import BaseModel
from datetime import datetime
from auth import get_current_user

router = APIRouter(prefix="/api/classes", tags=["classes"])

class ClassCreate(BaseModel):
    name: str
    grade_level: GradeLevel
    academic_year: str
    capacity: int = 30

class ClassOut(BaseModel):
    id: int
    name: str
    grade_level: GradeLevel
    academic_year: str
    capacity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

@router.post("/", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
def create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Create a new class"""
    # Only admins can create classes
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create classes"
        )
    
    db_service = DatabaseService(db)
    
    # Check if class name already exists for the academic year
    existing_class = db_service.db.query(Class).filter(
        Class.name == class_data.name,
        Class.academic_year == class_data.academic_year,
        Class.is_active == True
    ).first()
    
    if existing_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Class with this name already exists for the academic year"
        )
    
    new_class = db_service.create_class(
        name=class_data.name,
        grade_level=class_data.grade_level,
        academic_year=class_data.academic_year,
        capacity=class_data.capacity
    )
    
    return ClassOut.model_validate(new_class)

@router.get("/", response_model=List[ClassOut])
def list_classes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    academic_year: Optional[str] = Query(None),
    grade_level: Optional[GradeLevel] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """List all classes with optional filtering"""
    db_service = DatabaseService(db)
    
    # Build query
    query = db_service.db.query(Class)
    
    if academic_year:
        query = query.filter(Class.academic_year == academic_year)
    
    if grade_level:
        query = query.filter(Class.grade_level == grade_level)
    
    classes = query.offset(skip).limit(limit).all()
    return [ClassOut.model_validate(cls) for cls in classes]

@router.get("/{class_id}", response_model=ClassOut)
def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get a specific class by ID"""
    db_service = DatabaseService(db)
    class_obj = db_service.get_class_by_id(class_id)
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    return ClassOut.model_validate(class_obj)

@router.get("/{class_id}/students", response_model=List[dict])
def get_class_students(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get all students enrolled in a class"""
    db_service = DatabaseService(db)
    
    # Check if class exists
    class_obj = db_service.get_class_by_id(class_id)
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Get enrollments for the class
    enrollments = db_service.get_class_enrollments(class_id)
    
    # Convert to response format
    result = []
    for enrollment in enrollments:
        student = db_service.get_student_by_id(enrollment.student_id)
        if student:
            result.append({
                "enrollment_id": enrollment.id,
                "student_id": student.id,
                "student_name": student.user.full_name if student.user else "Unknown",
                "student_id_number": student.student_id,
                "enrollment_date": enrollment.enrollment_date,
                "is_active": enrollment.is_active
            })
    
    return result

@router.get("/{class_id}/teachers", response_model=List[dict])
def get_class_teachers(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get all teachers assigned to a class"""
    db_service = DatabaseService(db)
    
    # Check if class exists
    class_obj = db_service.get_class_by_id(class_id)
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Get class assignments
    assignments = db_service.db.query(ClassAssignment).filter(
        ClassAssignment.class_id == class_id,
        ClassAssignment.is_active == True
    ).all()
    
    # Convert to response format
    result = []
    for assignment in assignments:
        teacher = db_service.get_teacher_by_id(assignment.teacher_id)
        subject = db_service.get_subject_by_id(assignment.subject_id)
        
        if teacher:
            result.append({
                "assignment_id": assignment.id,
                "teacher_id": teacher.id,
                "teacher_name": teacher.user.full_name if teacher.user else "Unknown",
                "teacher_id_number": teacher.teacher_id,
                "subject_id": assignment.subject_id,
                "subject_name": subject.name if subject else "Unknown",
                "academic_year": assignment.academic_year
            })
    
    return result

@router.post("/{class_id}/enroll", response_model=dict)
def enroll_student(
    class_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Enroll a student in a class"""
    # Only admins can enroll students
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can enroll students"
        )
    
    db_service = DatabaseService(db)
    
    # Check if class exists
    class_obj = db_service.get_class_by_id(class_id)
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if student exists
    student = db_service.get_student_by_id(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check if student is already enrolled in this class
    existing_enrollment = db_service.db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.class_id == class_id,
        Enrollment.is_active == True
    ).first()
    
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already enrolled in this class"
        )
    
    # Check class capacity
    current_enrollments = db_service.db.query(Enrollment).filter(
        Enrollment.class_id == class_id,
        Enrollment.is_active == True
    ).count()
    
    if current_enrollments >= class_obj.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Class is at maximum capacity"
        )
    
    enrollment = db_service.enroll_student(student_id, class_id)
    
    return {
        "message": "Student enrolled successfully",
        "enrollment_id": enrollment.id,
        "student_id": student_id,
        "class_id": class_id
    }

@router.delete("/{class_id}/enroll/{enrollment_id}", response_model=dict)
def unenroll_student(
    class_id: int,
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Unenroll a student from a class"""
    # Only admins can unenroll students
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can unenroll students"
        )
    
    db_service = DatabaseService(db)
    
    # Find the enrollment
    enrollment = db_service.db.query(Enrollment).filter(
        Enrollment.id == enrollment_id,
        Enrollment.class_id == class_id,
        Enrollment.is_active == True
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Deactivate the enrollment
    enrollment.is_active = False
    db_service.db.commit()
    
    return {
        "message": "Student unenrolled successfully",
        "enrollment_id": enrollment_id
    }

@router.get("/{class_id}/attendance", response_model=List[dict])
def get_class_attendance(
    class_id: int,
    date: date,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get attendance records for a class on a specific date"""
    db_service = DatabaseService(db)
    
    # Check if class exists
    class_obj = db_service.get_class_by_id(class_id)
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Get attendance records
    attendances = db_service.get_attendance_by_class(class_id, date)
    
    # Convert to response format
    result = []
    for attendance in attendances:
        student = db_service.get_student_by_id(attendance.student_id)
        teacher = db_service.get_teacher_by_id(attendance.marked_by)
        
        if student:
            result.append({
                "attendance_id": attendance.id,
                "student_id": student.id,
                "student_name": student.user.full_name if student.user else "Unknown",
                "student_id_number": student.student_id,
                "status": attendance.status,
                "notes": attendance.notes,
                "marked_by": attendance.marked_by,
                "marked_by_name": teacher.user.full_name if teacher and teacher.user else "Unknown"
            })
    
    return result

@router.get("/{class_id}/grades", response_model=List[dict])
def get_class_grades(
    class_id: int,
    subject_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get all grades for a class"""
    db_service = DatabaseService(db)
    
    # Check if class exists
    class_obj = db_service.get_class_by_id(class_id)
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Get grades for the class
    grades = db_service.get_grades_by_class(class_id, subject_id)
    
    # Convert to response format
    result = []
    for grade in grades:
        student = db_service.get_student_by_id(grade.student_id)
        subject = db_service.get_subject_by_id(grade.subject_id)
        teacher = db_service.get_teacher_by_id(grade.teacher_id)
        
        if student:
            result.append({
                "grade_id": grade.id,
                "student_id": student.id,
                "student_name": student.user.full_name if student.user else "Unknown",
                "student_id_number": student.student_id,
                "subject_id": grade.subject_id,
                "subject_name": subject.name if subject else "Unknown",
                "grade_value": grade.grade_value,
                "max_grade": grade.max_grade,
                "percentage": (grade.grade_value / grade.max_grade) * 100 if grade.max_grade > 0 else 0,
                "grade_type": grade.grade_type,
                "description": grade.description,
                "date_given": grade.date_given,
                "teacher_name": teacher.user.full_name if teacher and teacher.user else "Unknown"
            })
    
    return result
