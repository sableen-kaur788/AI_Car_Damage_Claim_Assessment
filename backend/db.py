import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Configure it in your environment or .env file "
        "using your Supabase PostgreSQL connection string."
    )

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from . import models  # noqa: F401

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection established successfully.")
    except Exception as exc:
        raise RuntimeError("Failed to connect to the configured PostgreSQL database.") from exc

    Base.metadata.create_all(bind=engine)

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE password_reset_tokens
                ADD COLUMN IF NOT EXISTS used_at TIMESTAMP
                """
            )
        )
        connection.execute(
            text(
                """
                UPDATE users
                SET updated_at = COALESCE(updated_at, created_at)
                WHERE updated_at IS NULL
                """
            )
        )
