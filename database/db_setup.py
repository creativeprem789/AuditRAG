import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load .env from the project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Read database URL
DATABASE_URL = os.getenv("MYSQL_URL")

if not DATABASE_URL:
    raise ValueError("MYSQL_URL is missing from the .env file")

# Read TiDB SSL certificate path
SSL_CA = os.getenv("MYSQL_SSL_CA")

connect_args = {}

if SSL_CA:
    connect_args["ssl"] = {"ca": SSL_CA}

# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

# Create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for database models
Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
