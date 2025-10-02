from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from datetime import datetime, date
from database import get_db
from models import (
    User, Student, Teacher, Parent, Subject, Class, Enrollment, 
    ClassAssignment, Attendance, Grade, ParentStudent,
    UserCreate, UserUpdate, UserOut, StudentCreate, StudentOut,
    TeacherCreate, TeacherOut, ParentCreate, ParentOut,
    UserRole, Gender, AttendanceStatus, GradeLevel,
    Resource, ResourceCreate, ResourceUpdate, ResourceOut,
    ResourceRating, ResourceRatingCreate, ResourceRatingOut,
    ResourceComment, ResourceCommentCreate, ResourceCommentOut,
    Message, MessageCreate, MessageOut,
    MessageGroup, MessageGroupCreate, MessageGroupOut,
    MessageGroupMember, MessageGroupMemberCreate,
    Inquiry, InquiryCreate, InquiryUpdate, InquiryOut,
    InquiryComment, InquiryCommentCreate,
    FinancialTransaction, FinancialTransactionCreate, FinancialTransactionOut,
    InventoryItem, InventoryItemCreate, InventoryItemUpdate, InventoryItemOut,
    InventoryLog, InventoryLogCreate, InventoryLogOut,
    ResourceCategory, MessageType, InquiryStatus, InquiryDepartment,
    FinancialTransactionType
)
from auth import get_password_hash, verify_password

class DatabaseService:
    def __init__(self, db: Session):
        self.db = db

    # User Management
    def create_user(self, user: UserCreate) -> UserOut:
        """Create a new user"""
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            role=user.role
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return UserOut.model_validate(db_user)

    def get_user_by_id(self, user_id: int) -> Optional[UserOut]:
        """Get user by ID"""
        user = self.db.query(User).filter(User.id == user_id).first()
        return UserOut.model_validate(user) if user else None

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email (returns full User object for auth)"""
        return self.db.query(User).filter(User.email == email).first()

    def update_user(self, user_id: int, user_update: UserUpdate) -> Optional[UserOut]:
        """Update user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return UserOut.model_validate(user)

    def delete_user(self, user_id: int) -> bool:
        """Delete user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        self.db.delete(user)
        self.db.commit()
        return True

    def list_users(self, skip: int = 0, limit: int = 100) -> List[UserOut]:
        """List all users with pagination"""
        users = self.db.query(User).offset(skip).limit(limit).all()
        return [UserOut.model_validate(user) for user in users]

    # Student Management
    def create_student(self, student: StudentCreate) -> StudentOut:
        """Create a new student"""
        db_student = Student(**student.model_dump())
        self.db.add(db_student)
        self.db.commit()
        self.db.refresh(db_student)
        return StudentOut.model_validate(db_student)

    def get_student_by_id(self, student_id: int) -> Optional[StudentOut]:
        """Get student by ID"""
        student = self.db.query(Student).filter(Student.id == student_id).first()
        return StudentOut.model_validate(student) if student else None

    def get_student_by_user_id(self, user_id: int) -> Optional[StudentOut]:
        """Get student by user ID"""
        student = self.db.query(Student).filter(Student.user_id == user_id).first()
        return StudentOut.model_validate(student) if student else None

    def list_students(self, skip: int = 0, limit: int = 100) -> List[StudentOut]:
        """List all students with pagination"""
        students = self.db.query(Student).offset(skip).limit(limit).all()
        return [StudentOut.model_validate(student) for student in students]

    # Teacher Management
    def create_teacher(self, teacher: TeacherCreate) -> TeacherOut:
        """Create a new teacher"""
        db_teacher = Teacher(**teacher.model_dump())
        self.db.add(db_teacher)
        self.db.commit()
        self.db.refresh(db_teacher)
        return TeacherOut.model_validate(db_teacher)

    def get_teacher_by_id(self, teacher_id: int) -> Optional[TeacherOut]:
        """Get teacher by ID"""
        teacher = self.db.query(Teacher).filter(Teacher.id == teacher_id).first()
        return TeacherOut.model_validate(teacher) if teacher else None

    def get_teacher_by_user_id(self, user_id: int) -> Optional[TeacherOut]:
        """Get teacher by user ID"""
        teacher = self.db.query(Teacher).filter(Teacher.user_id == user_id).first()
        return TeacherOut.model_validate(teacher) if teacher else None

    def list_teachers(self, skip: int = 0, limit: int = 100) -> List[TeacherOut]:
        """List all teachers with pagination"""
        teachers = self.db.query(Teacher).offset(skip).limit(limit).all()
        return [TeacherOut.model_validate(teacher) for teacher in teachers]

    # Parent Management
    def create_parent(self, parent: ParentCreate) -> ParentOut:
        """Create a new parent"""
        db_parent = Parent(**parent.model_dump())
        self.db.add(db_parent)
        self.db.commit()
        self.db.refresh(db_parent)
        return ParentOut.model_validate(db_parent)

    def get_parent_by_id(self, parent_id: int) -> Optional[ParentOut]:
        """Get parent by ID"""
        parent = self.db.query(Parent).filter(Parent.id == parent_id).first()
        return ParentOut.model_validate(parent) if parent else None

    def get_parent_by_user_id(self, user_id: int) -> Optional[ParentOut]:
        """Get parent by user ID"""
        parent = self.db.query(Parent).filter(Parent.user_id == user_id).first()
        return ParentOut.model_validate(parent) if parent else None

    def list_parents(self, skip: int = 0, limit: int = 100) -> List[ParentOut]:
        """List all parents with pagination"""
        parents = self.db.query(Parent).offset(skip).limit(limit).all()
        return [ParentOut.model_validate(parent) for parent in parents]

    # Subject Management
    def create_subject(self, name: str, code: str, description: str = None) -> Subject:
        """Create a new subject"""
        db_subject = Subject(name=name, code=code, description=description)
        self.db.add(db_subject)
        self.db.commit()
        self.db.refresh(db_subject)
        return db_subject

    def get_subject_by_id(self, subject_id: int) -> Optional[Subject]:
        """Get subject by ID"""
        return self.db.query(Subject).filter(Subject.id == subject_id).first()

    def list_subjects(self, skip: int = 0, limit: int = 100) -> List[Subject]:
        """List all subjects with pagination"""
        return self.db.query(Subject).offset(skip).limit(limit).all()

    # Class Management
    def create_class(self, name: str, grade_level: GradeLevel, academic_year: str, capacity: int = 30) -> Class:
        """Create a new class"""
        db_class = Class(
            name=name,
            grade_level=grade_level,
            academic_year=academic_year,
            capacity=capacity
        )
        self.db.add(db_class)
        self.db.commit()
        self.db.refresh(db_class)
        return db_class

    def get_class_by_id(self, class_id: int) -> Optional[Class]:
        """Get class by ID"""
        return self.db.query(Class).filter(Class.id == class_id).first()

    def list_classes(self, skip: int = 0, limit: int = 100) -> List[Class]:
        """List all classes with pagination"""
        return self.db.query(Class).offset(skip).limit(limit).all()

    # Enrollment Management
    def enroll_student(self, student_id: int, class_id: int) -> Enrollment:
        """Enroll a student in a class"""
        enrollment = Enrollment(student_id=student_id, class_id=class_id)
        self.db.add(enrollment)
        self.db.commit()
        self.db.refresh(enrollment)
        return enrollment

    def get_student_enrollments(self, student_id: int) -> List[Enrollment]:
        """Get all enrollments for a student"""
        return self.db.query(Enrollment).filter(Enrollment.student_id == student_id).all()

    def get_class_enrollments(self, class_id: int) -> List[Enrollment]:
        """Get all enrollments for a class"""
        return self.db.query(Enrollment).filter(Enrollment.class_id == class_id).all()

    # Attendance Management
    def mark_attendance(self, student_id: int, class_id: int, date: date, status: AttendanceStatus, notes: str = None, marked_by: int = None) -> Attendance:
        """Mark attendance for a student"""
        attendance = Attendance(
            student_id=student_id,
            class_id=class_id,
            date=date,
            status=status,
            notes=notes,
            marked_by=marked_by
        )
        self.db.add(attendance)
        self.db.commit()
        self.db.refresh(attendance)
        return attendance

    def get_attendance_by_student(self, student_id: int, start_date: date = None, end_date: date = None) -> List[Attendance]:
        """Get attendance records for a student"""
        query = self.db.query(Attendance).filter(Attendance.student_id == student_id)
        
        if start_date:
            query = query.filter(Attendance.date >= start_date)
        if end_date:
            query = query.filter(Attendance.date <= end_date)
        
        return query.order_by(Attendance.date.desc()).all()

    def get_attendance_by_class(self, class_id: int, date: date) -> List[Attendance]:
        """Get attendance records for a class on a specific date"""
        return self.db.query(Attendance).filter(
            and_(Attendance.class_id == class_id, Attendance.date == date)
        ).all()

    # Grade Management
    def add_grade(self, student_id: int, teacher_id: int, subject_id: int, class_id: int, 
                  grade_value: float, max_grade: float = 100.0, grade_type: str = None, 
                  description: str = None) -> Grade:
        """Add a grade for a student"""
        grade = Grade(
            student_id=student_id,
            teacher_id=teacher_id,
            subject_id=subject_id,
            class_id=class_id,
            grade_value=grade_value,
            max_grade=max_grade,
            grade_type=grade_type,
            description=description
        )
        self.db.add(grade)
        self.db.commit()
        self.db.refresh(grade)
        return grade

    def get_grades_by_student(self, student_id: int, subject_id: int = None) -> List[Grade]:
        """Get grades for a student"""
        query = self.db.query(Grade).filter(Grade.student_id == student_id)
        
        if subject_id:
            query = query.filter(Grade.subject_id == subject_id)
        
        return query.order_by(Grade.date_given.desc()).all()

    def get_grades_by_class(self, class_id: int, subject_id: int = None) -> List[Grade]:
        """Get grades for a class"""
        query = self.db.query(Grade).filter(Grade.class_id == class_id)
        
        if subject_id:
            query = query.filter(Grade.subject_id == subject_id)
        
        return query.order_by(Grade.date_given.desc()).all()

    # Parent-Student Relationships
    def link_parent_student(self, parent_id: int, student_id: int, relationship_type: str = "parent", is_primary: bool = False) -> ParentStudent:
        """Link a parent to a student"""
        relationship = ParentStudent(
            parent_id=parent_id,
            student_id=student_id,
            relationship_type=relationship_type,
            is_primary=is_primary
        )
        self.db.add(relationship)
        self.db.commit()
        self.db.refresh(relationship)
        return relationship

    def get_parent_students(self, parent_id: int) -> List[StudentOut]:
        """Get all students linked to a parent"""
        relationships = self.db.query(ParentStudent).filter(ParentStudent.parent_id == parent_id).all()
        student_ids = [rel.student_id for rel in relationships]
        students = self.db.query(Student).filter(Student.id.in_(student_ids)).all()
        return [StudentOut.model_validate(student) for student in students]

    def get_student_parents(self, student_id: int) -> List[ParentOut]:
        """Get all parents linked to a student"""
        relationships = self.db.query(ParentStudent).filter(ParentStudent.student_id == student_id).all()
        parent_ids = [rel.parent_id for rel in relationships]
        parents = self.db.query(Parent).filter(Parent.id.in_(parent_ids)).all()
        return [ParentOut.model_validate(parent) for parent in parents]

    # New methods for Teacher Resource Hub
    def create_resource(self, resource: ResourceCreate, uploaded_by: int) -> ResourceOut:
        """Create a new resource"""
        db_resource = Resource(
            title=resource.title,
            description=resource.description,
            file_url=resource.file_url,
            video_url=resource.video_url,
            subject_id=resource.subject_id,
            grade_level=resource.grade_level,
            category=resource.category,
            tags=resource.tags,
            uploaded_by=uploaded_by
        )
        self.db.add(db_resource)
        self.db.commit()
        self.db.refresh(db_resource)
        return ResourceOut.model_validate(db_resource)

    def get_resource_by_id(self, resource_id: int) -> Optional[ResourceOut]:
        """Get resource by ID"""
        resource = self.db.query(Resource).filter(Resource.id == resource_id).first()
        return ResourceOut.model_validate(resource) if resource else None

    def list_resources(self, skip: int = 0, limit: int = 100, subject_id: int = None, grade_level: GradeLevel = None) -> List[ResourceOut]:
        """List all resources with optional filtering"""
        query = self.db.query(Resource)
        if subject_id:
            query = query.filter(Resource.subject_id == subject_id)
        if grade_level:
            query = query.filter(Resource.grade_level == grade_level)
        resources = query.offset(skip).limit(limit).all()
        return [ResourceOut.model_validate(resource) for resource in resources]

    def update_resource(self, resource_id: int, resource_update: ResourceUpdate) -> Optional[ResourceOut]:
        """Update resource"""
        resource = self.db.query(Resource).filter(Resource.id == resource_id).first()
        if not resource:
            return None
        
        update_data = resource_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(resource, field, value)
        
        resource.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(resource)
        return ResourceOut.model_validate(resource)

    def delete_resource(self, resource_id: int) -> bool:
        """Delete resource"""
        resource = self.db.query(Resource).filter(Resource.id == resource_id).first()
        if not resource:
            return False
        
        self.db.delete(resource)
        self.db.commit()
        return True

    def create_resource_rating(self, rating: ResourceRatingCreate, user_id: int) -> ResourceRatingOut:
        """Create a new resource rating"""
        # Check if user already rated this resource
        existing_rating = self.db.query(ResourceRating).filter(
            and_(ResourceRating.resource_id == rating.resource_id, ResourceRating.user_id == user_id)
        ).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = rating.rating
            self.db.commit()
            self.db.refresh(existing_rating)
            return ResourceRatingOut.model_validate(existing_rating)
        else:
            # Create new rating
            db_rating = ResourceRating(
                resource_id=rating.resource_id,
                user_id=user_id,
                rating=rating.rating
            )
            self.db.add(db_rating)
            self.db.commit()
            self.db.refresh(db_rating)
            return ResourceRatingOut.model_validate(db_rating)

    def get_resource_ratings(self, resource_id: int) -> List[ResourceRatingOut]:
        """Get all ratings for a resource"""
        ratings = self.db.query(ResourceRating).filter(ResourceRating.resource_id == resource_id).all()
        return [ResourceRatingOut.model_validate(rating) for rating in ratings]

    def create_resource_comment(self, comment: ResourceCommentCreate, user_id: int) -> ResourceCommentOut:
        """Create a new resource comment"""
        db_comment = ResourceComment(
            resource_id=comment.resource_id,
            user_id=user_id,
            comment=comment.comment,
            parent_comment_id=comment.parent_comment_id
        )
        self.db.add(db_comment)
        self.db.commit()
        self.db.refresh(db_comment)
        return ResourceCommentOut.model_validate(db_comment)

    def get_resource_comments(self, resource_id: int) -> List[ResourceCommentOut]:
        """Get all comments for a resource"""
        comments = self.db.query(ResourceComment).filter(ResourceComment.resource_id == resource_id).all()
        return [ResourceCommentOut.model_validate(comment) for comment in comments]

    # New methods for In-App Messaging System
    def create_message(self, message: MessageCreate, sender_id: int) -> MessageOut:
        """Create a new message"""
        db_message = Message(
            sender_id=sender_id,
            recipient_id=message.recipient_id,
            group_id=message.group_id,
            message_type=message.message_type,
            subject=message.subject,
            content=message.content
        )
        self.db.add(db_message)
        self.db.commit()
        self.db.refresh(db_message)
        return MessageOut.model_validate(db_message)

    def get_message_by_id(self, message_id: int) -> Optional[MessageOut]:
        """Get message by ID"""
        message = self.db.query(Message).filter(Message.id == message_id).first()
        return MessageOut.model_validate(message) if message else None

    def get_user_messages(self, user_id: int, skip: int = 0, limit: int = 100) -> List[MessageOut]:
        """Get all messages for a user (sent and received)"""
        messages = self.db.query(Message).filter(
            or_(Message.sender_id == user_id, Message.recipient_id == user_id)
        ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
        return [MessageOut.model_validate(message) for message in messages]

    def get_unread_messages_count(self, user_id: int) -> int:
        """Get count of unread messages for a user"""
        return self.db.query(Message).filter(
            and_(Message.recipient_id == user_id, Message.is_read == False)
        ).count()

    def mark_message_as_read(self, message_id: int) -> bool:
        """Mark a message as read"""
        message = self.db.query(Message).filter(Message.id == message_id).first()
        if not message:
            return False
        
        message.is_read = True
        self.db.commit()
        return True

    def create_message_group(self, group: MessageGroupCreate, created_by: int) -> MessageGroupOut:
        """Create a new message group"""
        db_group = MessageGroup(
            name=group.name,
            description=group.description,
            group_type=group.group_type,
            created_by=created_by
        )
        self.db.add(db_group)
        self.db.commit()
        self.db.refresh(db_group)
        return MessageGroupOut.model_validate(db_group)

    def get_message_group_by_id(self, group_id: int) -> Optional[MessageGroupOut]:
        """Get message group by ID"""
        group = self.db.query(MessageGroup).filter(MessageGroup.id == group_id).first()
        return MessageGroupOut.model_validate(group) if group else None

    def get_user_message_groups(self, user_id: int) -> List[MessageGroupOut]:
        """Get all message groups for a user"""
        groups = self.db.query(MessageGroup).join(MessageGroupMember).filter(
            MessageGroupMember.user_id == user_id
        ).all()
        return [MessageGroupOut.model_validate(group) for group in groups]

    def add_user_to_group(self, group_member: MessageGroupMemberCreate) -> bool:
        """Add a user to a message group"""
        # Check if user is already in the group
        existing_member = self.db.query(MessageGroupMember).filter(
            and_(
                MessageGroupMember.group_id == group_member.group_id,
                MessageGroupMember.user_id == group_member.user_id
            )
        ).first()
        
        if existing_member:
            return True  # Already a member
        
        db_member = MessageGroupMember(
            group_id=group_member.group_id,
            user_id=group_member.user_id,
            role=group_member.role
        )
        self.db.add(db_member)
        self.db.commit()
        return True

    # New methods for School Inquiry Management System
    def create_inquiry(self, inquiry: InquiryCreate) -> InquiryOut:
        """Create a new inquiry"""
        # Generate ticket number
        ticket_number = f"INQ-{datetime.now().strftime('%Y%m%d')}-{self.db.query(Inquiry).count() + 1:04d}"
        
        db_inquiry = Inquiry(
            ticket_number=ticket_number,
            name=inquiry.name,
            email=inquiry.email,
            subject=inquiry.subject,
            message=inquiry.message,
            department=inquiry.department,
            priority=inquiry.priority
        )
        self.db.add(db_inquiry)
        self.db.commit()
        self.db.refresh(db_inquiry)
        return InquiryOut.model_validate(db_inquiry)

    def get_inquiry_by_id(self, inquiry_id: int) -> Optional[InquiryOut]:
        """Get inquiry by ID"""
        inquiry = self.db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
        return InquiryOut.model_validate(inquiry) if inquiry else None

    def get_inquiry_by_ticket_number(self, ticket_number: str) -> Optional[InquiryOut]:
        """Get inquiry by ticket number"""
        inquiry = self.db.query(Inquiry).filter(Inquiry.ticket_number == ticket_number).first()
        return InquiryOut.model_validate(inquiry) if inquiry else None

    def list_inquiries(self, skip: int = 0, limit: int = 100, status: InquiryStatus = None, department: InquiryDepartment = None) -> List[InquiryOut]:
        """List all inquiries with optional filtering"""
        query = self.db.query(Inquiry)
        if status:
            query = query.filter(Inquiry.status == status)
        if department:
            query = query.filter(Inquiry.department == department)
        inquiries = query.order_by(Inquiry.created_at.desc()).offset(skip).limit(limit).all()
        return [InquiryOut.model_validate(inquiry) for inquiry in inquiries]

    def update_inquiry(self, inquiry_id: int, inquiry_update: InquiryUpdate) -> Optional[InquiryOut]:
        """Update inquiry"""
        inquiry = self.db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
        if not inquiry:
            return None
        
        update_data = inquiry_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(inquiry, field, value)
        
        if inquiry.status == InquiryStatus.resolved and inquiry.resolved_at is None:
            inquiry.resolved_at = datetime.utcnow()
        
        inquiry.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(inquiry)
        return InquiryOut.model_validate(inquiry)

    def create_inquiry_comment(self, comment: InquiryCommentCreate, user_id: int) -> bool:
        """Create a new inquiry comment"""
        db_comment = InquiryComment(
            inquiry_id=comment.inquiry_id,
            user_id=user_id,
            comment=comment.comment,
            is_internal=comment.is_internal
        )
        self.db.add(db_comment)
        self.db.commit()
        return True

    def get_inquiry_comments(self, inquiry_id: int) -> List[InquiryComment]:
        """Get all comments for an inquiry"""
        return self.db.query(InquiryComment).filter(InquiryComment.inquiry_id == inquiry_id).all()

    # New methods for Comprehensive Accounting and Reporting Module
    def create_financial_transaction(self, transaction: FinancialTransactionCreate, created_by: int) -> FinancialTransactionOut:
        """Create a new financial transaction"""
        db_transaction = FinancialTransaction(
            transaction_type=transaction.transaction_type,
            amount=transaction.amount,
            description=transaction.description,
            category=transaction.category,
            reference_number=transaction.reference_number,
            created_by=created_by
        )
        self.db.add(db_transaction)
        self.db.commit()
        self.db.refresh(db_transaction)
        return FinancialTransactionOut.model_validate(db_transaction)

    def get_financial_transactions(self, skip: int = 0, limit: int = 100, transaction_type: FinancialTransactionType = None) -> List[FinancialTransactionOut]:
        """Get financial transactions with optional filtering"""
        query = self.db.query(FinancialTransaction)
        if transaction_type:
            query = query.filter(FinancialTransaction.transaction_type == transaction_type)
        transactions = query.order_by(FinancialTransaction.created_at.desc()).offset(skip).limit(limit).all()
        return [FinancialTransactionOut.model_validate(transaction) for transaction in transactions]

    def get_weekly_financial_report(self, start_date: date, end_date: date) -> dict:
        """Generate weekly financial report"""
        # Get income transactions
        income_transactions = self.db.query(FinancialTransaction).filter(
            and_(
                FinancialTransaction.transaction_type == FinancialTransactionType.income,
                FinancialTransaction.created_at >= start_date,
                FinancialTransaction.created_at <= end_date
            )
        ).all()
        
        # Get expense transactions
        expense_transactions = self.db.query(FinancialTransaction).filter(
            and_(
                FinancialTransaction.transaction_type == FinancialTransactionType.expense,
                FinancialTransaction.created_at >= start_date,
                FinancialTransaction.created_at <= end_date
            )
        ).all()
        
        # Calculate totals
        total_income = sum(t.amount for t in income_transactions)
        total_expenses = sum(t.amount for t in expense_transactions)
        net_balance = total_income - total_expenses
        
        return {
            "period": f"{start_date} to {end_date}",
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_balance": net_balance,
            "income_transactions": [FinancialTransactionOut.model_validate(t) for t in income_transactions],
            "expense_transactions": [FinancialTransactionOut.model_validate(t) for t in expense_transactions]
        }

    def create_inventory_item(self, item: InventoryItemCreate) -> InventoryItemOut:
        """Create a new inventory item"""
        db_item = InventoryItem(
            name=item.name,
            description=item.description,
            category=item.category,
            quantity=item.quantity,
            unit_price=item.unit_price,
            location=item.location,
            status=item.status
        )
        # Calculate total value
        db_item.total_value = db_item.quantity * db_item.unit_price
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return InventoryItemOut.model_validate(db_item)

    def get_inventory_item_by_id(self, item_id: int) -> Optional[InventoryItemOut]:
        """Get inventory item by ID"""
        item = self.db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
        return InventoryItemOut.model_validate(item) if item else None

    def list_inventory_items(self, skip: int = 0, limit: int = 100, category: str = None, status: str = None) -> List[InventoryItemOut]:
        """List inventory items with optional filtering"""
        query = self.db.query(InventoryItem)
        if category:
            query = query.filter(InventoryItem.category == category)
        if status:
            query = query.filter(InventoryItem.status == status)
        items = query.offset(skip).limit(limit).all()
        return [InventoryItemOut.model_validate(item) for item in items]

    def update_inventory_item(self, item_id: int, item_update: InventoryItemUpdate) -> Optional[InventoryItemOut]:
        """Update inventory item"""
        item = self.db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
        if not item:
            return None
        
        update_data = item_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        
        # Recalculate total value if quantity or unit_price changed
        if 'quantity' in update_data or 'unit_price' in update_data:
            item.total_value = item.quantity * item.unit_price
        
        item.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(item)
        return InventoryItemOut.model_validate(item)

    def delete_inventory_item(self, item_id: int) -> bool:
        """Delete inventory item"""
        item = self.db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
        if not item:
            return False
        
        self.db.delete(item)
        self.db.commit()
        return True

    def create_inventory_log(self, log: InventoryLogCreate, performed_by: int) -> InventoryLogOut:
        """Create a new inventory log entry"""
        db_log = InventoryLog(
            item_id=log.item_id,
            action=log.action,
            quantity=log.quantity,
            performed_by=performed_by,
            notes=log.notes
        )
        self.db.add(db_log)
        self.db.commit()
        self.db.refresh(db_log)
        return InventoryLogOut.model_validate(db_log)

    def get_inventory_logs(self, item_id: int = None, skip: int = 0, limit: int = 100) -> List[InventoryLogOut]:
        """Get inventory logs with optional filtering by item"""
        query = self.db.query(InventoryLog)
        if item_id:
            query = query.filter(InventoryLog.item_id == item_id)
        logs = query.order_by(InventoryLog.created_at.desc()).offset(skip).limit(limit).all()
        return [InventoryLogOut.model_validate(log) for log in logs]

    def get_weekly_activity_report(self, start_date: date, end_date: date) -> dict:
        """Generate weekly activity report"""
        # Count new users
        new_users = self.db.query(User).filter(
            and_(
                User.created_at >= start_date,
                User.created_at <= end_date
            )
        ).count()
        
        # Count new resources
        new_resources = self.db.query(Resource).filter(
            and_(
                Resource.created_at >= start_date,
                Resource.created_at <= end_date
            )
        ).count()
        
        # Count messages
        new_messages = self.db.query(Message).filter(
            and_(
                Message.created_at >= start_date,
                Message.created_at <= end_date
            )
        ).count()
        
        # Count inquiries
        new_inquiries = self.db.query(Inquiry).filter(
            and_(
                Inquiry.created_at >= start_date,
                Inquiry.created_at <= end_date
            )
        ).count()
        
        return {
            "period": f"{start_date} to {end_date}",
            "new_users": new_users,
            "new_resources": new_resources,
            "messages_sent": new_messages,
            "new_inquiries": new_inquiries
        }

    def get_weekly_inventory_report(self, end_date: date) -> dict:
        """Generate weekly inventory report"""
        # Get all inventory items
        items = self.db.query(InventoryItem).all()
        
        # Categorize by status
        available_items = [item for item in items if item.status == "available"]
        checked_out_items = [item for item in items if item.status == "checked_out"]
        maintenance_items = [item for item in items if item.status == "maintenance"]
        retired_items = [item for item in items if item.status == "retired"]
        
        # Identify low stock items (less than 5 units)
        low_stock_items = [item for item in items if item.quantity < 5 and item.status == "available"]
        
        return {
            "report_date": end_date,
            "total_items": len(items),
            "available_items": len(available_items),
            "checked_out_items": len(checked_out_items),
            "maintenance_items": len(maintenance_items),
            "retired_items": len(retired_items),
            "low_stock_items": [InventoryItemOut.model_validate(item) for item in low_stock_items]
        }

# Helper function to get database service
def get_database_service(db: Session = None) -> DatabaseService:
    """Get database service instance"""
    if db is None:
        db = next(get_db())
    return DatabaseService(db)

