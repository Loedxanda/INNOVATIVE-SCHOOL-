"""
Performance monitoring and optimization API routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db
from performance import (
    PerformanceMonitor, 
    DatabaseOptimizer, 
    ConnectionPoolManager,
    CacheWarmer,
    optimize_database_queries,
    setup_performance_monitoring
)
from cache import get_cache, CacheStats
from models import Student, Class, Attendance, Grade

router = APIRouter(prefix="/api/performance", tags=["performance"])

# Global performance monitor
_performance_monitor: Optional[PerformanceMonitor] = None

def get_performance_monitor() -> PerformanceMonitor:
    """Get or create performance monitor"""
    global _performance_monitor
    if _performance_monitor is None:
        _performance_monitor = setup_performance_monitoring(get_db())
    return _performance_monitor

@router.get("/metrics")
async def get_performance_metrics(
    monitor: PerformanceMonitor = Depends(get_performance_monitor)
) -> Dict[str, Any]:
    """Get current performance metrics"""
    return monitor.get_performance_report()

@router.get("/slow-queries")
async def get_slow_queries(
    limit: int = Query(10, ge=1, le=100),
    monitor: PerformanceMonitor = Depends(get_performance_monitor)
) -> List[Dict[str, Any]]:
    """Get slowest queries"""
    return monitor.get_slow_queries(limit)

@router.get("/cache-stats")
async def get_cache_statistics() -> Dict[str, Any]:
    """Get cache statistics"""
    cache = get_cache()
    if not cache:
        return {"error": "Cache not available"}
    
    stats = CacheStats(cache)
    return stats.get_stats()

@router.get("/database-optimization")
async def get_database_optimization(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get database optimization recommendations"""
    optimizer = DatabaseOptimizer(db)
    
    # Get current indexes
    indexes = optimizer.create_indexes()
    
    # Analyze tables
    analysis = optimizer.analyze_tables()
    
    return {
        "indexes": indexes,
        "analysis": analysis,
        "recommendations": [
            "Consider adding indexes on frequently queried columns",
            "Regularly analyze tables for query optimization",
            "Monitor slow queries and optimize them",
            "Use connection pooling for better performance"
        ]
    }

@router.post("/optimize-queries")
async def optimize_queries(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Optimize database queries"""
    try:
        optimizations = optimize_database_queries(db)
        return {
            "success": True,
            "optimizations": optimizations,
            "message": "Query optimization completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@router.post("/warm-cache")
async def warm_cache(
    cache_type: str = Query(..., description="Type of cache to warm: students, classes, attendance"),
    class_id: Optional[int] = Query(None, description="Class ID for attendance cache warming"),
    date: Optional[str] = Query(None, description="Date for attendance cache warming (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Warm cache with frequently accessed data"""
    cache = get_cache()
    if not cache:
        raise HTTPException(status_code=500, detail="Cache not available")
    
    warmer = CacheWarmer(db, cache)
    
    try:
        if cache_type == "students":
            # Get all student IDs
            student_ids = [s.id for s in db.query(Student).all()]
            warmer.warm_student_cache(student_ids)
            return {"success": True, "message": f"Warmed cache for {len(student_ids)} students"}
        
        elif cache_type == "classes":
            # Get all class IDs
            class_ids = [c.id for c in db.query(Class).all()]
            warmer.warm_class_cache(class_ids)
            return {"success": True, "message": f"Warmed cache for {len(class_ids)} classes"}
        
        elif cache_type == "attendance":
            if not class_id or not date:
                raise HTTPException(status_code=400, detail="class_id and date are required for attendance cache warming")
            
            warmer.warm_attendance_cache(class_id, date)
            return {"success": True, "message": f"Warmed attendance cache for class {class_id} on {date}"}
        
        else:
            raise HTTPException(status_code=400, detail="Invalid cache type. Use: students, classes, attendance")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache warming failed: {str(e)}")

@router.post("/reset-metrics")
async def reset_performance_metrics(
    monitor: PerformanceMonitor = Depends(get_performance_monitor)
) -> Dict[str, Any]:
    """Reset performance metrics"""
    monitor.reset_metrics()
    return {"success": True, "message": "Performance metrics reset"}

@router.get("/health-check")
async def performance_health_check(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Comprehensive performance health check"""
    health_status = {
        "database": {"status": "unknown", "response_time": 0},
        "cache": {"status": "unknown", "response_time": 0},
        "overall": "unknown"
    }
    
    # Test database connection
    try:
        start_time = datetime.now()
        db.execute("SELECT 1")
        db_time = (datetime.now() - start_time).total_seconds()
        health_status["database"] = {
            "status": "healthy",
            "response_time": round(db_time, 4)
        }
    except Exception as e:
        health_status["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    # Test cache connection
    try:
        cache = get_cache()
        if cache:
            start_time = datetime.now()
            cache.get("health_check")
            cache_time = (datetime.now() - start_time).total_seconds()
            health_status["cache"] = {
                "status": "healthy",
                "response_time": round(cache_time, 4)
            }
        else:
            health_status["cache"] = {
                "status": "unavailable",
                "message": "Cache not configured"
            }
    except Exception as e:
        health_status["cache"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    # Determine overall health
    db_healthy = health_status["database"]["status"] == "healthy"
    cache_healthy = health_status["cache"]["status"] in ["healthy", "unavailable"]
    
    if db_healthy and cache_healthy:
        health_status["overall"] = "healthy"
    elif db_healthy:
        health_status["overall"] = "degraded"
    else:
        health_status["overall"] = "unhealthy"
    
    return health_status

@router.get("/recommendations")
async def get_performance_recommendations(
    db: Session = Depends(get_db),
    monitor: PerformanceMonitor = Depends(get_performance_monitor)
) -> Dict[str, Any]:
    """Get performance optimization recommendations"""
    recommendations = []
    
    # Get current metrics
    metrics = monitor.get_performance_report()
    
    # Check average execution time
    if metrics["avg_execution_time"] > 0.5:
        recommendations.append({
            "category": "query_performance",
            "priority": "high",
            "title": "High Average Query Time",
            "description": f"Average query time is {metrics['avg_execution_time']:.3f}s, consider optimizing queries",
            "action": "Review and optimize slow queries, add database indexes"
        })
    
    # Check error rate
    if metrics["error_rate"] > 5:
        recommendations.append({
            "category": "error_handling",
            "priority": "high",
            "title": "High Error Rate",
            "description": f"Error rate is {metrics['error_rate']:.1f}%, investigate failed queries",
            "action": "Review error logs and fix query issues"
        })
    
    # Check slow queries count
    if metrics["slow_queries_count"] > 10:
        recommendations.append({
            "category": "query_optimization",
            "priority": "medium",
            "title": "Many Slow Queries",
            "description": f"Found {metrics['slow_queries_count']} slow queries",
            "action": "Optimize slow queries and consider adding indexes"
        })
    
    # Check cache availability
    cache = get_cache()
    if not cache:
        recommendations.append({
            "category": "caching",
            "priority": "medium",
            "title": "Cache Not Configured",
            "description": "Redis cache is not available",
            "action": "Configure Redis cache for better performance"
        })
    
    # Database optimization recommendations
    optimizer = DatabaseOptimizer(db)
    indexes = optimizer.create_indexes()
    
    if "error" in indexes:
        recommendations.append({
            "category": "database",
            "priority": "medium",
            "title": "Database Index Issues",
            "description": "Failed to create some database indexes",
            "action": "Check database permissions and fix index creation"
        })
    
    return {
        "recommendations": recommendations,
        "total_recommendations": len(recommendations),
        "high_priority": len([r for r in recommendations if r["priority"] == "high"]),
        "medium_priority": len([r for r in recommendations if r["priority"] == "medium"]),
        "low_priority": len([r for r in recommendations if r["priority"] == "low"])
    }

