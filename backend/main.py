from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router.auth import router as auth_router  
from router.product import router as product_router
from core.config import settings
from db.database import Base, engine
from models.user import User
from models.product import Product 
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

# initializing fastapi app here 
app = FastAPI(
    title="Kisaan Connect",
    description="Platform connecting farmers and buyers",
    version="1.0.0"
)



# Create tables on startup (PostgreSQL compatible)
@app.on_event("startup")
async def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified on PostgreSQL")
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
       

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (ADD THIS BEFORE YOUR ROUTERS)
uploads_path = Path("../uploads")  # Path to kisaanconnect/uploads/
if uploads_path.exists():
    app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")
# Include routers
app.include_router(auth_router, tags=['Authentication'])
app.include_router(product_router, tags=['Products'])

@app.get("/")
def root():
    return {
        "status": "API running", 
        "database": "PostgreSQL",
        "message": "KisaanConnect Backend"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}