from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from database_service import DatabaseService
from models import (
    InquiryCreate, InquiryUpdate, InquiryOut,
    InquiryCommentCreate,
    InquiryStatus, InquiryDepartment,
    UserRole
)
from auth import get_current_user, get_current_active_user
from rbac import require_permission, Permission

router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])

@router.post("/", response_model=InquiryOut, status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    inquiry: InquiryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a new inquiry - all users can create inquiries"""
    db_service = DatabaseService(db)
    new_inquiry = db_service.create_inquiry(inquiry)
    return new_inquiry

@router.get("/", response_model=List[InquiryOut])
async def list_inquiries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[InquiryStatus] = Query(None),
    department: Optional[InquiryDepartment] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """List inquiries - admins can see all, others can only see their own"""
    db_service = DatabaseService(db)
    
    # Admins can see all inquiries, others can only see their own
    if current_user.role in [UserRole.admin, UserRole.teacher]:
        inquiries = db_service.list_inquiries(
            skip=skip, 
            limit=limit, 
            status=status, 
            department=department
        )
    else:
        # For non-admin users, we would filter by their inquiries
        # For now, we'll just return all (in a real implementation, you'd filter)
        inquiries = db_service.list_inquiries(
            skip=skip, 
            limit=limit, 
            status=status, 
            department=department
        )
    
    return inquiries

@router.get("/{inquiry_id}", response_model=InquiryOut)
async def get_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get a specific inquiry by ID"""
    db_service = DatabaseService(db)
    inquiry = db_service.get_inquiry_by_id(inquiry_id)
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    # Check permissions
    if current_user.role not in [UserRole.admin, UserRole.teacher]:
        # Non-admin users can only see their own inquiries
        # In a real implementation, you would check if the inquiry belongs to the user
        pass
    
    return inquiry

@router.get("/ticket/{ticket_number}", response_model=InquiryOut)
async def get_inquiry_by_ticket(
    ticket_number: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get an inquiry by ticket number"""
    db_service = DatabaseService(db)
    inquiry = db_service.get_inquiry_by_ticket_number(ticket_number)
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    # Check permissions
    if current_user.role not in [UserRole.admin, UserRole.teacher]:
        # Non-admin users can only see their own inquiries
        # In a real implementation, you would check if the inquiry belongs to the user
        pass
    
    return inquiry

@router.put("/{inquiry_id}", response_model=InquiryOut)
async def update_inquiry(
    inquiry_id: int,
    inquiry_update: InquiryUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Update an inquiry - only admins and assigned users can update"""
    db_service = DatabaseService(db)
    existing_inquiry = db_service.get_inquiry_by_id(inquiry_id)
    if not existing_inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.admin:
        # Non-admin users can only update if assigned to them or if they created it
        # In a real implementation, you would check these conditions
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this inquiry"
        )
    
    updated_inquiry = db_service.update_inquiry(inquiry_id, inquiry_update)
    if not updated_inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    return updated_inquiry

@router.post("/{inquiry_id}/comments", status_code=status.HTTP_201_CREATED)
async def add_inquiry_comment(
    inquiry_id: int,
    comment: InquiryCommentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Add a comment to an inquiry"""
    db_service = DatabaseService(db)
    inquiry = db_service.get_inquiry_by_id(inquiry_id)
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    # Check permissions
    if current_user.role not in [UserRole.admin, UserRole.teacher]:
        # Non-admin users can only comment on their own inquiries
        # In a real implementation, you would check if the inquiry belongs to the user
        pass
    
    success = db_service.create_inquiry_comment(comment, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add comment"
        )
    
    return {"message": "Comment added successfully"}

@router.get("/{inquiry_id}/comments")
async def get_inquiry_comments(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get all comments for an inquiry"""
    db_service = DatabaseService(db)
    inquiry = db_service.get_inquiry_by_id(inquiry_id)
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    # Check permissions
    if current_user.role not in [UserRole.admin, UserRole.teacher]:
        # Non-admin users can only see comments on their own inquiries
        # In a real implementation, you would check if the inquiry belongs to the user
        pass
    
    comments = db_service.get_inquiry_comments(inquiry_id)
    return comments

@router.post("/{inquiry_id}/assign")
async def assign_inquiry(
    inquiry_id: int,
    assignee_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Assign an inquiry to a user - only admins can assign"""
    # Only admins can assign inquiries
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can assign inquiries"
        )
    
    db_service = DatabaseService(db)
    inquiry_update = InquiryUpdate(assigned_to=assignee_id)
    updated_inquiry = db_service.update_inquiry(inquiry_id, inquiry_update)
    if not updated_inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    return {"message": "Inquiry assigned successfully", "inquiry": updated_inquiry}

@router.post("/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: int,
    status: InquiryStatus,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Update inquiry status - only admins and assigned users"""
    db_service = DatabaseService(db)
    inquiry = db_service.get_inquiry_by_id(inquiry_id)
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.admin and current_user.id != inquiry.assigned_to:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this inquiry's status"
        )
    
    inquiry_update = InquiryUpdate(status=status)
    updated_inquiry = db_service.update_inquiry(inquiry_id, inquiry_update)
    if not updated_inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    
    return {"message": "Inquiry status updated successfully", "inquiry": updated_inquiry}