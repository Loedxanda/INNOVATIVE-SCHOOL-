from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta

from database import get_db
from database_service import DatabaseService
from models import Attendance, AttendanceStatus, UserOut, UserRole, ClassAssignment, Student, ParentStudent
from auth import get_current_user

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.post("/mark", response_model=dict)
def mark_attendance(
    student_id: int,
    class_id: int,
    date: date,
    status: AttendanceStatus,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Mark attendance for a student"""
    # Only teachers can mark attendance
    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can mark attendance"
        )
    
    db_service = DatabaseService(db)
    
    # Get teacher profile
    teacher = db_service.get_teacher_by_user_id(current_user.id)
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found"
        )
    
    # Verify teacher is assigned to the class
    assignment = db_service.db.query(ClassAssignment).filter(
        ClassAssignment.teacher_id == teacher.id,
        ClassAssignment.class_id == class_id,
        ClassAssignment.is_active == True
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher is not assigned to this class"
        )
    
    # Check if attendance already exists for this date
    existing_attendance = db_service.db.query(Attendance).filter(
        Attendance.student_id == student_id,
        Attendance.class_id == class_id,
        Attendance.date == date
    ).first()
    
    if existing_attendance:
        # Update existing attendance
        existing_attendance.status = status
        existing_attendance.notes = notes
        existing_attendance.marked_by = teacher.id
        db_service.db.commit()
        return {"message": "Attendance updated successfully", "attendance_id": existing_attendance.id}
    else:
        # Create new attendance record
        attendance = db_service.mark_attendance(
            student_id=student_id,
            class_id=class_id,
            date=date,
            status=status,
            notes=notes,
            marked_by=teacher.id
        )
        return {"message": "Attendance marked successfully", "attendance_id": attendance.id}

@router.post("/mark-bulk", response_model=dict)
def mark_bulk_attendance(
    class_id: int,
    date: date,
    attendance_data: List[dict],  # [{"student_id": 1, "status": "present", "notes": "..."}]
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Mark attendance for multiple students at once"""
    # Only teachers can mark attendance
    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can mark attendance"
        )
    
    db_service = DatabaseService(db)
    
    # Get teacher profile
    teacher = db_service.get_teacher_by_user_id(current_user.id)
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found"
        )
    
    # Verify teacher is assigned to the class
    assignment = db_service.db.query(ClassAssignment).filter(
        ClassAssignment.teacher_id == teacher.id,
        ClassAssignment.class_id == class_id,
        ClassAssignment.is_active == True
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher is not assigned to this class"
        )
    
    # Process each attendance record
    results = []
    for record in attendance_data:
        student_id = record.get("student_id")
        status = record.get("status")
        notes = record.get("notes")
        
        if not student_id or not status:
            continue
        
        try:
            # Check if attendance already exists
            existing_attendance = db_service.db.query(Attendance).filter(
                Attendance.student_id == student_id,
                Attendance.class_id == class_id,
                Attendance.date == date
            ).first()
            
            if existing_attendance:
                # Update existing attendance
                existing_attendance.status = status
                existing_attendance.notes = notes
                existing_attendance.marked_by = teacher.id
                db_service.db.commit()
                results.append({"student_id": student_id, "status": "updated", "attendance_id": existing_attendance.id})
            else:
                # Create new attendance record
                attendance = db_service.mark_attendance(
                    student_id=student_id,
                    class_id=class_id,
                    date=date,
                    status=status,
                    notes=notes,
                    marked_by=teacher.id
                )
                results.append({"student_id": student_id, "status": "created", "attendance_id": attendance.id})
        except Exception as e:
            results.append({"student_id": student_id, "status": "error", "error": str(e)})
    
    return {
        "message": "Bulk attendance marking completed",
        "results": results,
        "total_processed": len(results)
    }

@router.get("/class/{class_id}", response_model=List[dict])
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
    
    # Check permissions
    if current_user.role == UserRole.teacher:
        teacher = db_service.get_teacher_by_user_id(current_user.id)
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher profile not found"
            )
        
        # Verify teacher is assigned to the class
        assignment = db_service.db.query(ClassAssignment).filter(
            ClassAssignment.teacher_id == teacher.id,
            ClassAssignment.class_id == class_id,
            ClassAssignment.is_active == True
        ).first()
        
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Teacher is not assigned to this class"
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

@router.get("/student/{student_id}", response_model=List[dict])
def get_student_attendance(
    student_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    class_id: Optional[int] = Query(None),
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
    elif current_user.role == UserRole.parent:
        parent_profile = db_service.get_parent_by_user_id(current_user.id)
        if not parent_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent profile not found"
            )
        
        # Check if parent has relationship with student
        relationship = db_service.db.query(ParentStudent).filter(
            ParentStudent.parent_id == parent_profile.id,
            ParentStudent.student_id == student_id
        ).first()
        
        if not relationship:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No relationship found with this student"
            )
    
    # Get attendance records
    attendances = db_service.get_attendance_by_student(student_id, start_date, end_date)
    
    # Filter by class if specified
    if class_id:
        attendances = [a for a in attendances if a.class_id == class_id]
    
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

@router.get("/reports/summary", response_model=dict)
def get_attendance_summary(
    class_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get attendance summary report"""
    # Only teachers and admins can view reports
    if current_user.role not in [UserRole.teacher, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and administrators can view attendance reports"
        )
    
    db_service = DatabaseService(db)
    
    # Set default date range if not provided
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Build query
    query = db_service.db.query(Attendance).filter(
        Attendance.date >= start_date,
        Attendance.date <= end_date
    )
    
    if class_id:
        query = query.filter(Attendance.class_id == class_id)
    
    attendances = query.all()
    
    # Calculate summary statistics
    total_records = len(attendances)
    present_count = len([a for a in attendances if a.status == "present"])
    absent_count = len([a for a in attendances if a.status == "absent"])
    late_count = len([a for a in attendances if a.status == "late"])
    excused_count = len([a for a in attendances if a.status == "excused"])
    
    # Calculate attendance rate
    attendance_rate = (present_count / total_records * 100) if total_records > 0 else 0
    
    # Get unique students
    student_ids = list(set([a.student_id for a in attendances]))
    
    # Get student details
    students = db_service.db.query(Student).filter(Student.id.in_(student_ids)).all()
    student_summary = []
    
    for student in students:
        student_attendances = [a for a in attendances if a.student_id == student.id]
        student_present = len([a for a in student_attendances if a.status == "present"])
        student_total = len(student_attendances)
        student_rate = (student_present / student_total * 100) if student_total > 0 else 0
        
        student_summary.append({
            "student_id": student.id,
            "student_name": student.user.full_name if student.user else "Unknown",
            "student_id_number": student.student_id,
            "total_days": student_total,
            "present_days": student_present,
            "attendance_rate": round(student_rate, 2)
        })
    
    return {
        "summary": {
            "total_records": total_records,
            "present_count": present_count,
            "absent_count": absent_count,
            "late_count": late_count,
            "excused_count": excused_count,
            "attendance_rate": round(attendance_rate, 2)
        },
        "date_range": {
            "start_date": start_date,
            "end_date": end_date
        },
        "students": student_summary
    }

@router.get("/reports/daily", response_model=List[dict])
def get_daily_attendance_report(
    date: date,
    class_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    """Get daily attendance report"""
    # Only teachers and admins can view reports
    if current_user.role not in [UserRole.teacher, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and administrators can view attendance reports"
        )
    
    db_service = DatabaseService(db)
    
    # Build query
    query = db_service.db.query(Attendance).filter(Attendance.date == date)
    
    if class_id:
        query = query.filter(Attendance.class_id == class_id)
    
    attendances = query.all()
    
    # Convert to response format
    result = []
    for attendance in attendances:
        student = db_service.get_student_by_id(attendance.student_id)
        class_info = db_service.get_class_by_id(attendance.class_id)
        teacher = db_service.get_teacher_by_id(attendance.marked_by)
        
        if student:
            result.append({
                "attendance_id": attendance.id,
                "student_id": student.id,
                "student_name": student.user.full_name if student.user else "Unknown",
                "student_id_number": student.student_id,
                "class_id": attendance.class_id,
                "class_name": class_info.name if class_info else "Unknown",
                "status": attendance.status,
                "notes": attendance.notes,
                "marked_by": attendance.marked_by,
                "marked_by_name": teacher.user.full_name if teacher and teacher.user else "Unknown"
            })
    
    return result
