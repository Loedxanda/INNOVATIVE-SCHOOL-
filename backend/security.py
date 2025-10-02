"""
Security utilities and middleware for the application
"""
import re
import hashlib
import secrets
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import redis
import json
from pydantic import BaseModel, validator, EmailStr
from email_validator import validate_email, EmailNotValidError


class SecurityConfig:
    """Security configuration settings"""
    
    # Password requirements
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 128
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_NUMBERS = True
    REQUIRE_SPECIAL_CHARS = True
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = 100  # requests per minute
    RATE_LIMIT_WINDOW = 60  # seconds
    
    # Session security
    SESSION_TIMEOUT = 3600  # 1 hour in seconds
    MAX_SESSION_ATTEMPTS = 5
    
    # Input validation
    MAX_STRING_LENGTH = 1000
    MAX_EMAIL_LENGTH = 254
    MAX_PHONE_LENGTH = 20
    
    # CORS settings
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://yourdomain.com",
    ]
    
    ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    ALLOWED_HEADERS = ["*"]
    
    # Trusted hosts
    TRUSTED_HOSTS = ["localhost", "127.0.0.1", "yourdomain.com"]


class InputValidator:
    """Input validation utilities"""
    
    @staticmethod
    def validate_password(password: str) -> Dict[str, Any]:
        """Validate password strength"""
        errors = []
        
        if len(password) < SecurityConfig.MIN_PASSWORD_LENGTH:
            errors.append(f"Password must be at least {SecurityConfig.MIN_PASSWORD_LENGTH} characters long")
        
        if len(password) > SecurityConfig.MAX_PASSWORD_LENGTH:
            errors.append(f"Password must be no more than {SecurityConfig.MAX_PASSWORD_LENGTH} characters long")
        
        if SecurityConfig.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if SecurityConfig.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if SecurityConfig.REQUIRE_NUMBERS and not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        if SecurityConfig.REQUIRE_SPECIAL_CHARS and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "strength": InputValidator._calculate_password_strength(password)
        }
    
    @staticmethod
    def _calculate_password_strength(password: str) -> str:
        """Calculate password strength"""
        score = 0
        
        if len(password) >= 8:
            score += 1
        if len(password) >= 12:
            score += 1
        if re.search(r'[A-Z]', password):
            score += 1
        if re.search(r'[a-z]', password):
            score += 1
        if re.search(r'\d', password):
            score += 1
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 1
        
        if score <= 2:
            return "weak"
        elif score <= 4:
            return "medium"
        else:
            return "strong"
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        try:
            validate_email(email)
            return True
        except EmailNotValidError:
            return False
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format"""
        # Basic phone validation for international format
        phone_pattern = r'^\+?[1-9]\d{1,14}$'
        return bool(re.match(phone_pattern, phone))
    
    @staticmethod
    def sanitize_string(text: str, max_length: int = SecurityConfig.MAX_STRING_LENGTH) -> str:
        """Sanitize string input"""
        if not text:
            return ""
        
        # Remove null bytes and control characters
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
        
        # Truncate if too long
        if len(text) > max_length:
            text = text[:max_length]
        
        return text.strip()
    
    @staticmethod
    def validate_student_id(student_id: str) -> bool:
        """Validate student ID format"""
        # Student ID should be alphanumeric and 3-20 characters
        pattern = r'^[A-Z0-9]{3,20}$'
        return bool(re.match(pattern, student_id))
    
    @staticmethod
    def validate_grade_value(grade: float, max_grade: float = 100.0) -> bool:
        """Validate grade value"""
        return 0 <= grade <= max_grade


class RateLimiter:
    """Rate limiting implementation using Redis"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    def is_allowed(self, key: str, limit: int = SecurityConfig.RATE_LIMIT_REQUESTS, 
                   window: int = SecurityConfig.RATE_LIMIT_WINDOW) -> bool:
        """Check if request is allowed based on rate limit"""
        try:
            current_time = datetime.utcnow()
            window_start = current_time - timedelta(seconds=window)
            
            # Use sliding window approach
            pipe = self.redis.pipeline()
            
            # Remove old entries
            pipe.zremrangebyscore(key, 0, window_start.timestamp())
            
            # Count current requests
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(current_time.timestamp()): current_time.timestamp()})
            
            # Set expiration
            pipe.expire(key, window)
            
            results = pipe.execute()
            current_count = results[1]
            
            return current_count < limit
            
        except Exception as e:
            # If Redis is down, allow the request
            print(f"Rate limiter error: {e}")
            return True
    
    def get_remaining_requests(self, key: str, limit: int = SecurityConfig.RATE_LIMIT_REQUESTS) -> int:
        """Get remaining requests for a key"""
        try:
            current_count = self.redis.zcard(key)
            return max(0, limit - current_count)
        except:
            return limit


class SecurityMiddleware(BaseHTTPMiddleware):
    """Custom security middleware"""
    
    def __init__(self, app, rate_limiter: RateLimiter):
        super().__init__(app)
        self.rate_limiter = rate_limiter
    
    async def dispatch(self, request: Request, call_next):
        # Rate limiting
        client_ip = request.client.host
        rate_limit_key = f"rate_limit:{client_ip}"
        
        if not self.rate_limiter.is_allowed(rate_limit_key):
            return Response(
                content=json.dumps({"detail": "Rate limit exceeded"}),
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json"
            )
        
        # Add security headers
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response


class InputValidationMiddleware(BaseHTTPMiddleware):
    """Input validation middleware"""
    
    async def dispatch(self, request: Request, call_next):
        # Validate request body for POST/PUT/PATCH requests
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                if body:
                    # Basic JSON validation
                    json.loads(body)
            except json.JSONDecodeError:
                return Response(
                    content=json.dumps({"detail": "Invalid JSON format"}),
                    status_code=status.HTTP_400_BAD_REQUEST,
                    media_type="application/json"
                )
        
        response = await call_next(request)
        return response


class PasswordHasher:
    """Password hashing utilities"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        import bcrypt
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate secure random token"""
        return secrets.token_urlsafe(length)


class CSRFProtection:
    """CSRF protection utilities"""
    
    @staticmethod
    def generate_csrf_token() -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_csrf_token(token: str, session_token: str) -> bool:
        """Validate CSRF token"""
        return secrets.compare_digest(token, session_token)


class SQLInjectionProtection:
    """SQL injection protection utilities"""
    
    @staticmethod
    def sanitize_sql_input(input_str: str) -> str:
        """Sanitize input for SQL queries"""
        if not input_str:
            return ""
        
        # Remove SQL injection patterns
        dangerous_patterns = [
            r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)',
            r'(\b(OR|AND)\s+\d+\s*=\s*\d+)',
            r'(\b(OR|AND)\s+\w+\s*=\s*\w+)',
            r'(\b(OR|AND)\s+\w+\s*LIKE\s*[\'"])',
            r'(\b(OR|AND)\s+\w+\s*IN\s*[\'"])',
            r'(\b(OR|AND)\s+\w+\s*BETWEEN\s+)',
            r'(\b(OR|AND)\s+\w+\s*IS\s+NULL)',
            r'(\b(OR|AND)\s+\w+\s*IS\s+NOT\s+NULL)',
            r'(\b(OR|AND)\s+\w+\s*EXISTS\s*[\'"])',
            r'(\b(OR|AND)\s+\w+\s*NOT\s+EXISTS\s*[\'"])',
        ]
        
        for pattern in dangerous_patterns:
            input_str = re.sub(pattern, '', input_str, flags=re.IGNORECASE)
        
        return input_str.strip()
    
    @staticmethod
    def is_safe_sql_input(input_str: str) -> bool:
        """Check if input is safe for SQL queries"""
        if not input_str:
            return True
        
        dangerous_patterns = [
            r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)',
            r'(\b(OR|AND)\s+\d+\s*=\s*\d+)',
            r'(\b(OR|AND)\s+\w+\s*=\s*\w+)',
            r'(\b(OR|AND)\s+\w+\s*LIKE\s*[\'"])',
            r'(\b(OR|AND)\s+\w+\s*IN\s*[\'"])',
            r'(\b(OR|AND)\s+\w+\s*BETWEEN\s+)',
            r'(\b(OR|AND)\s+\w+\s*IS\s+NULL)',
            r'(\b(OR|AND)\s+\w+\s*IS\s+NOT\s+NULL)',
            r'(\b(OR|AND)\s+\w+\s*EXISTS\s*[\'"])',
            r'(\b(OR|AND)\s+\w+\s*NOT\s+EXISTS\s*[\'"])',
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, input_str, re.IGNORECASE):
                return False
        
        return True


class XSSProtection:
    """XSS protection utilities"""
    
    @staticmethod
    def sanitize_html(html: str) -> str:
        """Sanitize HTML content to prevent XSS"""
        if not html:
            return ""
        
        # Remove script tags and their content
        html = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', html, flags=re.IGNORECASE)
        
        # Remove javascript: protocols
        html = re.sub(r'javascript:', '', html, flags=re.IGNORECASE)
        
        # Remove on* event handlers
        html = re.sub(r'\son\w+\s*=', '', html, flags=re.IGNORECASE)
        
        # Remove data: protocols
        html = re.sub(r'data:', '', html, flags=re.IGNORECASE)
        
        return html
    
    @staticmethod
    def is_safe_html(html: str) -> bool:
        """Check if HTML content is safe"""
        if not html:
            return True
        
        dangerous_patterns = [
            r'<script\b',
            r'javascript:',
            r'\son\w+\s*=',
            r'data:',
            r'<iframe\b',
            r'<object\b',
            r'<embed\b',
            r'<applet\b',
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, html, re.IGNORECASE):
                return False
        
        return True


def setup_security_middleware(app, redis_client: redis.Redis):
    """Setup security middleware for the application"""
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=SecurityConfig.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=SecurityConfig.ALLOWED_METHODS,
        allow_headers=SecurityConfig.ALLOWED_HEADERS,
    )
    
    # Trusted host middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=SecurityConfig.TRUSTED_HOSTS
    )
    
    # Gzip middleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Custom security middleware
    rate_limiter = RateLimiter(redis_client)
    app.add_middleware(SecurityMiddleware, rate_limiter=rate_limiter)
    
    # Input validation middleware
    app.add_middleware(InputValidationMiddleware)
    
    return app

