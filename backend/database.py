from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
from dotenv import load_dotenv
import time
from loguru import logger

load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "postgres")

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}"

# Connection pooling configuration
engine = create_engine(
    DATABASE_URL,
    pool_size=5,  # Maximum number of permanent connections
    max_overflow=10,  # Maximum number of additional connections
    pool_timeout=30,  # Seconds to wait before giving up on getting a connection
    pool_recycle=1800,  # Recycle connections after 30 minutes
    echo=False  # Set to True for debugging SQL queries
)

# Add connection event listeners
@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    logger.info("Database connection established")

@event.listens_for(engine, "checkout")
def checkout(dbapi_connection, connection_record, connection_proxy):
    logger.debug("Database connection retrieved from pool")

@event.listens_for(engine, "checkin")
def checkin(dbapi_connection, connection_record):
    logger.debug("Database connection returned to pool")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency with retry logic
def get_db(max_retries=3, retry_delay=1):
    attempt = 0
    last_error = None

    while attempt < max_retries:
        try:
            db = SessionLocal()
            # Test the connection
            db.execute("SELECT 1")
            try:
                yield db
            finally:
                db.close()
            return
        except OperationalError as e:
            last_error = e
            attempt += 1
            if attempt < max_retries:
                logger.warning(f"Database connection attempt {attempt} failed. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            db.close()

    logger.error(f"Failed to connect to database after {max_retries} attempts: {last_error}")
    raise last_error

Base = declarative_base()
