"""
Performance Optimization Module for Innovative School Platform
Implements database query optimization, connection pooling, and performance monitoring
"""

import time
import logging
from typing import Any, Dict, List, Optional, Tuple, Union
from contextlib import contextmanager
from functools import wraps
import statistics
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed

from sqlalchemy import text, func, select, and_, or_
from sqlalchemy.orm import Session, joinedload, selectinload, subqueryload
from sqlalchemy.pool import QueuePool
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

@dataclass
class QueryStats:
    """Statistics for database queries"""
    query: str
    execution_time: float
    timestamp: datetime
    parameters: Dict[str, Any] = field(default_factory=dict)
    rows_affected: int = 0
    error: Optional[str] = None

@dataclass
class PerformanceMetrics:
    """Performance metrics for monitoring"""
    total_queries: int = 0
    avg_execution_time: float = 0.0
    max_execution_time: float = 0.0
    min_execution_time: float = float('inf')
    error_count: int = 0
    slow_queries: List[QueryStats] = field(default_factory=list)
    recent_queries: List[QueryStats] = field(default_factory=list)

class QueryOptimizer:
    """Database query optimization utilities"""
    
    def __init__(self, session: Session):
        self.session = session
        self.query_stats: List[QueryStats] = []
        self.slow_query_threshold = 1.0  # seconds
    
    def optimize_student_queries(self) -> Dict[str, Any]:
        """Optimize common student-related queries"""
        optimizations = {}
        
        # Optimize student list with class information
        start_time = time.time()
        students = self.session.query(Student).options(
            joinedload(Student.class_assignment).joinedload(ClassAssignment.class_info),
            joinedload(Student.parent_students).joinedload(ParentStudent.parent)
        ).all()
        execution_time = time.time() - start_time
        
        optimizations['student_list_with_class'] = {
            'execution_time': execution_time,
            'rows_returned': len(students),
            'optimization': 'joinedload for class and parent relationships'
        }
        
        return optimizations
    
    def optimize_attendance_queries(self) -> Dict[str, Any]:
        """Optimize attendance-related queries"""
        optimizations = {}
        
        # Optimize attendance summary query
        start_time = time.time()
        attendance_summary = self.session.query(
            func.count(Attendance.id).label('total_records'),
            func.count(func.case([(Attendance.status == 'present', 1)])).label('present_count'),
            func.count(func.case([(Attendance.status == 'absent', 1)])).label('absent_count')
        ).first()
        execution_time = time.time() - start_time
        
        optimizations['attendance_summary'] = {
            'execution_time': execution_time,
            'optimization': 'aggregate functions with case statements'
        }
        
        return optimizations
    
    def optimize_grade_queries(self) -> Dict[str, Any]:
        """Optimize grade-related queries"""
        optimizations = {}
        
        # Optimize gradebook query with student and subject information
        start_time = time.time()
        grades = self.session.query(Grade).options(
            joinedload(Grade.student),
            joinedload(Grade.class_assignment).joinedload(ClassAssignment.class_info),
            joinedload(Grade.subject)
        ).all()
        execution_time = time.time() - start_time
        
        optimizations['gradebook_with_details'] = {
            'execution_time': execution_time,
            'rows_returned': len(grades),
            'optimization': 'joinedload for student, class, and subject relationships'
        }
        
        return optimizations

class ConnectionPoolManager:
    """Database connection pool management"""
    
    def __init__(self, engine: Engine):
        self.engine = engine
        self.pool_config = {
            'pool_size': 20,
            'max_overflow': 30,
            'pool_pre_ping': True,
            'pool_recycle': 3600,
            'pool_timeout': 30
        }
        self._configure_pool()
    
    def _configure_pool(self):
        """Configure connection pool settings"""
        if hasattr(self.engine, 'pool'):
            self.engine.pool._recycle = self.pool_config['pool_recycle']
            self.engine.pool._pre_ping = self.pool_config['pool_pre_ping']
            self.engine.pool._timeout = self.pool_config['pool_timeout']
    
    def get_pool_status(self) -> Dict[str, Any]:
        """Get current pool status"""
        if hasattr(self.engine, 'pool'):
            pool = self.engine.pool
            return {
                'size': pool.size(),
                'checked_in': pool.checkedin(),
                'checked_out': pool.checkedout(),
                'overflow': pool.overflow(),
                'invalid': pool.invalid()
            }
        return {'error': 'Pool not available'}
    
    def optimize_pool_settings(self, expected_concurrent_users: int) -> Dict[str, Any]:
        """Optimize pool settings based on expected load"""
        # Calculate optimal pool size
        optimal_pool_size = min(expected_concurrent_users * 2, 50)
        optimal_max_overflow = min(expected_concurrent_users, 30)
        
        recommendations = {
            'current_pool_size': self.pool_config['pool_size'],
            'recommended_pool_size': optimal_pool_size,
            'current_max_overflow': self.pool_config['max_overflow'],
            'recommended_max_overflow': optimal_max_overflow,
            'expected_concurrent_users': expected_concurrent_users
        }
        
        return recommendations

class PerformanceMonitor:
    """Performance monitoring and metrics collection"""
    
    def __init__(self):
        self.metrics = PerformanceMetrics()
        self.query_stats: List[QueryStats] = []
        self.max_recent_queries = 1000
    
    def record_query(self, query: str, execution_time: float, parameters: Dict[str, Any] = None, 
                    rows_affected: int = 0, error: str = None):
        """Record query execution statistics"""
        stats = QueryStats(
            query=query,
            execution_time=execution_time,
            timestamp=datetime.now(),
            parameters=parameters or {},
            rows_affected=rows_affected,
            error=error
        )
        
        self.query_stats.append(stats)
        self.metrics.total_queries += 1
        
        # Update execution time metrics
        if execution_time > self.metrics.max_execution_time:
            self.metrics.max_execution_time = execution_time
        if execution_time < self.metrics.min_execution_time:
            self.metrics.min_execution_time = execution_time
        
        # Update average execution time
        total_time = sum(q.execution_time for q in self.query_stats)
        self.metrics.avg_execution_time = total_time / len(self.query_stats)
        
        # Track slow queries
        if execution_time > self.slow_query_threshold:
            self.metrics.slow_queries.append(stats)
        
        # Track recent queries
        self.metrics.recent_queries.append(stats)
        if len(self.metrics.recent_queries) > self.max_recent_queries:
            self.metrics.recent_queries.pop(0)
        
        # Track errors
        if error:
            self.metrics.error_count += 1
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Generate performance report"""
        recent_queries = self.metrics.recent_queries[-100:]  # Last 100 queries
        
        return {
            'total_queries': self.metrics.total_queries,
            'avg_execution_time': round(self.metrics.avg_execution_time, 4),
            'max_execution_time': round(self.metrics.max_execution_time, 4),
            'min_execution_time': round(self.metrics.min_execution_time, 4),
            'error_count': self.metrics.error_count,
            'error_rate': round(self.metrics.error_count / max(self.metrics.total_queries, 1) * 100, 2),
            'slow_queries_count': len(self.metrics.slow_queries),
            'recent_avg_time': round(statistics.mean([q.execution_time for q in recent_queries]), 4) if recent_queries else 0,
            'slow_query_threshold': self.slow_query_threshold
        }
    
    def get_slow_queries(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get slowest queries"""
        slow_queries = sorted(self.metrics.slow_queries, key=lambda x: x.execution_time, reverse=True)
        return [
            {
                'query': q.query,
                'execution_time': round(q.execution_time, 4),
                'timestamp': q.timestamp.isoformat(),
                'rows_affected': q.rows_affected,
                'error': q.error
            }
            for q in slow_queries[:limit]
        ]
    
    def reset_metrics(self):
        """Reset performance metrics"""
        self.metrics = PerformanceMetrics()
        self.query_stats = []

def query_timer(func):
    """Decorator to time database queries"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            # Record query if monitor is available
            if hasattr(wrapper, 'monitor'):
                wrapper.monitor.record_query(
                    query=func.__name__,
                    execution_time=execution_time,
                    parameters=kwargs
                )
            
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            
            # Record error if monitor is available
            if hasattr(wrapper, 'monitor'):
                wrapper.monitor.record_query(
                    query=func.__name__,
                    execution_time=execution_time,
                    parameters=kwargs,
                    error=str(e)
                )
            
            raise
    
    return wrapper

@contextmanager
def query_monitor(monitor: PerformanceMonitor, query_name: str, parameters: Dict[str, Any] = None):
    """Context manager for monitoring queries"""
    start_time = time.time()
    error = None
    
    try:
        yield
    except Exception as e:
        error = str(e)
        raise
    finally:
        execution_time = time.time() - start_time
        monitor.record_query(
            query=query_name,
            execution_time=execution_time,
            parameters=parameters or {},
            error=error
        )

class DatabaseOptimizer:
    """Database optimization utilities"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create_indexes(self) -> Dict[str, bool]:
        """Create database indexes for better performance"""
        indexes = {}
        
        try:
            # Create indexes for common query patterns
            self.session.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_students_class_id 
                ON students(class_id);
            """))
            indexes['students_class_id'] = True
            
            self.session.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_attendance_class_date 
                ON attendance(class_id, date);
            """))
            indexes['attendance_class_date'] = True
            
            self.session.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_grades_student_class 
                ON grades(student_id, class_id);
            """))
            indexes['grades_student_class'] = True
            
            self.session.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_users_email 
                ON users(email);
            """))
            indexes['users_email'] = True
            
            self.session.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id 
                ON parent_students(parent_id);
            """))
            indexes['parent_students_parent_id'] = True
            
            self.session.commit()
            
        except SQLAlchemyError as e:
            logger.error(f"Failed to create indexes: {e}")
            self.session.rollback()
            indexes['error'] = str(e)
        
        return indexes
    
    def analyze_tables(self) -> Dict[str, Any]:
        """Analyze table statistics for query optimization"""
        analysis = {}
        
        try:
            # Analyze all tables
            tables = ['users', 'students', 'teachers', 'classes', 'subjects', 'attendance', 'grades']
            
            for table in tables:
                result = self.session.execute(text(f"ANALYZE {table};"))
                analysis[table] = "analyzed"
            
            self.session.commit()
            
        except SQLAlchemyError as e:
            logger.error(f"Failed to analyze tables: {e}")
            self.session.rollback()
            analysis['error'] = str(e)
        
        return analysis
    
    def vacuum_tables(self) -> Dict[str, Any]:
        """Vacuum tables to reclaim space and update statistics"""
        vacuum_results = {}
        
        try:
            # Vacuum all tables
            tables = ['users', 'students', 'teachers', 'classes', 'subjects', 'attendance', 'grades']
            
            for table in tables:
                result = self.session.execute(text(f"VACUUM {table};"))
                vacuum_results[table] = "vacuumed"
            
            self.session.commit()
            
        except SQLAlchemyError as e:
            logger.error(f"Failed to vacuum tables: {e}")
            self.session.rollback()
            vacuum_results['error'] = str(e)
        
        return vacuum_results

class AsyncQueryExecutor:
    """Asynchronous query execution for better performance"""
    
    def __init__(self, session: Session, max_workers: int = 5):
        self.session = session
        self.max_workers = max_workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
    
    def execute_parallel_queries(self, queries: List[Tuple[str, Dict[str, Any]]]) -> List[Any]:
        """Execute multiple queries in parallel"""
        results = []
        
        with self.executor as executor:
            # Submit all queries
            future_to_query = {
                executor.submit(self._execute_single_query, query, params): (query, params)
                for query, params in queries
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_query):
                query, params = future_to_query[future]
                try:
                    result = future.result()
                    results.append((query, result, None))
                except Exception as e:
                    results.append((query, None, str(e)))
        
        return results
    
    def _execute_single_query(self, query: str, params: Dict[str, Any]) -> Any:
        """Execute a single query"""
        try:
            result = self.session.execute(text(query), params)
            return result.fetchall()
        except SQLAlchemyError as e:
            logger.error(f"Query execution failed: {e}")
            raise

class CacheWarmer:
    """Cache warming utilities for better performance"""
    
    def __init__(self, session: Session, cache_manager):
        self.session = session
        self.cache_manager = cache_manager
    
    def warm_student_cache(self, student_ids: List[int]):
        """Warm cache with student data"""
        if not self.cache_manager:
            return
        
        students = self.session.query(Student).filter(Student.id.in_(student_ids)).all()
        
        for student in students:
            cache_key = f"student:{student.id}"
            student_data = {
                'id': student.id,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'email': student.email,
                'class_id': student.class_id,
                'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None
            }
            self.cache_manager.set(cache_key, student_data, ttl=3600)
    
    def warm_class_cache(self, class_ids: List[int]):
        """Warm cache with class data"""
        if not self.cache_manager:
            return
        
        classes = self.session.query(Class).filter(Class.id.in_(class_ids)).all()
        
        for class_info in classes:
            cache_key = f"class:{class_info.id}"
            class_data = {
                'id': class_info.id,
                'name': class_info.name,
                'grade_level': class_info.grade_level,
                'teacher_id': class_info.teacher_id,
                'capacity': class_info.capacity
            }
            self.cache_manager.set(cache_key, class_data, ttl=3600)
    
    def warm_attendance_cache(self, class_id: int, date: str):
        """Warm cache with attendance data"""
        if not self.cache_manager:
            return
        
        attendance = self.session.query(Attendance).filter(
            Attendance.class_id == class_id,
            Attendance.date == date
        ).all()
        
        cache_key = f"attendance:{class_id}:{date}"
        attendance_data = [
            {
                'id': a.id,
                'student_id': a.student_id,
                'status': a.status,
                'notes': a.notes
            }
            for a in attendance
        ]
        self.cache_manager.set(cache_key, attendance_data, ttl=1800)  # 30 minutes

# Performance optimization functions
def optimize_database_queries(session: Session) -> Dict[str, Any]:
    """Optimize database queries for better performance"""
    optimizer = QueryOptimizer(session)
    
    optimizations = {}
    optimizations.update(optimizer.optimize_student_queries())
    optimizations.update(optimizer.optimize_attendance_queries())
    optimizations.update(optimizer.optimize_grade_queries())
    
    return optimizations

def setup_performance_monitoring(session: Session) -> PerformanceMonitor:
    """Set up performance monitoring"""
    monitor = PerformanceMonitor()
    
    # Add monitor to query timer decorator
    query_timer.monitor = monitor
    
    return monitor

def optimize_connection_pool(engine: Engine, expected_users: int = 100) -> Dict[str, Any]:
    """Optimize database connection pool"""
    pool_manager = ConnectionPoolManager(engine)
    return pool_manager.optimize_pool_settings(expected_users)

# Example usage
if __name__ == "__main__":
    from database import get_db_session
    from models import Student, Class, Attendance, Grade
    
    # Get database session
    session = get_db_session()
    
    # Set up performance monitoring
    monitor = setup_performance_monitoring(session)
    
    # Optimize queries
    optimizations = optimize_database_queries(session)
    print("Query optimizations:", optimizations)
    
    # Get performance report
    report = monitor.get_performance_report()
    print("Performance report:", report)
    
    # Get slow queries
    slow_queries = monitor.get_slow_queries(5)
    print("Slow queries:", slow_queries)
    
    session.close()

