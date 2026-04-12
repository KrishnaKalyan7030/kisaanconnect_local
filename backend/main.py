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
from backend.router.product import router
from backend.core.config import settings
import os
os.makedirs("uploads", exist_ok=True)  


# Create all database tables when the app starts
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kisaan Connect",
    description="Platform connecting farmers and buyers",
    version="1.0.0"
)



# Enable CORS so frontend can call backend (important for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Change to specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(router,tags=['Products'])

# Serve all frontend HTML files from root
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

app.mount("/js", StaticFiles(directory="frontend/js"), name="js")
app.mount("/css", StaticFiles(directory="frontend/css"), name="css")
app.mount("/assets", StaticFiles(directory="frontend/assets"), name="assets")

app.mount('/uploads',StaticFiles(directory='uploads'),name='uploads')


@app.get("/api/hello")
def hello():
    return {"message": "Hello from Kisaan Connect Backend!"}


# # Optional: Show settings when app starts (helpful for debugging)
# @app.on_event("startup")
# async def startup_event():
#     print("🚀 Kisaan Connect Backend is running...")
#     print(f"Database URL: {settings.DATABASE_URL}")