from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from jose import jwt
from backend.db.database import get_db
from backend.models.product import Product
from backend.schemas.product import ProductCreate
from backend.utils.jwt import create_access_token
from backend.core.config import settings
import shutil, os, uuid
from backend.dependencies.auth import get_current_user,oauth2_scheme

router=APIRouter()


UPLOAD_DIR = "uploads"

# ================= IMAGE UPLOAD =================
@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    filename = f"{uuid.uuid4()}.{file.filename.split('.')[-1]}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "image_url": f"http://127.0.0.1:8000/uploads/{filename}"
    }

@router.post("/products")
def create_product(
    product: ProductCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    user_id = payload.get("user_id")

    new_product = Product(
        name=product.name,
        village=product.village,
        phone=product.phone,
        price=product.price,
        quantity=product.quantity,
        available_date=product.available_date,
        available_time=product.available_time,
        description=product.description,
        image_url=product.image_url,
        farmer_id=user_id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {"message": "Product added successfully"}

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()

    return products

@router.get("/products/my")
def get_my_products(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("user_id")

    products = db.query(Product).filter(Product.farmer_id == user_id).all()

    return products