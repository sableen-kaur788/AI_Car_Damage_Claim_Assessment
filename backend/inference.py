from __future__ import annotations

from pathlib import Path
from typing import Any

import cv2
import numpy as np
import pillow_avif  # noqa: F401
from PIL import Image
from ultralytics import YOLO

from .cost_model import CLASS_COLORS, REPAIR_COSTS, rgb_to_hex, summarize_detections
from .utils import MODEL_PATH

_model: YOLO | None = None


def get_model() -> YOLO:
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
        _model = YOLO(str(MODEL_PATH))
    return _model


def analyze_image(image_path: Path, annotated_output_path: Path) -> dict[str, Any]:
    model = get_model()
    image = Image.open(image_path).convert("RGB")
    image_np = np.array(image)
    annotated = image_np.copy()
    image_area = max(image_np.shape[0] * image_np.shape[1], 1)

    results = model.predict(source=image_np, conf=0.25, verbose=False)
    detections: list[dict[str, Any]] = []

    for result in results:
        boxes = result.boxes
        masks = result.masks
        resized_masks: list[np.ndarray] = []

        if masks is not None and masks.data is not None:
            for mask in masks.data.cpu().numpy():
                resized_masks.append(cv2.resize(mask, (image_np.shape[1], image_np.shape[0])))

        if boxes is None:
            continue

        for index, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            cls_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            label = model.names.get(cls_id, str(cls_id))
            color = CLASS_COLORS.get(label, (255, 255, 255))

            width = max(x2 - x1, 1)
            height = max(y2 - y1, 1)
            area_percent = round((width * height / image_area) * 100, 2)
            estimated_cost = REPAIR_COSTS.get(label, 100.0)

            detections.append(
                {
                    "label": label,
                    "confidence": round(confidence, 4),
                    "confidence_percent": round(confidence * 100, 2),
                    "bounding_box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                    "area_percent": area_percent,
                    "estimated_cost": estimated_cost,
                    "color_hex": rgb_to_hex(color),
                }
            )

            if index < len(resized_masks):
                mask = resized_masks[index]
                overlay = np.zeros_like(image_np)
                overlay[:, :, 0] = (mask > 0.5) * color[0]
                overlay[:, :, 1] = (mask > 0.5) * color[1]
                overlay[:, :, 2] = (mask > 0.5) * color[2]
                annotated = cv2.addWeighted(annotated, 1.0, overlay.astype(np.uint8), 0.28, 0)

            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            text = f"{label} {confidence * 100:.1f}% | {area_percent:.2f}%"
            cv2.putText(
                annotated,
                text,
                (x1, max(y1 - 10, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                color,
                2,
                cv2.LINE_AA,
            )

    metrics = summarize_detections(detections)

    annotated_bgr = cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR)
    cv2.imwrite(str(annotated_output_path), annotated_bgr)

    return {
        "detections": metrics["detections"],
        "summary": metrics["summary"],
        "charts": metrics["charts"],
        "total_damage_area": metrics["summary"]["total_damage_area"],
        "total_estimated_cost": metrics["summary"]["total_cost"],
        "severity": metrics["summary"]["severity"],
        "average_confidence": metrics["summary"]["average_confidence"],
        "detected_damage_types": sorted({item["label"] for item in metrics["detections"]}),
    }
