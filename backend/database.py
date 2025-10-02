from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
# from sqlalchemy.dialects.postgresql import UUID  # Not needed for SQLite
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./innovative_school.db")

# Create SQLAlchemy engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite-specific configuration
    engine = create_engine(
        DATABASE_URL,
        echo=True,  # Set to False in production
        connect_args={"check_same_thread": False}  # SQLite-specific
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        echo=True,  # Set to False in production
        pool_pre_ping=True,
        pool_recycle=300,
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test database connection
def test_connection():
    try:
        with engine.connect() as connection:
            if DATABASE_URL.startswith("sqlite"):
                from sqlalchemy import text
                result = connection.execute(text("SELECT 1"))
            else:
                from sqlalchemy import text
                result = connection.execute(text("SELECT 1"))
            print("Database connection successful!")
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

