"""
Shared data models for AI services
"""
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class ServiceStatus(str, Enum):
    """Service status enumeration"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    STARTING = "starting"
    STOPPING = "stopping"


class PredictionType(str, Enum):
    """Prediction type enumeration"""
    STUDENT_PERFORMANCE = "student_performance"
    ATTENDANCE_PATTERN = "attendance_pattern"
    LEARNING_RECOMMENDATION = "learning_recommendation"
    RISK_ASSESSMENT = "risk_assessment"
    CONTENT_SUGGESTION = "content_suggestion"


class ModelType(str, Enum):
    """AI model type enumeration"""
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    CLUSTERING = "clustering"
    NLP = "nlp"
    COMPUTER_VISION = "computer_vision"
    RECOMMENDATION = "recommendation"


class BaseAIModel(BaseModel):
    """Base model for AI service responses"""
    id: str
    model_type: ModelType
    version: str
    created_at: datetime
    updated_at: datetime
    accuracy: Optional[float] = None
    status: ServiceStatus = ServiceStatus.HEALTHY


class PredictionRequest(BaseModel):
    """Base prediction request model"""
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    input_data: Dict[str, Any]
    prediction_type: PredictionType
    model_version: Optional[str] = None


class PredictionResponse(BaseModel):
    """Base prediction response model"""
    prediction_id: str
    prediction_type: PredictionType
    model_version: str
    confidence: float
    prediction: Union[str, float, int, List[Any], Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime


class LearningRecommendation(BaseModel):
    """Learning recommendation model"""
    student_id: int
    recommendation_type: str
    title: str
    description: str
    priority: int  # 1-5 scale
    estimated_time_minutes: int
    resources: List[Dict[str, str]]
    reasoning: str
    confidence: float


class PerformancePrediction(BaseModel):
    """Student performance prediction model"""
    student_id: int
    subject_id: int
    predicted_grade: float
    confidence: float
    risk_factors: List[str]
    recommendations: List[str]
    prediction_horizon_days: int


class AttendancePattern(BaseModel):
    """Attendance pattern analysis model"""
    student_id: int
    pattern_type: str
    description: str
    confidence: float
    recommendations: List[str]
    trend: str  # "improving", "declining", "stable"


class RiskAssessment(BaseModel):
    """Risk assessment model"""
    student_id: int
    risk_level: str  # "low", "medium", "high", "critical"
    risk_factors: List[str]
    probability: float
    impact: str
    mitigation_strategies: List[str]
    urgency: str


class ContentSuggestion(BaseModel):
    """Content suggestion model"""
    student_id: int
    content_type: str
    title: str
    description: str
    difficulty_level: str
    estimated_time_minutes: int
    tags: List[str]
    relevance_score: float


class ModelMetrics(BaseModel):
    """Model performance metrics"""
    model_id: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc_roc: Optional[float] = None
    training_samples: int
    validation_samples: int
    last_updated: datetime


class ServiceHealth(BaseModel):
    """Service health check model"""
    service_name: str
    status: ServiceStatus
    version: str
    uptime_seconds: int
    memory_usage_mb: float
    cpu_usage_percent: float
    active_models: int
    total_predictions: int
    last_prediction: Optional[datetime] = None
    errors_last_hour: int = 0


class BatchPredictionRequest(BaseModel):
    """Batch prediction request model"""
    prediction_type: PredictionType
    input_data: List[Dict[str, Any]]
    model_version: Optional[str] = None
    batch_id: Optional[str] = None


class BatchPredictionResponse(BaseModel):
    """Batch prediction response model"""
    batch_id: str
    prediction_type: PredictionType
    model_version: str
    total_predictions: int
    successful_predictions: int
    failed_predictions: int
    predictions: List[PredictionResponse]
    processing_time_seconds: float
    created_at: datetime


class ModelTrainingRequest(BaseModel):
    """Model training request model"""
    model_type: ModelType
    training_data: Dict[str, Any]
    hyperparameters: Dict[str, Any]
    validation_split: float = 0.2
    test_split: float = 0.1


class ModelTrainingResponse(BaseModel):
    """Model training response model"""
    training_id: str
    model_type: ModelType
    status: str
    accuracy: Optional[float] = None
    training_time_seconds: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

