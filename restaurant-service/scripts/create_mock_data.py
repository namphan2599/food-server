import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from faker import Faker
import random
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text
from app.core.database import SessionLocal, engine, Base
from app.models.restaurant import Restaurant

# Initialize Faker
fake = Faker()

# Create cuisine types and price ranges for variety
CUISINE_TYPES = [
    "Italian", "Japanese", "Chinese", "Mexican", "Indian", 
    "Thai", "French", "American", "Mediterranean", "Vietnamese",
    "Korean", "Greek", "Spanish", "Middle Eastern", "Brazilian"
]

PRICE_RANGES = ["$", "$$", "$$$", "$$$$"]

def create_database():
    """Create the database if it doesn't exist"""
    # Connect to default postgres database
    default_engine = create_engine('postgresql://postgres:postgres@postgres:5432/postgres')
    
    with default_engine.connect() as conn:
        # Disable autocommit to run CREATE DATABASE in a transaction
        conn.execute(text("COMMIT"))
        
        # Check if database exists
        result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = 'restaurant_service'"))
        if not result.scalar():
            # Create database if it doesn't exist
            conn.execute(text("CREATE DATABASE restaurant_service"))
            print("Created database 'restaurant_service'")
        else:
            print("Database 'restaurant_service' already exists")
    
    default_engine.dispose()

def create_mock_restaurant():
    """Generate mock data for a restaurant"""
    return {
        "name": f"{fake.company()} {random.choice(['Restaurant', 'Bistro', 'Café', 'Eatery', 'Kitchen'])}",
        "description": fake.text(max_nb_chars=200),
        "address": fake.street_address(),
        "city": fake.city(),
        "state": fake.state(),
        "postal_code": fake.postcode(),
        "country": fake.country(),
        "phone": fake.phone_number(),
        "email": fake.company_email(),
        "website": fake.url(),
        "cuisine_type": random.choice(CUISINE_TYPES),
        "price_range": random.choice(PRICE_RANGES),
        "rating": round(random.uniform(3.0, 5.0), 1),  # Generate ratings between 3.0 and 5.0
        "is_active": random.random() > 0.1  # 90% chance of being active
    }

def create_mock_restaurants(db: Session, count: int = 50):
    """Create specified number of mock restaurants in the database"""
    restaurants = []
    for _ in range(count):
        restaurant_data = create_mock_restaurant()
        db_restaurant = Restaurant(**restaurant_data)
        restaurants.append(db_restaurant)
    
    db.add_all(restaurants)
    db.commit()
    return restaurants

def main():
    """Main function to create mock data"""
    try:
        # Create database if it doesn't exist
        create_database()
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Number of restaurants to create
        num_restaurants = 50
        
        db = SessionLocal()
        print(f"Creating {num_restaurants} mock restaurants...")
        restaurants = create_mock_restaurants(db, num_restaurants)
        print(f"Successfully created {len(restaurants)} mock restaurants!")
        
        # Print first 5 restaurants as sample
        print("\nSample of created restaurants:")
        for restaurant in restaurants[:5]:
            print(f"- {restaurant.name} ({restaurant.cuisine_type}, {restaurant.price_range})")
            
    except Exception as e:
        print(f"Error creating mock data: {e}")
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    main()
