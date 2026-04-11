from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.router.auth import router
from backend.core.config import settings
from backend.db.database import Base,engine
# IMPORTANT: Import all models so that create_all() knows about them
from backend.models.user import User   # ← This line is critical

# Import router and settings
from backend.router.auth import router
from backend.core.config import settings
# Create all database tables when the app starts
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Kisaan Connect",
    description="Platform connecting farmers and buyers",
    version="1.0.0"
)

app.include_router(router)



app.mount("/static", StaticFiles(directory="frontend/js"), name="static")
app.mount("/static", StaticFiles(directory="frontend/css"), name="static")
app.mount("/static", StaticFiles(directory="frontend/assets"), name="static")

# Enable CORS so frontend can call backend (important for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Change to specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/hello")
def hello():
    return {"message": "Hello from Kisaan Connect Backend!"}


# # Optional: Show settings when app starts (helpful for debugging)
# @app.on_event("startup")
# async def startup_event():
#     print("🚀 Kisaan Connect Backend is running...")
#     print(f"Database URL: {settings.DATABASE_URL}")