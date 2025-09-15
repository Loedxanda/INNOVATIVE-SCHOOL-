from fastapi import FastAPI

from .routes_users import router as users_router
from .routes_auth import router as auth_router

app = FastAPI(
    title="Innovative School Platform API",
    description="AI-powered, multilingual school management platform for Cameroon",
    version="0.1.0"
)

app.include_router(users_router)
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Innovative School Platform API!"}