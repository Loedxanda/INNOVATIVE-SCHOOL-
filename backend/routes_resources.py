from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from database_service import DatabaseService
from models import (
    ResourceCreate, ResourceUpdate, ResourceOut,
    ResourceRatingCreate, ResourceRatingOut,
    ResourceCommentCreate, ResourceCommentOut,
    UserRole
)
from auth import get_current_user, get_current_active_user
from rbac import require_permission, Permission

router = APIRouter(prefix="/api/resources", tags=["resources"])

@router.post("/", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a new resource - only teachers can upload resources"""
    # Only teachers can create resources
    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can upload resources"
        )
    
    # Get teacher profile
    db_service = DatabaseService(db)
    teacher = db_service.get_teacher_by_user_id(current_user.id)
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher profile not found"
        )
    
    new_resource = db_service.create_resource(resource, teacher.id)
    return new_resource

@router.get("/", response_model=List[ResourceOut])
async def list_resources(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    subject_id: Optional[int] = Query(None),
    grade_level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """List all resources - all logged-in users can view"""
    db_service = DatabaseService(db)
    resources = db_service.list_resources(
        skip=skip, 
        limit=limit, 
        subject_id=subject_id, 
        grade_level=grade_level
    )
    return resources

@router.get("/{resource_id}", response_model=ResourceOut)
async def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get a specific resource by ID"""
    db_service = DatabaseService(db)
    resource = db_service.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    return resource

@router.put("/{resource_id}", response_model=ResourceOut)
async def update_resource(
    resource_id: int,
    resource_update: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Update a resource - only the uploader or admin can update"""
    db_service = DatabaseService(db)
    existing_resource = db_service.get_resource_by_id(resource_id)
    if not existing_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    # Check permissions - only uploader or admin can update
    if current_user.role != UserRole.admin:
        teacher = db_service.get_teacher_by_user_id(current_user.id)
        if not teacher or teacher.id != existing_resource.uploaded_by:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this resource"
            )
    
    updated_resource = db_service.update_resource(resource_id, resource_update)
    if not updated_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    return updated_resource

@router.delete("/{resource_id}")
async def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Delete a resource - only the uploader or admin can delete"""
    db_service = DatabaseService(db)
    existing_resource = db_service.get_resource_by_id(resource_id)
    if not existing_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    # Check permissions - only uploader or admin can delete
    if current_user.role != UserRole.admin:
        teacher = db_service.get_teacher_by_user_id(current_user.id)
        if not teacher or teacher.id != existing_resource.uploaded_by:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this resource"
            )
    
    success = db_service.delete_resource(resource_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    return {"message": "Resource deleted successfully"}

@router.post("/{resource_id}/ratings", response_model=ResourceRatingOut)
async def rate_resource(
    resource_id: int,
    rating: ResourceRatingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Rate a resource - all users can rate"""
    # Validate rating value
    if rating.rating < 1 or rating.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    db_service = DatabaseService(db)
    resource_rating = db_service.create_resource_rating(rating, current_user.id)
    return resource_rating

@router.get("/{resource_id}/ratings", response_model=List[ResourceRatingOut])
async def get_resource_ratings(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get all ratings for a resource"""
    db_service = DatabaseService(db)
    ratings = db_service.get_resource_ratings(resource_id)
    return ratings

@router.post("/{resource_id}/comments", response_model=ResourceCommentOut)
async def comment_on_resource(
    resource_id: int,
    comment: ResourceCommentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Comment on a resource - all users can comment"""
    db_service = DatabaseService(db)
    resource_comment = db_service.create_resource_comment(comment, current_user.id)
    return resource_comment

@router.get("/{resource_id}/comments", response_model=List[ResourceCommentOut])
async def get_resource_comments(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get all comments for a resource"""
    db_service = DatabaseService(db)
    comments = db_service.get_resource_comments(resource_id)
    return comments

@router.post("/upload")
async def upload_resource_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Upload a resource file - only teachers can upload files"""
    # Only teachers can upload files
    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can upload files"
        )
    
    # In a real implementation, you would:
    # 1. Validate file type and size
    # 2. Save file to storage (cloud storage, local filesystem, etc.)
    # 3. Generate a URL for the file
    # 4. Return the URL to be used when creating a resource
    
    # For now, we'll just return a placeholder
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "message": "File uploaded successfully. In a real implementation, this would return a URL to use when creating a resource."
    }