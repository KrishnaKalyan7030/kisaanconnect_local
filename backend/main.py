# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from router.auth import router as auth_router  
# from router.product import router as product_router
# from core.config import settings
# from db.database import Base, engine
# from models.user import User
# from models.product import Product 
# from fastapi.staticfiles import StaticFiles
# from pathlib import Path
# from fastapi.responses import FileResponse
# import os

# # initializing fastapi app here 
# app = FastAPI(
#     title="Kisaan Connect",
#     description="Platform connecting farmers and buyers",
#     version="1.0.0"
# )



# # Create tables on startup (PostgreSQL compatible)
# @app.on_event("startup")
# async def init_db():
#     try:
#         Base.metadata.create_all(bind=engine)
#         print("✅ Database tables created/verified on PostgreSQL")
#     except Exception as e:
#         print(f"❌ Database initialization error: {e}")
       

# # CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Serve uploaded files (ADD THIS BEFORE YOUR ROUTERS)
# uploads_path = Path("../uploads")  # Path to kisaanconnect/uploads/
# if uploads_path.exists():
#     app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")
#     app.mounts('/static',StaticFiles(directory='frontend'),name='static')
# # FIRST: Mount static files (CSS, JS)
# app.mount("/css", StaticFiles(directory="../frontend/css"), name="css")
# app.mount("/js", StaticFiles(directory="../frontend/js"), name="js")
# app.mount("/assets", StaticFiles(directory="../frontend/assets"), name="assets")


# # Include routers
# app.include_router(auth_router, tags=['Authentication'])
# app.include_router(product_router, tags=['Products'])





# # SECOND: Serve HTML pages
# @app.get("/")
# async def serve_index():
#     return FileResponse("../frontend/index.html")
# # @app.get("/")
# # def root():
# #     return {
# #         "status": "API running", 
# #         "database": "PostgreSQL",
# #         "message": "KisaanConnect Backend"
# #     }




# @app.get("/health")
# def health_check():
#     return {"status": "healthy"}



















from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from router.auth import router as auth_router  
from router.product import router as product_router
from core.config import settings
from db.database import Base, engine
from models.user import User
from models.product import Product 
from pathlib import Path
import os

# Initializing fastapi app here 
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

# ========== FIXED: STATIC FILES CONFIGURATION ==========
# Get the absolute path to frontend folder
FRONTEND_PATH = Path(__file__).parent.parent / "frontend"  # Goes up from backend/ to kisaanconnect/, then into frontend/
UPLOADS_PATH = Path(__file__).parent.parent / "uploads"

# Mount static folders (only if they exist)
if FRONTEND_PATH.exists():
    # Mount individual folders from frontend
    css_path = FRONTEND_PATH / "css"
    js_path = FRONTEND_PATH / "js"
    assets_path = FRONTEND_PATH / "assets"
    
    if css_path.exists():
        app.mount("/css", StaticFiles(directory=str(css_path)), name="css")
    if js_path.exists():
        app.mount("/js", StaticFiles(directory=str(js_path)), name="js")
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")
    
    print(f"✅ Frontend folder found at: {FRONTEND_PATH}")
else:
    print(f"❌ Frontend folder NOT found at: {FRONTEND_PATH}")

# Mount uploads folder
if UPLOADS_PATH.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_PATH)), name="uploads")
    print(f"✅ Uploads folder found at: {UPLOADS_PATH}")

# Include API routers
app.include_router(auth_router, tags=['Authentication'])
app.include_router(product_router, tags=['Products'])

# ========== FIXED: HTML PAGE ROUTES ==========
# Serve HTML pages (keep both API and UI working)

@app.get("/api-status")  # Renamed to avoid conflict
def api_status():
    return {
        "status": "API running", 
        "database": "PostgreSQL",
        "message": "KisaanConnect Backend"
    }

@app.get("/")
async def serve_index():
    index_path = FRONTEND_PATH / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"error": "index.html not found", "path": str(index_path)}

@app.get("/login")
async def serve_login():
    login_path = FRONTEND_PATH / "login.html"
    if login_path.exists():
        return FileResponse(str(login_path))
    return {"error": "login.html not found"}

@app.get("/register")
async def serve_register():
    register_path = FRONTEND_PATH / "register.html"
    if register_path.exists():
        return FileResponse(str(register_path))
    return {"error": "register.html not found"}

@app.get("/marketplace")
async def serve_marketplace():
    marketplace_path = FRONTEND_PATH / "marketplace.html"
    if marketplace_path.exists():
        return FileResponse(str(marketplace_path))
    return {"error": "marketplace.html not found"}

# Catch-all for other .html files (like dashboard pages)
@app.get("/{page}.html")
async def serve_html_pages(page: str):
    file_path = FRONTEND_PATH / f"{page}.html"
    if file_path.exists():
        return FileResponse(str(file_path))
    return {"error": f"{page}.html not found"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}