"""
Natural Language Processing AI Service

Provides multilingual text processing, sentiment analysis, and automated content generation.
"""
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from shared.config import settings
from shared.models import (
    PredictionRequest, PredictionResponse, ServiceHealth
)
from shared.utils import timing_decorator, async_timing_decorator, metrics_collector

# Configure logging
logging.basicConfig(level=getattr(logging, settings.log_level))
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="NLP AI Service",
    description="Natural Language Processing for multilingual support",
    version=settings.service_version
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service state
service_start_time = datetime.utcnow()
total_predictions = 0
active_models = 0


@app.get("/health", response_model=ServiceHealth)
async def health_check():
    """Health check endpoint"""
    uptime = (datetime.utcnow() - service_start_time).total_seconds()
    
    return ServiceHealth(
        service_name="nlp-service",
        status="healthy",
        version=settings.service_version,
        uptime_seconds=int(uptime),
        memory_usage_mb=0.0,
        cpu_usage_percent=0.0,
        active_models=active_models,
        total_predictions=total_predictions,
        last_prediction=None,
        errors_last_hour=0
    )


@app.post("/analyze/sentiment")
@async_timing_decorator
async def analyze_sentiment(request: PredictionRequest):
    """Analyze sentiment of text input"""
    try:
        metrics_collector.increment_counter("sentiment_analysis")
        
        text = request.input_data.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="text is required in input_data")
        
        # Mock sentiment analysis - would use actual NLP model
        sentiment_scores = {
            "positive": 0.3,
            "negative": 0.1,
            "neutral": 0.6
        }
        
        # Determine dominant sentiment
        dominant_sentiment = max(sentiment_scores, key=sentiment_scores.get)
        confidence = sentiment_scores[dominant_sentiment]
        
        result = {
            "text": text,
            "sentiment": dominant_sentiment,
            "confidence": confidence,
            "scores": sentiment_scores,
            "language": "en",  # Would be detected
            "timestamp": datetime.utcnow().isoformat()
        }
        
        metrics_collector.record_metric("sentiment_confidence", confidence)
        return result
        
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {e}")
        metrics_collector.increment_counter("sentiment_errors")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/translate")
@async_timing_decorator
async def translate_text(request: PredictionRequest):
    """Translate text between languages"""
    try:
        metrics_collector.increment_counter("translations")
        
        text = request.input_data.get("text", "")
        target_language = request.input_data.get("target_language", "en")
        source_language = request.input_data.get("source_language", "auto")
        
        if not text:
            raise HTTPException(status_code=400, detail="text is required in input_data")
        
        # Mock translation - would use actual translation model
        translations = {
            "en": text,
            "fr": f"[FR] {text}",
            "es": f"[ES] {text}",
            "de": f"[DE] {text}"
        }
        
        translated_text = translations.get(target_language, text)
        
        result = {
            "original_text": text,
            "translated_text": translated_text,
            "source_language": source_language,
            "target_language": target_language,
            "confidence": 0.85,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error in translation: {e}")
        metrics_collector.increment_counter("translation_errors")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/summary")
@async_timing_decorator
async def generate_summary(request: PredictionRequest):
    """Generate summary of text content"""
    try:
        metrics_collector.increment_counter("summaries")
        
        text = request.input_data.get("text", "")
        max_length = request.input_data.get("max_length", 100)
        
        if not text:
            raise HTTPException(status_code=400, detail="text is required in input_data")
        
        # Mock summary generation - would use actual NLP model
        words = text.split()
        summary_length = min(max_length, len(words) // 3)
        summary = " ".join(words[:summary_length]) + "..."
        
        result = {
            "original_text": text,
            "summary": summary,
            "original_length": len(words),
            "summary_length": len(summary.split()),
            "compression_ratio": len(summary.split()) / len(words),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error in summary generation: {e}")
        metrics_collector.increment_counter("summary_errors")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/report")
@async_timing_decorator
async def generate_report(request: PredictionRequest):
    """Generate automated report from data"""
    try:
        metrics_collector.increment_counter("reports")
        
        data = request.input_data.get("data", {})
        report_type = request.input_data.get("report_type", "general")
        
        if not data:
            raise HTTPException(status_code=400, detail="data is required in input_data")
        
        # Mock report generation - would use actual NLP model
        report = f"""
        # Automated Report - {report_type.title()}
        
        ## Summary
        This report was generated automatically based on the provided data.
        
        ## Key Findings
        - Data points analyzed: {len(data)}
        - Report generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}
        - Report type: {report_type}
        
        ## Recommendations
        - Continue monitoring the data trends
        - Consider implementing additional data collection points
        - Review findings with relevant stakeholders
        
        ## Next Steps
        - Schedule follow-up review
        - Implement recommended changes
        - Monitor progress and adjust as needed
        """
        
        result = {
            "report": report,
            "report_type": report_type,
            "data_points": len(data),
            "word_count": len(report.split()),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error in report generation: {e}")
        metrics_collector.increment_counter("report_errors")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/language")
@async_timing_decorator
async def detect_language(request: PredictionRequest):
    """Detect language of text input"""
    try:
        metrics_collector.increment_counter("language_detection")
        
        text = request.input_data.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="text is required in input_data")
        
        # Mock language detection - would use actual NLP model
        language_scores = {
            "en": 0.8,
            "fr": 0.1,
            "es": 0.05,
            "de": 0.03,
            "other": 0.02
        }
        
        detected_language = max(language_scores, key=language_scores.get)
        confidence = language_scores[detected_language]
        
        result = {
            "text": text,
            "detected_language": detected_language,
            "confidence": confidence,
            "all_scores": language_scores,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error in language detection: {e}")
        metrics_collector.increment_counter("language_detection_errors")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/metrics", response_model=Dict[str, Any])
async def get_service_metrics():
    """Get service metrics and statistics"""
    return metrics_collector.get_all_metrics()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port + 1,  # Different port for NLP service
        reload=settings.debug
    )

