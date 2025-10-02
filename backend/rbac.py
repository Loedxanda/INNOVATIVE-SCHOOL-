"""
Role-Based Access Control (RBAC) implementation
"""
from enum import Enum
from typing import List, Dict, Set, Optional
from functools import wraps
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserRole


class Permission(str, Enum):
    """System permissions"""
    # User Management
    CREATE_USER = "create_user"
    READ_USER = "read_user"
    UPDATE_USER = "update_user"
    DELETE_USER = "delete_user"
    
    # Student Management
    CREATE_STUDENT = "create_student"
    READ_STUDENT = "read_student"
    UPDATE_STUDENT = "update_student"
    DELETE_STUDENT = "delete_student"
    ENROLL_STUDENT = "enroll_student"
    UNENROLL_STUDENT = "unenroll_student"
    
    # Teacher Management
    CREATE_TEACHER = "create_teacher"
    READ_TEACHER = "read_teacher"
    UPDATE_TEACHER = "update_teacher"
    DELETE_TEACHER = "delete_teacher"
    ASSIGN_TEACHER = "assign_teacher"
    
    # Class Management
    CREATE_CLASS = "create_class"
    READ_CLASS = "read_class"
    UPDATE_CLASS = "update_class"
    DELETE_CLASS = "delete_class"
    MANAGE_CLASS_ENROLLMENT = "manage_class_enrollment"
    
    # Subject Management
    CREATE_SUBJECT = "create_subject"
    READ_SUBJECT = "read_subject"
    UPDATE_SUBJECT = "update_subject"
    DELETE_SUBJECT = "delete_subject"
    
    # Attendance Management
    MARK_ATTENDANCE = "mark_attendance"
    READ_ATTENDANCE = "read_attendance"
    UPDATE_ATTENDANCE = "update_attendance"
    DELETE_ATTENDANCE = "delete_attendance"
    VIEW_ATTENDANCE_REPORTS = "view_attendance_reports"
    
    # Grade Management
    CREATE_GRADE = "create_grade"
    READ_GRADE = "read_grade"
    UPDATE_GRADE = "update_grade"
    DELETE_GRADE = "delete_grade"
    VIEW_GRADE_REPORTS = "view_grade_reports"
    GENERATE_REPORT_CARD = "generate_report_card"
    
    # Parent Management
    CREATE_PARENT = "create_parent"
    READ_PARENT = "read_parent"
    UPDATE_PARENT = "update_parent"
    DELETE_PARENT = "delete_parent"
    LINK_PARENT_STUDENT = "link_parent_student"
    
    # Notification Management
    CREATE_NOTIFICATION = "create_notification"
    READ_NOTIFICATION = "read_notification"
    UPDATE_NOTIFICATION = "update_notification"
    DELETE_NOTIFICATION = "delete_notification"
    SEND_NOTIFICATION = "send_notification"
    
    # System Administration
    VIEW_SYSTEM_LOGS = "view_system_logs"
    MANAGE_SYSTEM_SETTINGS = "manage_system_settings"
    BACKUP_DATA = "backup_data"
    RESTORE_DATA = "restore_data"
    
    # Reports and Analytics
    VIEW_ANALYTICS = "view_analytics"
    EXPORT_DATA = "export_data"
    GENERATE_REPORTS = "generate_reports"


class Resource(str, Enum):
    """System resources"""
    USERS = "users"
    STUDENTS = "students"
    TEACHERS = "teachers"
    CLASSES = "classes"
    SUBJECTS = "subjects"
    ATTENDANCE = "attendance"
    GRADES = "grades"
    PARENTS = "parents"
    NOTIFICATIONS = "notifications"
    REPORTS = "reports"
    ANALYTICS = "analytics"
    SYSTEM = "system"


# Role-Permission Mapping
ROLE_PERMISSIONS: Dict[UserRole, Set[Permission]] = {
    UserRole.admin: {
        # Full access to all permissions
        Permission.CREATE_USER,
        Permission.READ_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.CREATE_STUDENT,
        Permission.READ_STUDENT,
        Permission.UPDATE_STUDENT,
        Permission.DELETE_STUDENT,
        Permission.ENROLL_STUDENT,
        Permission.UNENROLL_STUDENT,
        Permission.CREATE_TEACHER,
        Permission.READ_TEACHER,
        Permission.UPDATE_TEACHER,
        Permission.DELETE_TEACHER,
        Permission.ASSIGN_TEACHER,
        Permission.CREATE_CLASS,
        Permission.READ_CLASS,
        Permission.UPDATE_CLASS,
        Permission.DELETE_CLASS,
        Permission.MANAGE_CLASS_ENROLLMENT,
        Permission.CREATE_SUBJECT,
        Permission.READ_SUBJECT,
        Permission.UPDATE_SUBJECT,
        Permission.DELETE_SUBJECT,
        Permission.MARK_ATTENDANCE,
        Permission.READ_ATTENDANCE,
        Permission.UPDATE_ATTENDANCE,
        Permission.DELETE_ATTENDANCE,
        Permission.VIEW_ATTENDANCE_REPORTS,
        Permission.CREATE_GRADE,
        Permission.READ_GRADE,
        Permission.UPDATE_GRADE,
        Permission.DELETE_GRADE,
        Permission.VIEW_GRADE_REPORTS,
        Permission.GENERATE_REPORT_CARD,
        Permission.CREATE_PARENT,
        Permission.READ_PARENT,
        Permission.UPDATE_PARENT,
        Permission.DELETE_PARENT,
        Permission.LINK_PARENT_STUDENT,
        Permission.CREATE_NOTIFICATION,
        Permission.READ_NOTIFICATION,
        Permission.UPDATE_NOTIFICATION,
        Permission.DELETE_NOTIFICATION,
        Permission.SEND_NOTIFICATION,
        Permission.VIEW_SYSTEM_LOGS,
        Permission.MANAGE_SYSTEM_SETTINGS,
        Permission.BACKUP_DATA,
        Permission.RESTORE_DATA,
        Permission.VIEW_ANALYTICS,
        Permission.EXPORT_DATA,
        Permission.GENERATE_REPORTS,
    },
    
    UserRole.teacher: {
        # Teacher-specific permissions
        Permission.READ_STUDENT,
        Permission.UPDATE_STUDENT,
        Permission.READ_TEACHER,
        Permission.UPDATE_TEACHER,
        Permission.READ_CLASS,
        Permission.MANAGE_CLASS_ENROLLMENT,
        Permission.READ_SUBJECT,
        Permission.MARK_ATTENDANCE,
        Permission.READ_ATTENDANCE,
        Permission.UPDATE_ATTENDANCE,
        Permission.VIEW_ATTENDANCE_REPORTS,
        Permission.CREATE_GRADE,
        Permission.READ_GRADE,
        Permission.UPDATE_GRADE,
        Permission.DELETE_GRADE,
        Permission.VIEW_GRADE_REPORTS,
        Permission.GENERATE_REPORT_CARD,
        Permission.READ_PARENT,
        Permission.READ_NOTIFICATION,
        Permission.SEND_NOTIFICATION,
        Permission.VIEW_ANALYTICS,
        Permission.GENERATE_REPORTS,
    },
    
    UserRole.student: {
        # Student-specific permissions
        Permission.READ_STUDENT,
        Permission.UPDATE_STUDENT,
        Permission.READ_CLASS,
        Permission.READ_ATTENDANCE,
        Permission.READ_GRADE,
        Permission.VIEW_GRADE_REPORTS,
        Permission.READ_PARENT,
        Permission.READ_NOTIFICATION,
    },
    
    UserRole.parent: {
        # Parent-specific permissions
        Permission.READ_STUDENT,
        Permission.READ_CLASS,
        Permission.READ_ATTENDANCE,
        Permission.VIEW_ATTENDANCE_REPORTS,
        Permission.READ_GRADE,
        Permission.VIEW_GRADE_REPORTS,
        Permission.READ_PARENT,
        Permission.UPDATE_PARENT,
        Permission.READ_NOTIFICATION,
        Permission.SEND_NOTIFICATION,
    },
}


# Resource-Permission Mapping
RESOURCE_PERMISSIONS: Dict[Resource, Set[Permission]] = {
    Resource.USERS: {
        Permission.CREATE_USER,
        Permission.READ_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
    },
    Resource.STUDENTS: {
        Permission.CREATE_STUDENT,
        Permission.READ_STUDENT,
        Permission.UPDATE_STUDENT,
        Permission.DELETE_STUDENT,
        Permission.ENROLL_STUDENT,
        Permission.UNENROLL_STUDENT,
    },
    Resource.TEACHERS: {
        Permission.CREATE_TEACHER,
        Permission.READ_TEACHER,
        Permission.UPDATE_TEACHER,
        Permission.DELETE_TEACHER,
        Permission.ASSIGN_TEACHER,
    },
    Resource.CLASSES: {
        Permission.CREATE_CLASS,
        Permission.READ_CLASS,
        Permission.UPDATE_CLASS,
        Permission.DELETE_CLASS,
        Permission.MANAGE_CLASS_ENROLLMENT,
    },
    Resource.SUBJECTS: {
        Permission.CREATE_SUBJECT,
        Permission.READ_SUBJECT,
        Permission.UPDATE_SUBJECT,
        Permission.DELETE_SUBJECT,
    },
    Resource.ATTENDANCE: {
        Permission.MARK_ATTENDANCE,
        Permission.READ_ATTENDANCE,
        Permission.UPDATE_ATTENDANCE,
        Permission.DELETE_ATTENDANCE,
        Permission.VIEW_ATTENDANCE_REPORTS,
    },
    Resource.GRADES: {
        Permission.CREATE_GRADE,
        Permission.READ_GRADE,
        Permission.UPDATE_GRADE,
        Permission.DELETE_GRADE,
        Permission.VIEW_GRADE_REPORTS,
        Permission.GENERATE_REPORT_CARD,
    },
    Resource.PARENTS: {
        Permission.CREATE_PARENT,
        Permission.READ_PARENT,
        Permission.UPDATE_PARENT,
        Permission.DELETE_PARENT,
        Permission.LINK_PARENT_STUDENT,
    },
    Resource.NOTIFICATIONS: {
        Permission.CREATE_NOTIFICATION,
        Permission.READ_NOTIFICATION,
        Permission.UPDATE_NOTIFICATION,
        Permission.DELETE_NOTIFICATION,
        Permission.SEND_NOTIFICATION,
    },
    Resource.REPORTS: {
        Permission.VIEW_ANALYTICS,
        Permission.EXPORT_DATA,
        Permission.GENERATE_REPORTS,
    },
    Resource.ANALYTICS: {
        Permission.VIEW_ANALYTICS,
        Permission.EXPORT_DATA,
    },
    Resource.SYSTEM: {
        Permission.VIEW_SYSTEM_LOGS,
        Permission.MANAGE_SYSTEM_SETTINGS,
        Permission.BACKUP_DATA,
        Permission.RESTORE_DATA,
    },
}


class RBACService:
    """Role-Based Access Control Service"""
    
    @staticmethod
    def get_user_permissions(user_role: UserRole) -> Set[Permission]:
        """Get permissions for a user role"""
        return ROLE_PERMISSIONS.get(user_role, set())
    
    @staticmethod
    def has_permission(user_role: UserRole, permission: Permission) -> bool:
        """Check if a user role has a specific permission"""
        user_permissions = RBACService.get_user_permissions(user_role)
        return permission in user_permissions
    
    @staticmethod
    def has_any_permission(user_role: UserRole, permissions: List[Permission]) -> bool:
        """Check if a user role has any of the specified permissions"""
        user_permissions = RBACService.get_user_permissions(user_role)
        return any(permission in user_permissions for permission in permissions)
    
    @staticmethod
    def has_all_permissions(user_role: UserRole, permissions: List[Permission]) -> bool:
        """Check if a user role has all of the specified permissions"""
        user_permissions = RBACService.get_user_permissions(user_role)
        return all(permission in user_permissions for permission in permissions)
    
    @staticmethod
    def get_resource_permissions(resource: Resource) -> Set[Permission]:
        """Get permissions for a resource"""
        return RESOURCE_PERMISSIONS.get(resource, set())
    
    @staticmethod
    def can_access_resource(user_role: UserRole, resource: Resource) -> bool:
        """Check if a user role can access a resource"""
        user_permissions = RBACService.get_user_permissions(user_role)
        resource_permissions = RBACService.get_resource_permissions(resource)
        return bool(user_permissions.intersection(resource_permissions))
    
    @staticmethod
    def get_accessible_resources(user_role: UserRole) -> List[Resource]:
        """Get list of resources accessible to a user role"""
        accessible_resources = []
        for resource, permissions in RESOURCE_PERMISSIONS.items():
            if RBACService.can_access_resource(user_role, resource):
                accessible_resources.append(resource)
        return accessible_resources


def require_permission(permission: Permission):
    """Decorator to require a specific permission"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get current user from kwargs or dependencies
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            if not RBACService.has_permission(current_user.role, permission):
                raise HTTPException(
                    status_code=403, 
                    detail=f"Permission denied. Required permission: {permission.value}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_any_permission(permissions: List[Permission]):
    """Decorator to require any of the specified permissions"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            if not RBACService.has_any_permission(current_user.role, permissions):
                raise HTTPException(
                    status_code=403, 
                    detail=f"Permission denied. Required any of: {[p.value for p in permissions]}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_all_permissions(permissions: List[Permission]):
    """Decorator to require all of the specified permissions"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            if not RBACService.has_all_permissions(current_user.role, permissions):
                raise HTTPException(
                    status_code=403, 
                    detail=f"Permission denied. Required all of: {[p.value for p in permissions]}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_resource_access(resource: Resource):
    """Decorator to require access to a specific resource"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            if not RBACService.can_access_resource(current_user.role, resource):
                raise HTTPException(
                    status_code=403, 
                    detail=f"Access denied to resource: {resource.value}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def check_permission(user_role: UserRole, permission: Permission) -> bool:
    """Check if a user role has a specific permission (utility function)"""
    return RBACService.has_permission(user_role, permission)


def check_resource_access(user_role: UserRole, resource: Resource) -> bool:
    """Check if a user role can access a specific resource (utility function)"""
    return RBACService.can_access_resource(user_role, resource)


# Permission checking functions for use in route handlers
def can_manage_students(user_role: UserRole) -> bool:
    """Check if user can manage students"""
    return RBACService.has_any_permission(user_role, [
        Permission.CREATE_STUDENT,
        Permission.UPDATE_STUDENT,
        Permission.DELETE_STUDENT,
        Permission.ENROLL_STUDENT,
        Permission.UNENROLL_STUDENT,
    ])


def can_manage_teachers(user_role: UserRole) -> bool:
    """Check if user can manage teachers"""
    return RBACService.has_any_permission(user_role, [
        Permission.CREATE_TEACHER,
        Permission.UPDATE_TEACHER,
        Permission.DELETE_TEACHER,
        Permission.ASSIGN_TEACHER,
    ])


def can_manage_classes(user_role: UserRole) -> bool:
    """Check if user can manage classes"""
    return RBACService.has_any_permission(user_role, [
        Permission.CREATE_CLASS,
        Permission.UPDATE_CLASS,
        Permission.DELETE_CLASS,
        Permission.MANAGE_CLASS_ENROLLMENT,
    ])


def can_manage_attendance(user_role: UserRole) -> bool:
    """Check if user can manage attendance"""
    return RBACService.has_any_permission(user_role, [
        Permission.MARK_ATTENDANCE,
        Permission.UPDATE_ATTENDANCE,
        Permission.DELETE_ATTENDANCE,
    ])


def can_manage_grades(user_role: UserRole) -> bool:
    """Check if user can manage grades"""
    return RBACService.has_any_permission(user_role, [
        Permission.CREATE_GRADE,
        Permission.UPDATE_GRADE,
        Permission.DELETE_GRADE,
    ])


def can_view_reports(user_role: UserRole) -> bool:
    """Check if user can view reports"""
    return RBACService.has_any_permission(user_role, [
        Permission.VIEW_ATTENDANCE_REPORTS,
        Permission.VIEW_GRADE_REPORTS,
        Permission.VIEW_ANALYTICS,
        Permission.GENERATE_REPORTS,
    ])


def can_manage_system(user_role: UserRole) -> bool:
    """Check if user can manage system settings"""
    return RBACService.has_any_permission(user_role, [
        Permission.MANAGE_SYSTEM_SETTINGS,
        Permission.BACKUP_DATA,
        Permission.RESTORE_DATA,
        Permission.VIEW_SYSTEM_LOGS,
    ])

