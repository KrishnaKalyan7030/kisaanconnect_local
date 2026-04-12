from pydantic import BaseModel

class ProductCreate(BaseModel):
    image_url:str
    name:str
    village:str
    phone:str
    price:str
    quantity:str
    available_date:str
    available_time:str
    description:str
    