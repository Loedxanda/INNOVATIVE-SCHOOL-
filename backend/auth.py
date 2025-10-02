from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from models import UserOut
from database import get_db

SECRET_KEY = "supersecretkey"  # For production, load from environment variable!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(email: str, password: str, db: Session = Depends(get_db)):
    db_service = DatabaseService(db)
    user_obj = db_service.get_user_by_email(email)
    if not user_obj or not hasattr(user_obj, "hashed_password"):
        return None
    if not verify_password(password, user_obj.hashed_password):
        return None
    return user_obj

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        email: str = payload.get("email")
        if user_id is None or email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db_service = DatabaseService(db)
    user_obj = db_service.get_user_by_email(email)
    if user_obj is None:
        raise credentials_exception
    return user_obj

def get_current_active_user(current_user: UserOut = Depends(get_current_user)):
    return current_user
