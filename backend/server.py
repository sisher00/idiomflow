from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import csv
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models for IdiomFlow
class Idiom(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    idiom: str
    meaning: str
    example: str
    related_idiom: str
    difficulty_level: str
    category: str
    origin: str

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Load idioms data from JSON file
IDIOMS_DATA = []

def load_idioms_data():
    """Load idioms from JSON file"""
    global IDIOMS_DATA
    
    try:
        idioms_file_path = ROOT_DIR / 'idioms.json'
        if idioms_file_path.exists():
            with open(idioms_file_path, 'r', encoding='utf-8') as f:
                idioms_data = json.load(f)
                IDIOMS_DATA = [Idiom(id=str(uuid.uuid4()), **idiom) for idiom in idioms_data]
                print(f"Loaded {len(IDIOMS_DATA)} idioms from JSON file")
        else:
            print("Idioms JSON file not found, using sample data")
            # Fallback sample data
            sample_idioms = [
                {
                    "idiom": "Break the ice",
                    "meaning": "To initiate conversation in a social setting",
                    "example": "She told a joke to break the ice at the meeting.",
                    "related_idiom": "Start the ball rolling",
                    "difficulty_level": "Easy",
                    "category": "Popular",
                    "origin": "From old sailing ships breaking ice to create a path"
                }
            ]
            IDIOMS_DATA = [Idiom(id=str(uuid.uuid4()), **idiom) for idiom in sample_idioms]
    except Exception as e:
        print(f"Error loading idioms: {e}")
        IDIOMS_DATA = []

# Initialize data on startup
load_idioms_data()

# IdiomFlow API Endpoints
@api_router.get("/idioms", response_model=List[Idiom])
async def get_all_idioms():
    """Get all idioms"""
    return IDIOMS_DATA

@api_router.get("/idioms/search")
async def search_idioms(
    q: Optional[str] = Query(None, description="Search query for idiom or meaning"),
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    limit: Optional[int] = Query(50, description="Maximum number of results")
):
    """Search and filter idioms"""
    results = IDIOMS_DATA.copy()
    
    if q:
        q_lower = q.lower()
        results = [
            idiom for idiom in results 
            if q_lower in idiom.idiom.lower() or q_lower in idiom.meaning.lower()
        ]
    
    if category:
        results = [idiom for idiom in results if idiom.category.lower() == category.lower()]
    
    if difficulty:
        results = [idiom for idiom in results if idiom.difficulty_level.lower() == difficulty.lower()]
    
    return results[:limit]

@api_router.get("/categories")
async def get_categories():
    """Get all available categories"""
    categories = list(set([idiom.category for idiom in IDIOMS_DATA]))
    return {"categories": categories}

@api_router.get("/difficulties")
async def get_difficulty_levels():
    """Get all difficulty levels"""
    difficulties = list(set([idiom.difficulty_level for idiom in IDIOMS_DATA]))
    return {"difficulties": difficulties}

@api_router.get("/stats")
async def get_stats():
    """Get statistics about the idioms database"""
    total_idioms = len(IDIOMS_DATA)
    categories = len(set([idiom.category for idiom in IDIOMS_DATA]))
    difficulties = len(set([idiom.difficulty_level for idiom in IDIOMS_DATA]))
    
    return {
        "total_idioms": total_idioms,
        "categories": categories,
        "difficulty_levels": difficulties
    }

# Original endpoints
@api_router.get("/")
async def root():
    return {"message": "Welcome to IdiomFlow API - Educational Idioms Platform by Sisher Pant & LinkFlow IT Tech"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
