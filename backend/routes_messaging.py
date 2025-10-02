from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from database_service import DatabaseService
from models import (
    MessageCreate, MessageOut,
    MessageGroupCreate, MessageGroupOut,
    MessageGroupMemberCreate,
    UserRole
)
from auth import get_current_user, get_current_active_user
from rbac import require_permission, Permission

router = APIRouter(prefix="/api/messages", tags=["messaging"])

@router.post("/", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Send a new message"""
    db_service = DatabaseService(db)
    
    # Validate recipients based on message type
    if message.message_type == "direct":
        if not message.recipient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Recipient ID is required for direct messages"
            )
    elif message.message_type == "group":
        if not message.group_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group ID is required for group messages"
            )
    
    new_message = db_service.create_message(message, current_user.id)
    return new_message

@router.get("/", response_model=List[MessageOut])
async def get_user_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get all messages for the current user"""
    db_service = DatabaseService(db)
    messages = db_service.get_user_messages(current_user.id, skip=skip, limit=limit)
    return messages

@router.get("/unread-count", response_model=dict)
async def get_unread_messages_count(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get count of unread messages for the current user"""
    db_service = DatabaseService(db)
    count = db_service.get_unread_messages_count(current_user.id)
    return {"unread_count": count}

@router.get("/{message_id}", response_model=MessageOut)
async def get_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get a specific message by ID"""
    db_service = DatabaseService(db)
    message = db_service.get_message_by_id(message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check if user has permission to view this message
    if message.sender_id != current_user.id and message.recipient_id != current_user.id:
        # Check if it's a group message and user is member of the group
        if message.message_type == "group":
            group_members = db_service.get_user_message_groups(current_user.id)
            if message.group_id not in [group.id for group in group_members]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this message"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this message"
            )
    
    # Mark as read if recipient is viewing it
    if message.recipient_id == current_user.id and not message.is_read:
        db_service.mark_message_as_read(message_id)
    
    return message

@router.post("/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Mark a message as read"""
    db_service = DatabaseService(db)
    message = db_service.get_message_by_id(message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only recipient can mark as read
    if message.recipient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark this message as read"
        )
    
    success = db_service.mark_message_as_read(message_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return {"message": "Message marked as read"}

# Group messaging endpoints
@router.post("/groups", response_model=MessageGroupOut, status_code=status.HTTP_201_CREATED)
async def create_message_group(
    group: MessageGroupCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a new message group - only admins can create groups"""
    # Only admins can create groups
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create message groups"
        )
    
    db_service = DatabaseService(db)
    new_group = db_service.create_message_group(group, current_user.id)
    return new_group

@router.get("/groups", response_model=List[MessageGroupOut])
async def get_user_groups(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get all message groups for the current user"""
    db_service = DatabaseService(db)
    groups = db_service.get_user_message_groups(current_user.id)
    return groups

@router.get("/groups/{group_id}", response_model=MessageGroupOut)
async def get_message_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get a specific message group by ID"""
    db_service = DatabaseService(db)
    group = db_service.get_message_group_by_id(group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message group not found"
        )
    
    # Check if user is member of this group
    user_groups = db_service.get_user_message_groups(current_user.id)
    if group_id not in [g.id for g in user_groups]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this group"
        )
    
    return group

@router.post("/groups/{group_id}/members", status_code=status.HTTP_201_CREATED)
async def add_user_to_group(
    group_id: int,
    member: MessageGroupMemberCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Add a user to a message group - only group admins or system admins"""
    db_service = DatabaseService(db)
    
    # Check if group exists
    group = db_service.get_message_group_by_id(group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message group not found"
        )
    
    # Only group creator or system admin can add members
    if current_user.role != UserRole.admin and group.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add members to this group"
        )
    
    # Add user to group
    member.group_id = group_id
    success = db_service.add_user_to_group(member)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add user to group"
        )
    
    return {"message": "User added to group successfully"}

# Support channel endpoints
@router.post("/support", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def send_support_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Send a message to the support channel"""
    # Set message type to support
    message.message_type = "support"
    
    db_service = DatabaseService(db)
    # In a real implementation, you would:
    # 1. Find or create the support group
    # 2. Add the user to the support group if not already a member
    # 3. Send the message to the support group
    
    # For now, we'll just create a regular message with support type
    new_message = db_service.create_message(message, current_user.id)
    return new_message