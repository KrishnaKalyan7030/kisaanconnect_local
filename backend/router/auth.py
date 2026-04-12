from fastapi import APIRouter, Request, HTTPException,Depends,Response
from fastapi.templating import Jinja2Templates
# from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional
from backend.utils.security import hash_password,verify_password
from backend.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from backend.db.database import get_db
from backend.models.user import UserType,User
from sqlalchemy.orm import Session
from backend.dependencies.auth import get_current_user,oauth2_scheme
from backend.utils.jwt import create_access_token
from backend.core.config import settings



router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

templates = Jinja2Templates(directory='frontend')



################# HTML Page Routes ##################
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
# @router.get("/me")
# async def get_current_user_info(token: str = Depends(oauth2_scheme)):
#     """Returns information of the currently logged-in user"""
#     # return {
#     #     "status": "success",
#     #     "user": {
#     #         "id": current_user.id,
#     #         "full_name": current_user.full_name,
#     #         "email": current_user.email,
#     #         "phone": current_user.phone,
#     #         "village": current_user.village,
#     #         "district": current_user.district,
#     #         "user_type": current_user.user_type.value
#     #     }
#     # }
#     return {'token':token}


from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from backend.db.database import get_db
from backend.models.user import User



@router.get("/me")
async def get_current_user_info(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalid")

    #  Fetch user from DB
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    #  Return full user data
    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": user.user_type.value,  # IMPORTANT (matches frontend)
        "village": user.village,
        "district": user.district
    }


#api for creating new use 
@router.post("/register")
async def register_user(data: RegisterRequest,db:Session=Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Check if email already exists
    existing_email=db.query(User).filter(User.email==data.email).first()
    if existing_email==True:
        return HTTPException(status_code=400,detail='Email already registered')
    
    #check if phone_no already exist
    existing_phone=db.query(User).filter(User.phone==data.phone).first()
    if existing_phone:
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
        "message": f"{data.user_type.capitalize()} registered successfully!",
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

########## Login API #########################
@router.post("/login", response_model=TokenResponse)
async def login_user(data: LoginRequest,response:Response ,db: Session = Depends(get_db)):

   #access the user
    user = db.query(User).filter(User.email == data.email).first()

    if user is None:
        raise HTTPException(status_code=401, detail='User not found')

    #verify password here

    password_verified = verify_password(
        data.password,
        user.hashed_password
    )

    if not password_verified:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if user.user_type.value.lower() != data.user_type.lower():
        raise HTTPException(
            status_code=403,
            detail=f"You are registered as a {user.user_type.value}. Please select the correct role."
        )

    # Step 3: Create payload
    payload = {
        "sub": user.email,
        "user_id": user.id,  # kept your original
        "user_type": user.user_type.value  # added for clarity
    }

    # Step 4: Generate token
    access_token = create_access_token(payload)

    # Set token in cookie so browser stores it
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax",
        secure=False,    # Set True in production (HTTPS)
        max_age=3600
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user.user_type.value,
        "message": "Login successful. Welcome to Kisaan Connect!"
    }
    