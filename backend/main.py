from __future__ import annotations

import json
import shutil
from pathlib import Path

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from .auth import get_current_user, router as auth_router, serialize_user
from .cost_model import summarize_detections
from .db import engine, get_db, init_db
from .inference import analyze_image
from .llm_report import generate_insurance_report
from .models import DetectionHistory, Report, User
from .pdf_generator import build_pdf_report
from .utils import REPORT_DIR, UPLOAD_DIR, build_unique_filename, ensure_directories, env


class HistoryItem(BaseModel):
    id: int
    severity: str
    total_damage_area: float
    total_estimated_cost: float
    average_confidence: float
    llm_report: str
    original_image_url: str
    annotated_image_url: str
    detections: list[dict]
    summary: dict
    charts: dict
    report_id: int | None
    created_at: str


app = FastAPI(title="AI Car Damage Detection and Insurance Report System", version="1.0.0")
app.include_router(auth_router)
ensure_directories()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in env("CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    ensure_directories()
    init_db()


app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/reports", StaticFiles(directory=str(REPORT_DIR)), name="reports")


def _history_item(record: DetectionHistory) -> dict:
    detections = json.loads(record.detections_json)
    metrics = summarize_detections(detections)
    return {
        "id": record.id,
        "severity": record.severity,
        "total_damage_area": record.total_damage_area,
        "total_estimated_cost": record.total_estimated_cost,
        "average_confidence": metrics["summary"]["average_confidence"],
        "llm_report": record.llm_report,
        "original_image_url": f"/uploads/{Path(record.original_image_path).name}",
        "annotated_image_url": f"/uploads/{Path(record.annotated_image_path).name}",
        "detections": metrics["detections"],
        "summary": metrics["summary"],
        "charts": metrics["charts"],
        "report_id": record.report.id if record.report else None,
        "created_at": record.created_at.isoformat(),
    }


@app.get("/health")
def health():
    checks = {
        "database_connected": False,
        "groq_api_key_configured": bool(env("GROQ_API_KEY")),
        "jwt_secret_configured": bool(env("JWT_SECRET")),
    }

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        checks["database_connected"] = True
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "checks": checks,
                "database_error": str(exc),
            },
        )

    overall_status = "ok" if all(checks.values()) else "degraded"
    status_code = 200 if overall_status == "ok" else 503
    return JSONResponse(status_code=status_code, content={"status": overall_status, "checks": checks})


@app.post("/analyze")
def analyze(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in {"image/jpeg", "image/png", "image/jpg", "image/webp", "image/avif"}:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    original_name = build_unique_filename(file.filename or "upload.jpg")
    annotated_name = f"annotated_{original_name}"
    pdf_name = f"report_{Path(original_name).stem}.pdf"

    original_path = UPLOAD_DIR / original_name
    annotated_path = UPLOAD_DIR / annotated_name
    pdf_path = REPORT_DIR / pdf_name

    with original_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        analysis = analyze_image(original_path, annotated_path)
        report_text = generate_insurance_report(env("GROQ_API_KEY"), current_user.full_name, original_name, analysis)

        detection_record = DetectionHistory(
            user_id=current_user.id,
            original_image_path=str(original_path),
            annotated_image_path=str(annotated_path),
            detections_json=json.dumps(analysis["detections"]),
            severity=analysis["severity"],
            total_damage_area=analysis["total_damage_area"],
            total_estimated_cost=analysis["total_estimated_cost"],
            llm_report=report_text,
        )
        db.add(detection_record)
        db.commit()
        db.refresh(detection_record)

        build_pdf_report(
            output_path=pdf_path,
            user_name=current_user.full_name,
            user_email=current_user.email,
            original_image_path=original_path,
            annotated_image_path=annotated_path,
            analysis=analysis,
            report_text=report_text,
        )

        report_record = Report(detection_id=detection_record.id, pdf_path=str(pdf_path), report_text=report_text)
        db.add(report_record)
        db.commit()
        db.refresh(report_record)
        db.refresh(detection_record)

    except Exception as exc:
        if original_path.exists():
            original_path.unlink()
        if annotated_path.exists():
            annotated_path.unlink()
        if pdf_path.exists():
            pdf_path.unlink()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc

    return {
        "message": "Analysis completed successfully",
        "user": serialize_user(current_user),
        "analysis": {
            **analysis,
            "original_image_url": f"/uploads/{original_name}",
            "annotated_image_url": f"/uploads/{annotated_name}",
            "report_id": report_record.id,
            "report_download_url": f"/report/pdf/{report_record.id}",
            "record_id": detection_record.id,
            "llm_report": report_text,
        },
    }


@app.get("/history", response_model=list[HistoryItem])
def history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = (
        db.query(DetectionHistory)
        .filter(DetectionHistory.user_id == current_user.id)
        .order_by(DetectionHistory.created_at.desc())
        .all()
    )
    return [_history_item(record) for record in records]


@app.get("/report/pdf/{report_id}")
def download_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(Report).join(DetectionHistory).filter(Report.id == report_id).first()
    if not report or report.detection.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Report not found")

    pdf_path = Path(report.pdf_path)
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF file is missing")

    return FileResponse(path=str(pdf_path), filename=pdf_path.name, media_type="application/pdf")


@app.get("/download-report/{report_id}")
def legacy_download_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return download_report(report_id, db, current_user)
