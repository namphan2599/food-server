from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class RestaurantBase(BaseModel):
    """
    Shared properties for restaurant models.

    This is the base model for the Restaurant, RestaurantCreate, and RestaurantUpdate models.
    """

    name: str = Field(..., description="Name of the restaurant")
    description: Optional[str] = Field(None, description="Description of the restaurant")
    address: str = Field(..., description="Street address of the restaurant")
    city: str = Field(..., description="City where the restaurant is located")
    state: str = Field(..., description="State where the restaurant is located")
    postal_code: str = Field(..., description="Postal code")
    country: str = Field(..., description="Country where the restaurant is located")
    phone: Optional[str] = Field(None, description="Contact phone number")
    email: Optional[str] = Field(None, description="Contact email address")
    website: Optional[str] = Field(None, description="Restaurant website")
    cuisine_type: Optional[str] = Field(None, description="Type of cuisine served")
    price_range: Optional[str] = Field(None, description="Price range category")
    rating: Optional[float] = Field(None, ge=0, le=5, description="Average rating (0-5)")
    is_active: bool = Field(default=True, description="Whether the restaurant is currently active")

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantUpdate(RestaurantBase):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    is_active: Optional[bool] = None

class Restaurant(RestaurantBase):
    id: int = Field(..., description="Unique identifier for the restaurant")
    created_at: datetime = Field(..., description="Timestamp when the restaurant was created")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the restaurant was last updated")
    
    class Config:
        from_attributes = True  # This enables ORM model -> Pydantic model conversion
