"""
Shared utilities for AI services
"""
import logging
import time
import json
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from functools import wraps
import asyncio
import aiohttp


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def timing_decorator(func):
    """Decorator to measure function execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logger.info(f"{func.__name__} executed in {end_time - start_time:.4f} seconds")
        return result
    return wrapper


def async_timing_decorator(func):
    """Decorator to measure async function execution time"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        end_time = time.time()
        logger.info(f"{func.__name__} executed in {end_time - start_time:.4f} seconds")
        return result
    return wrapper


class DataProcessor:
    """Utility class for data processing operations"""
    
    @staticmethod
    def normalize_data(data: Union[List, np.ndarray, pd.DataFrame]) -> np.ndarray:
        """Normalize data to 0-1 range"""
        if isinstance(data, pd.DataFrame):
            data = data.values
        elif isinstance(data, list):
            data = np.array(data)
        
        data_min = np.min(data)
        data_max = np.max(data)
        
        if data_max == data_min:
            return np.zeros_like(data)
        
        return (data - data_min) / (data_max - data_min)
    
    @staticmethod
    def standardize_data(data: Union[List, np.ndarray, pd.DataFrame]) -> np.ndarray:
        """Standardize data to mean=0, std=1"""
        if isinstance(data, pd.DataFrame):
            data = data.values
        elif isinstance(data, list):
            data = np.array(data)
        
        mean = np.mean(data)
        std = np.std(data)
        
        if std == 0:
            return np.zeros_like(data)
        
        return (data - mean) / std
    
    @staticmethod
    def handle_missing_values(data: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
        """Handle missing values in DataFrame"""
        if strategy == 'mean':
            return data.fillna(data.mean())
        elif strategy == 'median':
            return data.fillna(data.median())
        elif strategy == 'mode':
            return data.fillna(data.mode().iloc[0])
        elif strategy == 'drop':
            return data.dropna()
        else:
            raise ValueError(f"Unknown strategy: {strategy}")


class ModelCache:
    """Simple in-memory model cache"""
    
    def __init__(self, max_size: int = 10):
        self.cache: Dict[str, Any] = {}
        self.max_size = max_size
        self.access_times: Dict[str, float] = {}
    
    def get(self, key: str) -> Optional[Any]:
        """Get model from cache"""
        if key in self.cache:
            self.access_times[key] = time.time()
            return self.cache[key]
        return None
    
    def put(self, key: str, value: Any) -> None:
        """Put model in cache"""
        if len(self.cache) >= self.max_size:
            # Remove least recently used item
            lru_key = min(self.access_times, key=self.access_times.get)
            del self.cache[lru_key]
            del self.access_times[lru_key]
        
        self.cache[key] = value
        self.access_times[key] = time.time()
    
    def clear(self) -> None:
        """Clear cache"""
        self.cache.clear()
        self.access_times.clear()


class MetricsCollector:
    """Collect and store service metrics"""
    
    def __init__(self):
        self.metrics: Dict[str, List[float]] = {}
        self.counters: Dict[str, int] = {}
    
    def record_metric(self, name: str, value: float) -> None:
        """Record a metric value"""
        if name not in self.metrics:
            self.metrics[name] = []
        self.metrics[name].append(value)
    
    def increment_counter(self, name: str, value: int = 1) -> None:
        """Increment a counter"""
        if name not in self.counters:
            self.counters[name] = 0
        self.counters[name] += value
    
    def get_metric_summary(self, name: str) -> Dict[str, float]:
        """Get summary statistics for a metric"""
        if name not in self.metrics or not self.metrics[name]:
            return {}
        
        values = self.metrics[name]
        return {
            'count': len(values),
            'mean': np.mean(values),
            'std': np.std(values),
            'min': np.min(values),
            'max': np.max(values),
            'median': np.median(values)
        }
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """Get all metrics and counters"""
        return {
            'metrics': {name: self.get_metric_summary(name) for name in self.metrics},
            'counters': self.counters.copy()
        }


class APIClient:
    """HTTP client for communicating with main platform"""
    
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url
        self.timeout = timeout
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout))
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make GET request"""
        if not self.session:
            raise RuntimeError("APIClient not initialized. Use async context manager.")
        
        url = f"{self.base_url}{endpoint}"
        async with self.session.get(url, params=params) as response:
            response.raise_for_status()
            return await response.json()
    
    async def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make POST request"""
        if not self.session:
            raise RuntimeError("APIClient not initialized. Use async context manager.")
        
        url = f"{self.base_url}{endpoint}"
        async with self.session.post(url, json=data) as response:
            response.raise_for_status()
            return await response.json()
    
    async def put(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make PUT request"""
        if not self.session:
            raise RuntimeError("APIClient not initialized. Use async context manager.")
        
        url = f"{self.base_url}{endpoint}"
        async with self.session.put(url, json=data) as response:
            response.raise_for_status()
            return await response.json()
    
    async def delete(self, endpoint: str) -> Dict[str, Any]:
        """Make DELETE request"""
        if not self.session:
            raise RuntimeError("APIClient not initialized. Use async context manager.")
        
        url = f"{self.base_url}{endpoint}"
        async with self.session.delete(url) as response:
            response.raise_for_status()
            return await response.json()


def validate_input_data(data: Dict[str, Any], required_fields: List[str]) -> bool:
    """Validate input data has required fields"""
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
    return True


def safe_json_serialize(obj: Any) -> str:
    """Safely serialize object to JSON"""
    try:
        return json.dumps(obj, default=str)
    except (TypeError, ValueError) as e:
        logger.error(f"JSON serialization error: {e}")
        return json.dumps({"error": "Serialization failed"})


def calculate_confidence_score(predictions: List[float]) -> float:
    """Calculate confidence score from prediction probabilities"""
    if not predictions:
        return 0.0
    
    # Use entropy-based confidence
    predictions = np.array(predictions)
    predictions = np.clip(predictions, 1e-10, 1.0)  # Avoid log(0)
    entropy = -np.sum(predictions * np.log(predictions))
    max_entropy = np.log(len(predictions))
    confidence = 1.0 - (entropy / max_entropy)
    
    return float(np.clip(confidence, 0.0, 1.0))


def format_prediction_output(prediction: Any, confidence: float, metadata: Optional[Dict] = None) -> Dict[str, Any]:
    """Format prediction output for API response"""
    return {
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "metadata": metadata or {},
        "timestamp": datetime.utcnow().isoformat()
    }


# Global instances
model_cache = ModelCache()
metrics_collector = MetricsCollector()

