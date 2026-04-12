from sqlalchemy import Column,Integer,String,Float,ForeignKey
from backend.db.database import Base
from backend.models.user import User

class Product(Base):
    __tablename__='products'
    id=Column(Integer,primary_key=True,index=True)
    image_url=Column(String)
    name=Column(String,nullable=False)
    village=Column(String,nullable=False)
    phone=Column(String,nullable=False)
    price=Column(Float,nullable=False)
    quantity=Column(Float,nullable=False)
    available_date=Column(String)
    available_time=Column(String)
    description=(Column(String))
    farmer_id=Column(Integer,ForeignKey(User.id))


