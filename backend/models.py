from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, Boolean, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, validator, HttpUrl, constr, confloat
from decimal import Decimal

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    description = Column(String(1000), nullable=True)
    price = Column(Float, CheckConstraint('price >= 0'), nullable=False)
    currency = Column(String(3), default="TRY")
    image_url = Column(String(500), nullable=False)
    product_url = Column(String(500), nullable=True)
    category = Column(String(50), index=True, nullable=False)
    brand = Column(String(50), index=True, nullable=True)
    stock = Column(Integer, CheckConstraint('stock >= 0'), default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('name', 'brand', name='unique_product_brand'),
        CheckConstraint('length(name) >= 3', name='name_length_check'),
    )

# Pydantic modelleri
class ProductBase(BaseModel):
    name: constr(min_length=3, max_length=100)
    description: Optional[constr(max_length=1000)] = None
    price: confloat(gt=0)
    currency: constr(min_length=3, max_length=3) = "TRY"
    image_url: HttpUrl
    product_url: Optional[HttpUrl] = None
    category: constr(min_length=2, max_length=50)
    brand: Optional[constr(min_length=2, max_length=50)] = None
    stock: int = 0
    is_active: bool = True

    @validator('stock')
    def stock_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError('Stock cannot be negative')
        return v

    @validator('currency')
    def currency_must_be_valid(cls, v):
        valid_currencies = {'TRY', 'USD', 'EUR', 'GBP'}
        if v not in valid_currencies:
            raise ValueError(f'Currency must be one of {valid_currencies}')
        return v

    @validator('price')
    def convert_price_to_two_decimals(cls, v):
        return float(Decimal(str(v)).quantize(Decimal('0.01')))

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[constr(min_length=3, max_length=100)] = None
    price: Optional[confloat(gt=0)] = None
    image_url: Optional[HttpUrl] = None
    category: Optional[constr(min_length=2, max_length=50)] = None

class ProductInDB(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductResponse(ProductInDB):
    price_formatted: str

    @validator('price_formatted', pre=True, always=True)
    def format_price(cls, v, values):
        price = values.get('price', 0)
        currency = values.get('currency', 'TRY')
        currency_symbols = {'TRY': '₺', 'USD': '$', 'EUR': '€', 'GBP': '£'}
        return f"{currency_symbols.get(currency, '')}{price:,.2f}"
