from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, HttpUrl

class RestaurantBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[HttpUrl] = None
    cuisine_type: Optional[str] = None
    price_range: Optional[str] = None

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[HttpUrl] = None
    cuisine_type: Optional[str] = None
    price_range: Optional[str] = None
    is_active: Optional[bool] = None

class RestaurantInDB(RestaurantBase):
    id: int
    rating: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class Restaurant(RestaurantInDB):
    pass