from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.restaurant import Restaurant as RestaurantModel
from app.schemas.restaurant import Restaurant, RestaurantCreate, RestaurantUpdate

restaurant_router = APIRouter()

@restaurant_router.post("/", response_model=Restaurant)
def create_restaurant(restaurant: RestaurantCreate, db: Session = Depends(get_db)):
    db_restaurant = RestaurantModel(**restaurant.dict())
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@restaurant_router.get("/", response_model=List[Restaurant])
def get_restaurants(
    skip: int = 0, 
    limit: int = 100, 
    cuisine_type: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RestaurantModel)
    
    if cuisine_type:
        query = query.filter(RestaurantModel.cuisine_type == cuisine_type)
    
    if city:
        query = query.filter(RestaurantModel.city == city)
    
    return query.offset(skip).limit(limit).all()

@restaurant_router.get("/{restaurant_id}", response_model=Restaurant)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    db_restaurant = db.query(RestaurantModel).filter(RestaurantModel.id == restaurant_id).first()
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return db_restaurant

@restaurant_router.put("/{restaurant_id}", response_model=Restaurant)
def update_restaurant(
    restaurant_id: int, 
    restaurant: RestaurantUpdate, 
    db: Session = Depends(get_db)
):
    db_restaurant = db.query(RestaurantModel).filter(RestaurantModel.id == restaurant_id).first()
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    update_data = restaurant.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_restaurant, key, value)
    
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@restaurant_router.delete("/{restaurant_id}", response_model=Restaurant)
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    db_restaurant = db.query(RestaurantModel).filter(RestaurantModel.id == restaurant_id).first()
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    db.delete(db_restaurant)
    db.commit()
    return db_restaurant