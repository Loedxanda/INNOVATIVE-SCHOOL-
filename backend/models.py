from enum import Enum
from typing import Optional, List
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, DateTime, Date, Boolean, Text, ForeignKey, Table, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from pydantic import BaseModel, EmailStr, Field
import uuid

# Import database base
from database import Base

# Enums
class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    parent = "parent"
    admin = "admin"

class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"

class GradeLevel(str, Enum):
    primary_1 = "primary_1"
    primary_2 = "primary_2"
    primary_3 = "primary_3"
    primary_4 = "primary_4"
    primary_5 = "primary_5"
    primary_6 = "primary_6"
    secondary_1 = "secondary_1"
    secondary_2 = "secondary_2"
    secondary_3 = "secondary_3"
    secondary_4 = "secondary_4"
    secondary_5 = "secondary_5"

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False)
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False)
    parent_profile = relationship("Parent", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    student_id = Column(String, unique=True, index=True)  # School-specific ID
    date_of_birth = Column(Date)
    gender = Column(SQLEnum(Gender))
    address = Column(Text)
    phone_number = Column(String)
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    enrollment_date = Column(Date, default=date.today)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    enrollments = relationship("Enrollment", back_populates="student")
    attendances = relationship("Attendance", back_populates="student")
    grades = relationship("Grade", back_populates="student")
    parent_relationships = relationship("ParentStudent", back_populates="student")

class Teacher(Base):
    __tablename__ = "teachers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    teacher_id = Column(String, unique=True, index=True)  # School-specific ID
    employee_id = Column(String, unique=True, index=True)
    date_of_birth = Column(Date)
    gender = Column(SQLEnum(Gender))
    address = Column(Text)
    phone_number = Column(String)
    qualification = Column(Text)
    specialization = Column(String)
    hire_date = Column(Date, default=date.today)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="teacher_profile")
    class_assignments = relationship("ClassAssignment", back_populates="teacher")
    grades = relationship("Grade", back_populates="teacher")

class Parent(Base):
    __tablename__ = "parents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    parent_id = Column(String, unique=True, index=True)  # School-specific ID
    phone_number = Column(String)
    address = Column(Text)
    occupation = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="parent_profile")
    student_relationships = relationship("ParentStudent", back_populates="parent")

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    class_assignments = relationship("ClassAssignment", back_populates="subject")
    grades = relationship("Grade", back_populates="subject")

class Class(Base):
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Grade 5A", "Form 3B"
    grade_level = Column(SQLEnum(GradeLevel), nullable=False)
    academic_year = Column(String, nullable=False)  # e.g., "2024-2025"
    capacity = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    enrollments = relationship("Enrollment", back_populates="class_")
    class_assignments = relationship("ClassAssignment", back_populates="class_")

class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    enrollment_date = Column(Date, default=date.today)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="enrollments")
    class_ = relationship("Class", back_populates="enrollments")

class ClassAssignment(Base):
    __tablename__ = "class_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    academic_year = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    teacher = relationship("Teacher", back_populates="class_assignments")
    class_ = relationship("Class", back_populates="class_assignments")
    subject = relationship("Subject", back_populates="class_assignments")

class Attendance(Base):
    __tablename__ = "attendances"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    date = Column(Date, nullable=False)
    status = Column(SQLEnum(AttendanceStatus), nullable=False)
    notes = Column(Text)
    marked_by = Column(Integer, ForeignKey("teachers.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="attendances")
    class_ = relationship("Class")
    teacher = relationship("Teacher")

class Grade(Base):
    __tablename__ = "grades"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    grade_value = Column(Float, nullable=False)
    max_grade = Column(Float, default=100.0)
    grade_type = Column(String)  # e.g., "quiz", "exam", "assignment"
    description = Column(Text)
    date_given = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="grades")
    teacher = relationship("Teacher", back_populates="grades")
    subject = relationship("Subject", back_populates="grades")
    class_ = relationship("Class")

class ParentStudent(Base):
    __tablename__ = "parent_students"
    
    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parents.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    relationship_type = Column(String, default="parent")  # parent, guardian, etc.
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    parent = relationship("Parent", back_populates="student_relationships")
    student = relationship("Student", back_populates="parent_relationships")

# New models for Teacher Resource Hub
class ResourceCategory(str, Enum):
    lesson_plan = "lesson_plan"
    worksheet = "worksheet"
    presentation = "presentation"
    video = "video"
    assessment = "assessment"
    other = "other"

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    file_url = Column(String)  # For uploaded files
    video_url = Column(String)  # For video links
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    grade_level = Column(SQLEnum(GradeLevel))
    category = Column(SQLEnum(ResourceCategory))
    tags = Column(String)  # Comma-separated tags
    uploaded_by = Column(Integer, ForeignKey("teachers.id"))
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subject = relationship("Subject")
    uploader = relationship("Teacher", backref="resources")
    ratings = relationship("ResourceRating", back_populates="resource")
    comments = relationship("ResourceComment", back_populates="resource")

class ResourceRating(Base):
    __tablename__ = "resource_ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)  # 1-5 stars
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    resource = relationship("Resource", back_populates="ratings")
    user = relationship("User")

class ResourceComment(Base):
    __tablename__ = "resource_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    comment = Column(Text, nullable=False)
    parent_comment_id = Column(Integer, ForeignKey("resource_comments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    resource = relationship("Resource", back_populates="comments")
    user = relationship("User")
    parent_comment = relationship("ResourceComment", remote_side=[id], backref="replies")

# New models for In-App Messaging System
class MessageType(str, Enum):
    direct = "direct"
    group = "group"
    support = "support"

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # For direct messages
    group_id = Column(Integer, ForeignKey("message_groups.id"), nullable=True)  # For group messages
    message_type = Column(SQLEnum(MessageType), default=MessageType.direct)
    subject = Column(String)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    group = relationship("MessageGroup", back_populates="messages")

class MessageGroup(Base):
    __tablename__ = "message_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    group_type = Column(String)  # admin, class, support, etc.
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="group")
    members = relationship("MessageGroupMember", back_populates="group")

class MessageGroupMember(Base):
    __tablename__ = "message_group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("message_groups.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String, default="member")  # member, admin, moderator
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    group = relationship("MessageGroup", back_populates="members")
    user = relationship("User")

# New models for School Inquiry Management System
class InquiryStatus(str, Enum):
    new = "new"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"

class InquiryDepartment(str, Enum):
    admissions = "admissions"
    finance = "finance"
    it = "it"
    general = "general"
    academic = "academic"

class Inquiry(Base):
    __tablename__ = "inquiries"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    department = Column(SQLEnum(InquiryDepartment))
    status = Column(SQLEnum(InquiryStatus), default=InquiryStatus.new)
    priority = Column(String, default="medium")  # low, medium, high, urgent
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    assignee = relationship("User")
    comments = relationship("InquiryComment", back_populates="inquiry")

class InquiryComment(Base):
    __tablename__ = "inquiry_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    comment = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)  # Internal notes vs. public responses
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inquiry = relationship("Inquiry", back_populates="comments")
    user = relationship("User")

# New models for Comprehensive Accounting and Reporting Module
class FinancialTransactionType(str, Enum):
    income = "income"
    expense = "expense"

class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_type = Column(SQLEnum(FinancialTransactionType))
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String)
    reference_number = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    creator = relationship("User")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    quantity = Column(Integer, default=0)
    unit_price = Column(Float, default=0.0)
    total_value = Column(Float, default=0.0)
    location = Column(String)
    status = Column(String, default="available")  # available, checked_out, maintenance, retired
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class InventoryLog(Base):
    __tablename__ = "inventory_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id"))
    action = Column(String, nullable=False)  # added, removed, checked_out, returned, maintenance
    quantity = Column(Integer, default=1)
    performed_by = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    item = relationship("InventoryItem")
    performer = relationship("User")

# Pydantic Models for API
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[UserRole] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

class StudentCreate(BaseModel):
    user_id: int
    student_id: str
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None

class StudentOut(BaseModel):
    id: int
    user_id: int
    student_id: str
    date_of_birth: Optional[date]
    gender: Optional[Gender]
    address: Optional[str]
    phone_number: Optional[str]
    emergency_contact: Optional[str]
    emergency_phone: Optional[str]
    enrollment_date: date
    is_active: bool
    created_at: datetime
    updated_at: datetime

class TeacherCreate(BaseModel):
    user_id: int
    teacher_id: str
    employee_id: str
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None

class TeacherOut(BaseModel):
    id: int
    user_id: int
    teacher_id: str
    employee_id: str
    date_of_birth: Optional[date]
    gender: Optional[Gender]
    address: Optional[str]
    phone_number: Optional[str]
    qualification: Optional[str]
    specialization: Optional[str]
    hire_date: date
    is_active: bool
    created_at: datetime
    updated_at: datetime

class TeacherUpdate(BaseModel):
    teacher_id: Optional[str] = None
    employee_id: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    is_active: Optional[bool] = None

class ParentCreate(BaseModel):
    user_id: int
    parent_id: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None

class ParentOut(BaseModel):
    id: int
    user_id: int
    parent_id: str
    phone_number: Optional[str]
    address: Optional[str]
    occupation: Optional[str]
    created_at: datetime
    updated_at: datetime

# New Pydantic models for Teacher Resource Hub
class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    video_url: Optional[str] = None
    subject_id: Optional[int] = None
    grade_level: Optional[GradeLevel] = None
    category: Optional[ResourceCategory] = None
    tags: Optional[str] = None

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    video_url: Optional[str] = None
    subject_id: Optional[int] = None
    grade_level: Optional[GradeLevel] = None
    category: Optional[ResourceCategory] = None
    tags: Optional[str] = None
    is_public: Optional[bool] = None

class ResourceOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    file_url: Optional[str]
    video_url: Optional[str]
    subject_id: Optional[int]
    grade_level: Optional[GradeLevel]
    category: Optional[ResourceCategory]
    tags: Optional[str]
    uploaded_by: int
    is_public: bool
    created_at: datetime
    updated_at: datetime

class ResourceRatingCreate(BaseModel):
    resource_id: int
    rating: int  # 1-5 stars

class ResourceRatingOut(BaseModel):
    id: int
    resource_id: int
    user_id: int
    rating: int
    created_at: datetime

class ResourceCommentCreate(BaseModel):
    resource_id: int
    comment: str
    parent_comment_id: Optional[int] = None

class ResourceCommentOut(BaseModel):
    id: int
    resource_id: int
    user_id: int
    comment: str
    parent_comment_id: Optional[int]
    created_at: datetime
    updated_at: datetime

# New Pydantic models for In-App Messaging System
class MessageCreate(BaseModel):
    recipient_id: Optional[int] = None
    group_id: Optional[int] = None
    subject: Optional[str] = None
    content: str
    message_type: MessageType = MessageType.direct

class MessageOut(BaseModel):
    id: int
    sender_id: int
    recipient_id: Optional[int]
    group_id: Optional[int]
    message_type: MessageType
    subject: Optional[str]
    content: str
    is_read: bool
    created_at: datetime

class MessageGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    group_type: str

class MessageGroupOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    group_type: str
    created_by: int
    created_at: datetime

class MessageGroupMemberCreate(BaseModel):
    group_id: int
    user_id: int
    role: Optional[str] = "member"

# New Pydantic models for School Inquiry Management System
class InquiryCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    department: InquiryDepartment
    priority: Optional[str] = "medium"

class InquiryUpdate(BaseModel):
    status: Optional[InquiryStatus] = None
    assigned_to: Optional[int] = None
    priority: Optional[str] = None

class InquiryOut(BaseModel):
    id: int
    ticket_number: str
    name: str
    email: str
    subject: str
    message: str
    department: InquiryDepartment
    status: InquiryStatus
    priority: str
    assigned_to: Optional[int]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]

class InquiryCommentCreate(BaseModel):
    inquiry_id: int
    comment: str
    is_internal: Optional[bool] = False

# New Pydantic models for Comprehensive Accounting and Reporting Module
class FinancialTransactionCreate(BaseModel):
    transaction_type: FinancialTransactionType
    amount: float
    description: str
    category: Optional[str] = None
    reference_number: Optional[str] = None

class FinancialTransactionOut(BaseModel):
    id: int
    transaction_type: FinancialTransactionType
    amount: float
    description: str
    category: Optional[str]
    reference_number: Optional[str]
    created_by: int
    created_at: datetime

class InventoryItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = 0
    unit_price: Optional[float] = 0.0
    location: Optional[str] = None
    status: Optional[str] = "available"

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    location: Optional[str] = None
    status: Optional[str] = None

class InventoryItemOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    quantity: int
    unit_price: float
    total_value: float
    location: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

class InventoryLogCreate(BaseModel):
    item_id: int
    action: str
    quantity: Optional[int] = 1
    notes: Optional[str] = None

class InventoryLogOut(BaseModel):
    id: int
    item_id: int
    action: str
    quantity: int
    performed_by: int
    notes: Optional[str]
    created_at: datetime
