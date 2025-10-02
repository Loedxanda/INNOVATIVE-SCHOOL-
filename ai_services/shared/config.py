"""
Shared configuration for AI services
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class AISettings(BaseSettings):
    """AI Services Configuration"""
    
    # Service Configuration
    service_name: str = "ai-service"
    service_version: str = "1.0.0"
    debug: bool = False
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8001
    api_prefix: str = "/api/v1"
    
    # Database Configuration
    database_url: str = "postgresql://innovative_school_user:innovative_school_password@localhost:5432/innovative_school"
    redis_url: str = "redis://localhost:6379"
    
    # Main Platform API
    main_api_url: str = "http://localhost:8000"
    main_api_token: Optional[str] = None
    
    # AI Model Configuration
    model_cache_dir: str = "./models"
    max_model_size_mb: int = 1000
    
    # Performance Configuration
    max_batch_size: int = 32
    max_concurrent_requests: int = 100
    request_timeout: int = 30
    
    # Monitoring Configuration
    enable_metrics: bool = True
    metrics_port: int = 9090
    log_level: str = "INFO"
    
    # External AI Services
    openai_api_key: Optional[str] = None
    huggingface_token: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = AISettings()

