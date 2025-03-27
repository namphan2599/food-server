from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import menu_router
from app.core.config import settings

app = FastAPI(
    title="Menu Service",
    description="Menu management service for food delivery platform",
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
app.include_router(menu_router, prefix="/api/menus", tags=["menus"])

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)