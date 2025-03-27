from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.menu import MenuItem as MenuItemModel, Category as CategoryModel
from app.schemas.menu import MenuItem, MenuItemCreate, MenuItemUpdate, Category, CategoryCreate, CategoryUpdate, MenuItemWithCategory, CategoryWithItems

menu_router = APIRouter()

# Category endpoints
@menu_router.post("/categories/", response_model=Category)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = CategoryModel(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@menu_router.get("/categories/", response_model=List[Category])
def get_categories(
    restaurant_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(CategoryModel)
    
    if restaurant_id:
        query = query.filter(CategoryModel.restaurant_id == restaurant_id)
    
    return query.offset(skip).limit(limit).all()

@menu_router.get("/categories/{category_id}", response_model=CategoryWithItems)
def get_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@menu_router.put("/categories/{category_id}", response_model=Category)
def update_category(
    category_id: int, 
    category: CategoryUpdate, 
    db: Session = Depends(get_db)
):
    db_category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@menu_router.delete("/categories/{category_id}", response_model=Category)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return db_category

# Menu item endpoints
@menu_router.post("/items/", response_model=MenuItem)
def create_menu_item(menu_item: MenuItemCreate, db: Session = Depends(get_db)):
    db_menu_item = MenuItemModel(**menu_item.dict())
    db.add(db_menu_item)
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

@menu_router.get("/items/", response_model=List[MenuItem])
def get_menu_items(
    restaurant_id: Optional[int] = None,
    category_id: Optional[int] = None,
    is_vegetarian: Optional[bool] = None,
    is_vegan: Optional[bool] = None,
    is_gluten_free: Optional[bool] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(MenuItemModel)
    
    if restaurant_id:
        query = query.filter(MenuItemModel.restaurant_id == restaurant_id)
    
    if category_id:
        query = query.filter(MenuItemModel.category_id == category_id)
    
    if is_vegetarian is not None:
        query = query.filter(MenuItemModel.is_vegetarian == is_vegetarian)
    
    if is_vegan is not None:
        query = query.filter(MenuItemModel.is_vegan == is_vegan)
    
    if is_gluten_free is not None:
        query = query.filter(MenuItemModel.is_gluten_free == is_gluten_free)
    
    return query.offset(skip).limit(limit).all()

@menu_router.get("/items/{item_id}", response_model=MenuItemWithCategory)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    db_menu_item = db.query(MenuItemModel).filter(MenuItemModel.id == item_id).first()
    if db_menu_item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return db_menu_item

@menu_router.put("/items/{item_id}", response_model=MenuItem)
def update_menu_item(
    item_id: int, 
    menu_item: MenuItemUpdate, 
    db: Session = Depends(get_db)
):
    db_menu_item = db.query(MenuItemModel).filter(MenuItemModel.id == item_id).first()
    if db_menu_item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    update_data = menu_item.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_menu_item, key, value)
    
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

@menu_router.delete("/items/{item_id}", response_model=MenuItem)
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    db_menu_item = db.query(MenuItemModel).filter(MenuItemModel.id == item_id).first()
    if db_menu_item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db.delete(db_menu_item)
    db.commit()
    return db_menu_item