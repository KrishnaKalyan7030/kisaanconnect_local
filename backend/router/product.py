from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.models.product import Product
from backend.schemas.product import ProductCreate
from backend.dependencies.auth import get_current_user
import shutil, os, uuid

router = APIRouter(prefix="/products", tags=["Products"])

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


# ================= CREATE PRODUCT =================
@router.post("/")
def create_product(
    product: ProductCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # only farmers are allowed to add their products 
    print("USER TYPE:", current_user.user_type)
    print("USER TYPE VALUE:", current_user.user_type.value)
    if current_user.user_type.value != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can add products")

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
        farmer_id=current_user.id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product added successfully",
        "product_id": new_product.id
    }


# ================= GET ALL PRODUCTS =================
@router.get("/")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


# ================= GET MY PRODUCTS =================
@router.get("/my")
def get_my_products(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    products = db.query(Product).filter(
        Product.farmer_id == current_user.id
    ).all()

    return products