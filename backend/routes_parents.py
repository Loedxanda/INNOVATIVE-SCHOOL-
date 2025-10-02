from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from database_service import DatabaseService
from models import ParentCreate, ParentOut, UserOut, UserRole, ParentStudent, Enrollment
from auth import get_current_user

router = APIRouter(prefix="/api/parents", tags=["parents"])

@router.post("/", response_model=ParentOut, status_code=status.HTTP_201_CREATED)
def create_parent(
    parent: ParentCreate,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Create a new parent profile"""
    # Only admins can create parents
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create parent profiles"
        )
    
    db_service = DatabaseService(db)
    
    # Check if user exists
    user = db_service.get_user_by_id(parent.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user already has a parent profile
    existing_parent = db_service.get_parent_by_user_id(parent.user_id)
    if existing_parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a parent profile"
        )
    
    # Check if parent_id is already taken
    existing_parent_id = db_service.db.query(Parent).filter(Parent.parent_id == parent.parent_id).first()
    if existing_parent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parent ID already exists"
        )
    
    new_parent = db_service.create_parent(parent)
    return new_parent

@router.get("/", response_model=List[ParentOut])
def list_parents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """List all parents with pagination"""
    # Only admins can list all parents
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view parent list"
        )
    
    db_service = DatabaseService(db)
    return db_service.list_parents(skip=skip, limit=limit)

@router.get("/{parent_id}", response_model=ParentOut)
def get_parent(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get a specific parent by ID"""
    db_service = DatabaseService(db)
    parent = db_service.get_parent_by_id(parent_id)
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.parent:
        # Parents can only view their own profile
        parent_profile = db_service.get_parent_by_user_id(current_user.id)
        if not parent_profile or parent_profile.id != parent_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own profile"
            )
    
    return parent

@router.get("/me/profile", response_model=ParentOut)
def get_my_parent_profile(
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get current user's parent profile"""
    if current_user.role != UserRole.parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only parents can access this endpoint"
        )
    
    db_service = DatabaseService(db)
    parent = db_service.get_parent_by_user_id(current_user.id)
    
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent profile not found"
        )
    
    return parent

@router.get("/{parent_id}/children", response_model=List[dict])
def get_parent_children(
    parent_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get all children of a parent"""
    db_service = DatabaseService(db)
    
    # Check permissions
    if current_user.role == UserRole.parent:
        parent_profile = db_service.get_parent_by_user_id(current_user.id)
        if not parent_profile or parent_profile.id != parent_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own children"
            )
    
    children = db_service.get_parent_students(parent_id)
    
    # Convert to response format
    result = []
    for child in children:
        # Get current class enrollment
        current_enrollment = db_service.db.query(Enrollment).filter(
            Enrollment.student_id == child.id,
            Enrollment.is_active == True
        ).first()
        
        class_info = None
        if current_enrollment:
            class_info = db_service.get_class_by_id(current_enrollment.class_id)
        
        result.append({
            "student_id": child.id,
            "student_name": child.user.full_name if child.user else "Unknown",
            "student_id_number": child.student_id,
            "date_of_birth": child.date_of_birth,
            "gender": child.gender,
            "current_class_id": current_enrollment.class_id if current_enrollment else None,
            "current_class_name": class_info.name if class_info else "Not enrolled",
            "grade_level": class_info.grade_level if class_info else None,
            "enrollment_date": current_enrollment.enrollment_date if current_enrollment else None
        })
    
    return result

@router.post("/{parent_id}/link-child", response_model=dict)
def link_parent_child(
    parent_id: int,
    student_id: int,
    relationship_type: str = "parent",
    is_primary: bool = False,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Link a parent to a child"""
    # Only admins can link parents to children
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can link parents to children"
        )
    
    db_service = DatabaseService(db)
    
    # Check if parent exists
    parent = db_service.get_parent_by_id(parent_id)
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )
    
    # Check if student exists
    student = db_service.get_student_by_id(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check if relationship already exists
    existing_relationship = db_service.db.query(ParentStudent).filter(
        ParentStudent.parent_id == parent_id,
        ParentStudent.student_id == student_id
    ).first()
    
    if existing_relationship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Relationship already exists"
        )
    
    relationship = db_service.link_parent_student(parent_id, student_id, relationship_type, is_primary)
    
    return {
        "message": "Parent-child relationship created successfully",
        "relationship_id": relationship.id
    }

@router.get("/{parent_id}/children/{student_id}/attendance", response_model=List[dict])
def get_child_attendance(
    parent_id: int,
    student_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get attendance records for a parent's child"""
    db_service = DatabaseService(db)
    
    # Check permissions
    if current_user.role == UserRole.parent:
        parent_profile = db_service.get_parent_by_user_id(current_user.id)
        if not parent_profile or parent_profile.id != parent_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own children's attendance"
            )
    
    # Verify parent-child relationship
    relationship = db_service.db.query(ParentStudent).filter(
        ParentStudent.parent_id == parent_id,
        ParentStudent.student_id == student_id
    ).first()
    
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No relationship found between parent and student"
        )
    
    attendances = db_service.get_attendance_by_student(student_id, start_date, end_date)
    
    # Convert to response format
    result = []
    for attendance in attendances:
        class_info = db_service.get_class_by_id(attendance.class_id)
        teacher = db_service.get_teacher_by_id(attendance.marked_by)
        
        result.append({
            "attendance_id": attendance.id,
            "class_id": attendance.class_id,
            "class_name": class_info.name if class_info else "Unknown",
            "date": attendance.date,
            "status": attendance.status,
            "notes": attendance.notes,
            "marked_by": attendance.marked_by,
            "marked_by_name": teacher.user.full_name if teacher and teacher.user else "Unknown"
        })
    
    return result

@router.get("/{parent_id}/children/{student_id}/grades", response_model=List[dict])
def get_child_grades(
    parent_id: int,
    student_id: int,
    subject_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get grades for a parent's child"""
    db_service = DatabaseService(db)
    
    # Check permissions
    if current_user.role == UserRole.parent:
        parent_profile = db_service.get_parent_by_user_id(current_user.id)
        if not parent_profile or parent_profile.id != parent_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own children's grades"
            )
    
    # Verify parent-child relationship
    relationship = db_service.db.query(ParentStudent).filter(
        ParentStudent.parent_id == parent_id,
        ParentStudent.student_id == student_id
    ).first()
    
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No relationship found between parent and student"
        )
    
    grades = db_service.get_grades_by_student(student_id, subject_id)
    
    # Convert to response format
    result = []
    for grade in grades:
        subject_info = db_service.get_subject_by_id(grade.subject_id)
        class_info = db_service.get_class_by_id(grade.class_id)
        teacher = db_service.get_teacher_by_id(grade.teacher_id)
        
        result.append({
            "grade_id": grade.id,
            "subject_id": grade.subject_id,
            "subject_name": subject_info.name if subject_info else "Unknown",
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

@router.get("/{parent_id}/children/{student_id}/summary", response_model=dict)
def get_child_summary(
    parent_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get a summary of a child's academic performance"""
    db_service = DatabaseService(db)
    
    # Check permissions
    if current_user.role == UserRole.parent:
        parent_profile = db_service.get_parent_by_user_id(current_user.id)
        if not parent_profile or parent_profile.id != parent_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only view your own children's summary"
            )
    
    # Verify parent-child relationship
    relationship = db_service.db.query(ParentStudent).filter(
        ParentStudent.parent_id == parent_id,
        ParentStudent.student_id == student_id
    ).first()
    
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No relationship found between parent and student"
        )
    
    student = db_service.get_student_by_id(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get current enrollment
    current_enrollment = db_service.db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.is_active == True
    ).first()
    
    class_info = None
    if current_enrollment:
        class_info = db_service.get_class_by_id(current_enrollment.class_id)
    
    # Get attendance summary (last 30 days)
    from datetime import timedelta
    end_date = date.today()
    start_date = end_date - timedelta(days=30)
    
    recent_attendances = db_service.get_attendance_by_student(student_id, start_date, end_date)
    attendance_summary = {
        "total_days": len(recent_attendances),
        "present": len([a for a in recent_attendances if a.status == "present"]),
        "absent": len([a for a in recent_attendances if a.status == "absent"]),
        "late": len([a for a in recent_attendances if a.status == "late"]),
        "excused": len([a for a in recent_attendances if a.status == "excused"])
    }
    
    # Get recent grades
    recent_grades = db_service.get_grades_by_student(student_id)
    recent_grades = recent_grades[:10]  # Last 10 grades
    
    grade_summary = {
        "total_grades": len(recent_grades),
        "average_percentage": sum([(g.grade_value / g.max_grade) * 100 for g in recent_grades]) / len(recent_grades) if recent_grades else 0,
        "recent_grades": [
            {
                "subject": db_service.get_subject_by_id(g.subject_id).name if db_service.get_subject_by_id(g.subject_id) else "Unknown",
                "grade": g.grade_value,
                "max_grade": g.max_grade,
                "percentage": (g.grade_value / g.max_grade) * 100 if g.max_grade > 0 else 0,
                "date": g.date_given
            } for g in recent_grades
        ]
    }
    
    return {
        "student": {
            "id": student.id,
            "name": student.user.full_name if student.user else "Unknown",
            "student_id": student.student_id,
            "current_class": class_info.name if class_info else "Not enrolled",
            "grade_level": class_info.grade_level if class_info else None
        },
        "attendance_summary": attendance_summary,
        "grade_summary": grade_summary
    }
