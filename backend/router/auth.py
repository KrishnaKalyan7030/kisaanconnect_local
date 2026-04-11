from fastapi import APIRouter, Request, HTTPException,Depends
from fastapi.templating import Jinja2Templates
# from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional
from backend.utils.security import hash_password
from backend.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from backend.db.database import get_db
from backend.models.user import UserType,User
from sqlalchemy.orm import Session
from backend.dependencies.auth import get_current_user,oauth2_scheme
from backend.utils import security
from backend.utils import jwt



router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

templates = Jinja2Templates(directory='frontend')



# Routes
@router.get("/")
def test(request: Request):
    return templates.TemplateResponse(
        request=request,
        name='index.html',
        context={'request': request}
    )
@router.get('/register')
async def register_user(request:Request):
    return templates.TemplateResponse(
        request=request,
        name='register.html',
        context={'request':request}
    )

@router.get('/login')
async def login_user(request:Request):
    return templates.TemplateResponse(
        request=request,
        name='login.html',
        context={'request':request}

    )





# ====================== PROTECTED ROUTE ======================
@router.get("/me")
async def get_current_user_info(token: str = Depends(oauth2_scheme)):
    """Returns information of the currently logged-in user"""
    # return {
    #     "status": "success",
    #     "user": {
    #         "id": current_user.id,
    #         "full_name": current_user.full_name,
    #         "email": current_user.email,
    #         "phone": current_user.phone,
    #         "village": current_user.village,
    #         "district": current_user.district,
    #         "user_type": current_user.user_type.value
    #     }
    # }
    return {'token':token}

@router.post("/register")
async def register_user(data: RegisterRequest,db:Session=Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Check if email already exists
    existing_email=db.query(User).filter(User.email==data.email).first()
    if existing_email==True:
        return HTTPException(status_code=400,detail='Email already registered')
    
    #check if phone_no already exist
    existing_phone=db.query(User).filter(User.email==data.email).first()
    if existing_email:
        return HTTPException(status_code=400,detail="Phone number already registered")
    
    
   # Hash the password before "saving"
    hashed_password = hash_password(data.password)

   # Create new user
    new_user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        village=data.village,
        district=data.district,
        state=data.state,
        hashed_password=hashed_password,
        user_type=UserType(data.user_type)   # Convert string to Enum
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success",
        "message": f"{data.user_type.capitalize()} account created successfully!",
        "user": {
            "full_name": data.full_name,
            "email": data.email,
            "phone": data.phone,
            "village": data.village,
            "district": data.district,
            "state": data.state,
            "user_type": data.user_type
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login_user(data: LoginRequest, db: Session = Depends(get_db)):

   #access the user
    user = db.query(User).filter(User.email == data.email).first()

    if user is None:
        raise HTTPException(status_code=401, detail='User not found')

    #verify password here
    password_verified = verify_password(
        data.password,
        hash_password(data.password)
    )

    if not password_verified:
        raise HTTPException(status_code=401, detail='Invalid credentials')

    # Step 3: Create payload
    payload = {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role
    }

    # Step 4: Generate token
    access_token = create_access_token(payload)

    # Step 5: Return response
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user.role,
        "message": "Login successful. Welcome to Kisaan Connect!"
    }
    