from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    price = Column(Float)
    currency = Column(String, default="TRY")
    image_url = Column(String)
    product_url = Column(String, nullable=True)
    category = Column(String, index=True)
    brand = Column(String, index=True, nullable=True)
    stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic modelleri
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "TRY"
    image_url: str
    product_url: Optional[str] = None
    category: str
    brand: Optional[str] = None
    stock: int = 0
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductInDB(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
