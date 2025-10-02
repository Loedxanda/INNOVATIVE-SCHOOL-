"""
Caching Module for Innovative School Platform
Implements Redis-based caching for improved performance
"""

import json
import pickle
from typing import Any, Optional, Union, List, Dict
from datetime import datetime, timedelta
import logging
from functools import wraps
import hashlib

import redis
from redis.exceptions import RedisError

logger = logging.getLogger(__name__)

class CacheConfig:
    """Configuration for caching system"""
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        default_ttl: int = 3600,  # 1 hour
        key_prefix: str = "innovative_school:",
        serialize_method: str = "json"  # json or pickle
    ):
        self.host = host
        self.port = port
        self.db = db
        self.password = password
        self.default_ttl = default_ttl
        self.key_prefix = key_prefix
        self.serialize_method = serialize_method

class CacheManager:
    """Main cache management class"""
    
    def __init__(self, config: CacheConfig):
        self.config = config
        self.redis_client = None
        self._connect()
    
    def _connect(self):
        """Establish Redis connection"""
        try:
            self.redis_client = redis.Redis(
                host=self.config.host,
                port=self.config.port,
                db=self.config.db,
                password=self.config.password,
                decode_responses=False,  # We'll handle encoding ourselves
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Redis connection established successfully")
        except RedisError as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    def _get_key(self, key: str) -> str:
        """Generate full cache key with prefix"""
        return f"{self.config.key_prefix}{key}"
    
    def _serialize(self, data: Any) -> bytes:
        """Serialize data for storage"""
        if self.config.serialize_method == "json":
            return json.dumps(data, default=str).encode('utf-8')
        elif self.config.serialize_method == "pickle":
            return pickle.dumps(data)
        else:
            raise ValueError(f"Unsupported serialize method: {self.config.serialize_method}")
    
    def _deserialize(self, data: bytes) -> Any:
        """Deserialize data from storage"""
        if self.config.serialize_method == "json":
            return json.loads(data.decode('utf-8'))
        elif self.config.serialize_method == "pickle":
            return pickle.loads(data)
        else:
            raise ValueError(f"Unsupported serialize method: {self.config.serialize_method}")
    
    def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None,
        nx: bool = False,
        xx: bool = False
    ) -> bool:
        """Set a cache value"""
        if not self.redis_client:
            return False
        
        try:
            full_key = self._get_key(key)
            serialized_value = self._serialize(value)
            ttl = ttl or self.config.default_ttl
            
            if nx:
                return self.redis_client.set(full_key, serialized_value, ex=ttl, nx=True)
            elif xx:
                return self.redis_client.set(full_key, serialized_value, ex=ttl, xx=True)
            else:
                return self.redis_client.set(full_key, serialized_value, ex=ttl)
        except RedisError as e:
            logger.error(f"Failed to set cache key {key}: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get a cache value"""
        if not self.redis_client:
            return None
        
        try:
            full_key = self._get_key(key)
            data = self.redis_client.get(full_key)
            if data is None:
                return None
            return self._deserialize(data)
        except RedisError as e:
            logger.error(f"Failed to get cache key {key}: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """Delete a cache key"""
        if not self.redis_client:
            return False
        
        try:
            full_key = self._get_key(key)
            return bool(self.redis_client.delete(full_key))
        except RedisError as e:
            logger.error(f"Failed to delete cache key {key}: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if a cache key exists"""
        if not self.redis_client:
            return False
        
        try:
            full_key = self._get_key(key)
            return bool(self.redis_client.exists(full_key))
        except RedisError as e:
            logger.error(f"Failed to check cache key {key}: {e}")
            return False
    
    def expire(self, key: str, ttl: int) -> bool:
        """Set expiration for a cache key"""
        if not self.redis_client:
            return False
        
        try:
            full_key = self._get_key(key)
            return bool(self.redis_client.expire(full_key, ttl))
        except RedisError as e:
            logger.error(f"Failed to set expiration for cache key {key}: {e}")
            return False
    
    def ttl(self, key: str) -> int:
        """Get time to live for a cache key"""
        if not self.redis_client:
            return -1
        
        try:
            full_key = self._get_key(key)
            return self.redis_client.ttl(full_key)
        except RedisError as e:
            logger.error(f"Failed to get TTL for cache key {key}: {e}")
            return -1
    
    def keys(self, pattern: str = "*") -> List[str]:
        """Get keys matching pattern"""
        if not self.redis_client:
            return []
        
        try:
            full_pattern = self._get_key(pattern)
            keys = self.redis_client.keys(full_pattern)
            # Remove prefix from returned keys
            return [key.decode('utf-8').replace(self.config.key_prefix, '') for key in keys]
        except RedisError as e:
            logger.error(f"Failed to get keys with pattern {pattern}: {e}")
            return []
    
    def flush(self) -> bool:
        """Flush all cache keys"""
        if not self.redis_client:
            return False
        
        try:
            # Only flush keys with our prefix
            keys = self.redis_client.keys(self._get_key("*"))
            if keys:
                return bool(self.redis_client.delete(*keys))
            return True
        except RedisError as e:
            logger.error(f"Failed to flush cache: {e}")
            return False
    
    def mget(self, keys: List[str]) -> List[Optional[Any]]:
        """Get multiple cache values"""
        if not self.redis_client:
            return [None] * len(keys)
        
        try:
            full_keys = [self._get_key(key) for key in keys]
            data_list = self.redis_client.mget(full_keys)
            return [self._deserialize(data) if data else None for data in data_list]
        except RedisError as e:
            logger.error(f"Failed to get multiple cache keys: {e}")
            return [None] * len(keys)
    
    def mset(self, mapping: Dict[str, Any], ttl: Optional[int] = None) -> bool:
        """Set multiple cache values"""
        if not self.redis_client:
            return False
        
        try:
            full_mapping = {self._get_key(k): self._serialize(v) for k, v in mapping.items()}
            result = self.redis_client.mset(full_mapping)
            
            if result and ttl:
                for key in mapping.keys():
                    self.expire(key, ttl)
            
            return result
        except RedisError as e:
            logger.error(f"Failed to set multiple cache keys: {e}")
            return False

# Global cache instance
_cache_manager: Optional[CacheManager] = None

def init_cache(config: CacheConfig):
    """Initialize global cache manager"""
    global _cache_manager
    _cache_manager = CacheManager(config)

def get_cache() -> Optional[CacheManager]:
    """Get global cache manager instance"""
    return _cache_manager

def cache_key(*args, **kwargs) -> str:
    """Generate cache key from arguments"""
    # Create a deterministic key from arguments
    key_data = {
        'args': args,
        'kwargs': sorted(kwargs.items())
    }
    key_string = json.dumps(key_data, sort_keys=True, default=str)
    return hashlib.md5(key_string.encode()).hexdigest()

def cached(
    ttl: Optional[int] = None,
    key_func: Optional[callable] = None,
    cache_condition: Optional[callable] = None
):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache = get_cache()
            if not cache:
                return func(*args, **kwargs)
            
            # Generate cache key
            if key_func:
                cache_key_str = key_func(*args, **kwargs)
            else:
                cache_key_str = f"{func.__name__}:{cache_key(*args, **kwargs)}"
            
            # Check cache condition
            if cache_condition and not cache_condition(*args, **kwargs):
                return func(*args, **kwargs)
            
            # Try to get from cache
            cached_result = cache.get(cache_key_str)
            if cached_result is not None:
                logger.debug(f"Cache hit for {cache_key_str}")
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key_str, result, ttl)
            logger.debug(f"Cached result for {cache_key_str}")
            
            return result
        
        return wrapper
    return decorator

def invalidate_cache(pattern: str):
    """Invalidate cache keys matching pattern"""
    cache = get_cache()
    if not cache:
        return False
    
    keys = cache.keys(pattern)
    if not keys:
        return True
    
    for key in keys:
        cache.delete(key)
    
    logger.info(f"Invalidated {len(keys)} cache keys matching pattern: {pattern}")
    return True

# Cache key generators for common patterns
class CacheKeys:
    """Common cache key patterns"""
    
    @staticmethod
    def user(user_id: int) -> str:
        return f"user:{user_id}"
    
    @staticmethod
    def student(student_id: int) -> str:
        return f"student:{student_id}"
    
    @staticmethod
    def teacher(teacher_id: int) -> str:
        return f"teacher:{teacher_id}"
    
    @staticmethod
    def class_info(class_id: int) -> str:
        return f"class:{class_id}"
    
    @staticmethod
    def subject(subject_id: int) -> str:
        return f"subject:{subject_id}"
    
    @staticmethod
    def attendance(class_id: int, date: str) -> str:
        return f"attendance:{class_id}:{date}"
    
    @staticmethod
    def grades(student_id: int, class_id: int) -> str:
        return f"grades:{student_id}:{class_id}"
    
    @staticmethod
    def class_students(class_id: int) -> str:
        return f"class_students:{class_id}"
    
    @staticmethod
    def teacher_classes(teacher_id: int) -> str:
        return f"teacher_classes:{teacher_id}"
    
    @staticmethod
    def parent_children(parent_id: int) -> str:
        return f"parent_children:{parent_id}"

# Cache warming functions
def warm_user_cache(user_id: int, user_data: Dict[str, Any]):
    """Warm cache with user data"""
    cache = get_cache()
    if cache:
        cache.set(CacheKeys.user(user_id), user_data, ttl=3600)

def warm_student_cache(student_id: int, student_data: Dict[str, Any]):
    """Warm cache with student data"""
    cache = get_cache()
    if cache:
        cache.set(CacheKeys.student(student_id), student_data, ttl=3600)

def warm_class_cache(class_id: int, class_data: Dict[str, Any]):
    """Warm cache with class data"""
    cache = get_cache()
    if cache:
        cache.set(CacheKeys.class_info(class_id), class_data, ttl=3600)

# Cache statistics
class CacheStats:
    """Cache statistics and monitoring"""
    
    def __init__(self, cache_manager: CacheManager):
        self.cache_manager = cache_manager
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.cache_manager.redis_client:
            return {"error": "Redis not connected"}
        
        try:
            info = self.cache_manager.redis_client.info()
            return {
                "connected_clients": info.get("connected_clients", 0),
                "used_memory": info.get("used_memory", 0),
                "used_memory_human": info.get("used_memory_human", "0B"),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": self._calculate_hit_rate(info),
                "total_keys": len(self.cache_manager.keys()),
                "uptime_seconds": info.get("uptime_in_seconds", 0)
            }
        except RedisError as e:
            return {"error": str(e)}
    
    def _calculate_hit_rate(self, info: Dict[str, Any]) -> float:
        """Calculate cache hit rate"""
        hits = info.get("keyspace_hits", 0)
        misses = info.get("keyspace_misses", 0)
        total = hits + misses
        return (hits / total * 100) if total > 0 else 0.0

# Example usage
if __name__ == "__main__":
    # Configuration
    config = CacheConfig(
        host="localhost",
        port=6379,
        db=0,
        default_ttl=3600,
        key_prefix="test:",
        serialize_method="json"
    )
    
    # Initialize cache
    init_cache(config)
    
    # Test basic operations
    cache = get_cache()
    if cache:
        # Set a value
        cache.set("test_key", {"message": "Hello, World!"}, ttl=60)
        
        # Get the value
        value = cache.get("test_key")
        print(f"Retrieved value: {value}")
        
        # Check if key exists
        exists = cache.exists("test_key")
        print(f"Key exists: {exists}")
        
        # Get TTL
        ttl = cache.ttl("test_key")
        print(f"TTL: {ttl} seconds")
        
        # Delete key
        deleted = cache.delete("test_key")
        print(f"Key deleted: {deleted}")
        
        # Test decorator
        @cached(ttl=60)
        def expensive_function(x: int) -> int:
            print(f"Computing expensive function with x={x}")
            return x * x
        
        # First call - will compute
        result1 = expensive_function(5)
        print(f"Result 1: {result1}")
        
        # Second call - will use cache
        result2 = expensive_function(5)
        print(f"Result 2: {result2}")
        
        # Get statistics
        stats = CacheStats(cache)
        print(f"Cache stats: {stats.get_stats()}")

