from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta

from database import get_db
from database_service import DatabaseService
from models import (
    FinancialTransactionCreate, FinancialTransactionOut,
    InventoryItemCreate, InventoryItemUpdate, InventoryItemOut,
    InventoryLogCreate, InventoryLogOut,
    FinancialTransactionType,
    UserRole
)
from auth import get_current_user, get_current_active_user
from rbac import require_permission, Permission

router = APIRouter(prefix="/api/accounting", tags=["accounting"])

# Financial transaction endpoints
@router.post("/transactions", response_model=FinancialTransactionOut, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: FinancialTransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a new financial transaction - only admins and finance staff"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create financial transactions"
        )
    
    db_service = DatabaseService(db)
    new_transaction = db_service.create_financial_transaction(transaction, current_user.id)
    return new_transaction

@router.get("/transactions", response_model=List[FinancialTransactionOut])
async def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    transaction_type: Optional[FinancialTransactionType] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """List financial transactions - only admins and finance staff"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view financial transactions"
        )
    
    db_service = DatabaseService(db)
    transactions = db_service.get_financial_transactions(
        skip=skip, 
        limit=limit, 
        transaction_type=transaction_type
    )
    return transactions

# Inventory management endpoints
@router.post("/inventory", response_model=InventoryItemOut, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    item: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a new inventory item - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage inventory"
        )
    
    db_service = DatabaseService(db)
    new_item = db_service.create_inventory_item(item)
    return new_item

@router.get("/inventory", response_model=List[InventoryItemOut])
async def list_inventory_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """List inventory items - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view inventory"
        )
    
    db_service = DatabaseService(db)
    items = db_service.list_inventory_items(
        skip=skip, 
        limit=limit, 
        category=category, 
        status=status
    )
    return items

@router.get("/inventory/{item_id}", response_model=InventoryItemOut)
async def get_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get a specific inventory item - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view inventory"
        )
    
    db_service = DatabaseService(db)
    item = db_service.get_inventory_item_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    return item

@router.put("/inventory/{item_id}", response_model=InventoryItemOut)
async def update_inventory_item(
    item_id: int,
    item_update: InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Update an inventory item - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage inventory"
        )
    
    db_service = DatabaseService(db)
    updated_item = db_service.update_inventory_item(item_id, item_update)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    return updated_item

@router.delete("/inventory/{item_id}")
async def delete_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Delete an inventory item - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage inventory"
        )
    
    db_service = DatabaseService(db)
    success = db_service.delete_inventory_item(item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    return {"message": "Inventory item deleted successfully"}

@router.post("/inventory/{item_id}/log", response_model=InventoryLogOut, status_code=status.HTTP_201_CREATED)
async def create_inventory_log(
    item_id: int,
    log: InventoryLogCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create an inventory log entry - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage inventory"
        )
    
    db_service = DatabaseService(db)
    # Ensure the item_id in the log matches the path parameter
    log.item_id = item_id
    new_log = db_service.create_inventory_log(log, current_user.id)
    return new_log

@router.get("/inventory/{item_id}/logs", response_model=List[InventoryLogOut])
async def get_inventory_logs(
    item_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get inventory logs for an item - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view inventory logs"
        )
    
    db_service = DatabaseService(db)
    logs = db_service.get_inventory_logs(item_id=item_id, skip=skip, limit=limit)
    return logs

# Reporting endpoints
@router.get("/reports/weekly-activity")
async def get_weekly_activity_report(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Generate weekly activity report - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access reports"
        )
    
    db_service = DatabaseService(db)
    # Calculate date range (previous week)
    end_date = date.today()
    start_date = end_date - timedelta(days=7)
    
    report = db_service.get_weekly_activity_report(start_date, end_date)
    return report

@router.get("/reports/weekly-financial")
async def get_weekly_financial_report(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Generate weekly financial report - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access financial reports"
        )
    
    db_service = DatabaseService(db)
    # Calculate date range (previous week)
    end_date = date.today()
    start_date = end_date - timedelta(days=7)
    
    report = db_service.get_weekly_financial_report(start_date, end_date)
    return report

@router.get("/reports/weekly-inventory")
async def get_weekly_inventory_report(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Generate weekly inventory report - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access inventory reports"
        )
    
    db_service = DatabaseService(db)
    # Report as of today
    report_date = date.today()
    
    report = db_service.get_weekly_inventory_report(report_date)
    return report

@router.get("/reports/dashboard")
async def get_accounting_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get real-time dashboard metrics - only admins"""
    # Check permissions
    if current_user.role not in [UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access the dashboard"
        )
    
    db_service = DatabaseService(db)
    
    # Get current metrics
    total_transactions = db_service.db.query(FinancialTransaction).count()
    total_inventory_items = db_service.db.query(InventoryItem).count()
    unread_inquiries = db_service.db.query(Inquiry).filter(Inquiry.status == "new").count()
    
    # Get recent activity
    recent_transactions = db_service.get_financial_transactions(skip=0, limit=5)
    low_stock_items = db_service.list_inventory_items(status="low_stock")
    
    return {
        "metrics": {
            "total_transactions": total_transactions,
            "total_inventory_items": total_inventory_items,
            "unread_inquiries": unread_inquiries
        },
        "recent_transactions": recent_transactions,
        "low_stock_items": low_stock_items
    }