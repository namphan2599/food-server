from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, HttpUrl

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    display_order: Optional[int] = 0

class CategoryCreate(CategoryBase):
    restaurant_id: int

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None

class Category(CategoryBase):
    id: int
    restaurant_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[HttpUrl] = None
    is_vegetarian: Optional[bool] = False
    is_vegan: Optional[bool] = False
    is_gluten_free: Optional[bool] = False
    spice_level: Optional[int] = 0
    is_available: Optional[bool] = True

class MenuItemCreate(MenuItemBase):
    restaurant_id: int
    category_id: Optional[int] = None

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[HttpUrl] = None
    category_id: Optional[int] = None
    is_vegetarian: Optional[bool] = None
    is_vegan: Optional[bool] = None
    is_gluten_free: Optional[bool] = None
    spice_level: Optional[int] = None
    is_available: Optional[bool] = None

class MenuItem(MenuItemBase):
    id: int
    restaurant_id: int
    category_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class MenuItemWithCategory(MenuItem):
    category: Optional[Category] = None

class CategoryWithItems(Category):
    items: List[MenuItem] = []