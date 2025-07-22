from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import restaurant_router
from app.core.config import settings

app = FastAPI(
    title="Restaurant Service",
    description="Restaurant management service for food delivery platform",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(restaurant_router, prefix="/api/restaurants", tags=["restaurants"])

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthyyeah2"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)