import os
import uuid
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "generated_reports"

load_dotenv(PROJECT_ROOT / ".env")
MODEL_PATH = Path(os.environ.get("MODEL_PATH", str(PROJECT_ROOT / "models" / "epoch80.pt")))


def ensure_directories() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)


def env(name: str, default: str | None = None) -> str | None:
    return os.getenv(name, default)


def build_unique_filename(original_name: str) -> str:
    extension = Path(original_name).suffix.lower() or ".jpg"
    return f"{uuid.uuid4().hex}{extension}"


def sanitize_email(email: str) -> str:
    return email.strip().lower()
