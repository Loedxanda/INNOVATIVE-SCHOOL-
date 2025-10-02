from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import redis
import os

from routes_users import router as users_router
from routes_auth import router as auth_router
from routes_students import router as students_router
from routes_teachers import router as teachers_router
from routes_classes import router as classes_router
from routes_subjects import router as subjects_router
from routes_parents import router as parents_router
from routes_attendance import router as attendance_router
from routes_grades import router as grades_router
from routes_performance import router as performance_router
from routes_resources import router as resources_router
from routes_messaging import router as messaging_router
from routes_inquiries import router as inquiries_router
from routes_accounting import router as accounting_router
from database import engine, Base, test_connection

# Optional imports for Redis
try:
    from security import setup_security_middleware, SecurityConfig
    from cache import init_cache, CacheConfig
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    print("⚠️ Redis dependencies not available - running without caching")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Innovative School Platform API...")
    
    # Test database connection
    if test_connection():
        print("✅ Database connection successful")
    else:
        print("❌ Database connection failed")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
    
    # Initialize cache (if Redis is available)
    if REDIS_AVAILABLE:
        try:
            redis_host = os.getenv("REDIS_HOST", "localhost")
            redis_port = int(os.getenv("REDIS_PORT", "6379"))
            cache_config = CacheConfig(
                host=redis_host,
                port=redis_port,
                db=1,  # Use different DB for cache
                default_ttl=3600
            )
            init_cache(cache_config)
            print("✅ Cache system initialized")
        except Exception as e:
            print(f"⚠️ Cache initialization failed: {e}")
            print("🔄 Continuing without cache...")
    else:
        print("⚠️ Running without cache system")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Innovative School Platform API...")

app = FastAPI(
    title="Innovative School Platform API",
    description="AI-powered, multilingual school management platform for Cameroon",
    version="0.1.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup security middleware (if Redis is available)
if REDIS_AVAILABLE:
    try:
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        redis_client = redis.Redis(host=redis_host, port=redis_port, db=0, decode_responses=True)
        app = setup_security_middleware(app, redis_client)
        print("✅ Security middleware initialized")
    except Exception as e:
        print(f"⚠️ Security middleware failed: {e}")
        print("🔄 Continuing with basic security...")
else:
    print("⚠️ Running with basic security (no Redis)")

app.include_router(users_router)
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(teachers_router)
app.include_router(classes_router)
app.include_router(subjects_router)
app.include_router(parents_router)
app.include_router(attendance_router)
app.include_router(grades_router)
app.include_router(performance_router)
app.include_router(resources_router)
app.include_router(messaging_router)
app.include_router(inquiries_router)
app.include_router(accounting_router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Innovative School Platform API!",
        "version": "0.1.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "healthy" if test_connection() else "unhealthy"
    return {
        "status": "running",
        "database": db_status,
        "version": "0.1.0"
    }