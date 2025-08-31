from fastapi import FastAPI

app = FastAPI(
    title="Innovative School Platform API",
    description="AI-powered, multilingual school management platform for Cameroon",
    version="0.1.0"
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Innovative School Platform API!"}
