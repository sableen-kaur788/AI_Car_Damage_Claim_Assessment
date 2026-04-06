from __future__ import annotations

from collections import Counter, defaultdict


CLASS_COLORS: dict[str, tuple[int, int, int]] = {
    "dent": (255, 99, 71),
    "scratch": (255, 215, 0),
    "crack": (70, 130, 180),
    "glass shatter": (64, 224, 208),
    "lamp broken": (218, 112, 214),
    "tire flat": (60, 179, 113),
    "structural damage": (220, 20, 60),
}

REPAIR_COSTS: dict[str, float] = {
    "dent": 60.0,
    "scratch": 25.0,
    "crack": 100.0,
    "glass shatter": 250.0,
    "lamp broken": 150.0,
    "tire flat": 80.0,
    "structural damage": 600.0,
}


def rgb_to_hex(color: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*color)


def severity_from_metrics(detections: list[dict], total_area: float) -> str:
    if not detections:
        return "Minor"

    labels = [item["label"] for item in detections]
    damage_counts = Counter(labels)
    detection_count = len(detections)
    max_area = max(item["area_percent"] for item in detections)

    severity_score = 0.0

    # Area contribution is intentionally softer so small localized damage
    # is less likely to be marked severe.
    severity_score += min(total_area / 10.0, 3.0)

    if detection_count >= 4:
        severity_score += 1.0
    elif detection_count >= 2:
        severity_score += 0.5

    for label in labels:
        if label == "structural damage":
            severity_score += 2.5
        elif label == "glass shatter":
            severity_score += 1.8
        elif label == "lamp broken":
            severity_score += 1.5
        elif label == "tire flat":
            severity_score += 1.2
        elif label == "crack":
            severity_score += 1.0
        elif label == "dent":
            severity_score += 0.6
        elif label == "scratch":
            severity_score += 0.4

    if "structural damage" in damage_counts:
        if total_area >= 20 or detection_count >= 3:
            return "Severe"
        return "Moderate"

    if "glass shatter" in damage_counts and total_area >= 25:
        return "Severe"

    if severity_score >= 6:
        return "Severe"
    if severity_score >= 3:
        return "Moderate"
    return "Minor"


SEVERITY_MULTIPLIER: dict[str, float] = {
    "Minor": 0.6,
    "Moderate": 1.0,
    "Severe": 1.8,
}


def group_damages(detections: list[dict]) -> defaultdict[str, float]:
    grouped: defaultdict[str, float] = defaultdict(float)

    for item in detections:
        grouped[item["label"]] += float(item["area_percent"])

    return grouped


def _area_factor(total_area: float) -> float:
    if total_area < 5:
        return 0.3
    if total_area < 15:
        return 0.6
    if total_area < 30:
        return 1.0
    return 1.3


def calculate_cost(detections: list[dict], severity: str) -> float:
    grouped = group_damages(detections)

    total_cost = 0.0
    for label, total_area in grouped.items():
        base = REPAIR_COSTS.get(label, 30.0)
        cost = base * _area_factor(total_area) * SEVERITY_MULTIPLIER[severity]
        total_cost += cost

    return round(total_cost, 2)


def apply_grouped_detection_costs(detections: list[dict], severity: str) -> list[dict]:
    grouped = group_damages(detections)
    grouped_costs = {
        label: round(REPAIR_COSTS.get(label, 30.0) * _area_factor(total_area) * SEVERITY_MULTIPLIER[severity], 2)
        for label, total_area in grouped.items()
    }

    indexed_by_label: defaultdict[str, list[int]] = defaultdict(list)
    for index, item in enumerate(detections):
        indexed_by_label[item["label"]].append(index)

    updated = [{**item, "estimated_cost": 0.0} for item in detections]

    for label, indexes in indexed_by_label.items():
        group_total = grouped_costs.get(label, 0.0)
        area_sum = sum(float(detections[index]["area_percent"]) for index in indexes)

        if area_sum > 0:
            running_total = 0.0
            for position, index in enumerate(indexes):
                if position == len(indexes) - 1:
                    share = round(group_total - running_total, 2)
                else:
                    share = round(group_total * (float(detections[index]["area_percent"]) / area_sum), 2)
                    running_total += share
                updated[index]["estimated_cost"] = share
        else:
            split = round(group_total / len(indexes), 2) if indexes else 0.0
            for position, index in enumerate(indexes):
                if position == len(indexes) - 1:
                    assigned = round(group_total - split * (len(indexes) - 1), 2)
                else:
                    assigned = split
                updated[index]["estimated_cost"] = assigned

    return updated


def summarize_detections(detections: list[dict]) -> dict:
    detections = [normalize_detection(item) for item in detections]

    total_area = round(sum(item["area_percent"] for item in detections), 2)
    avg_confidence = round(
        sum(item["confidence_percent"] for item in detections) / len(detections),
        2,
    ) if detections else 0.0
    severity = severity_from_metrics(detections, total_area)
    detections = apply_grouped_detection_costs(detections, severity)
    total_cost = calculate_cost(detections, severity)

    damage_counts = Counter(item["label"] for item in detections)
    cost_by_type: dict[str, float] = defaultdict(float)
    area_by_type: dict[str, float] = defaultdict(float)
    confidence_by_type: dict[str, list[float]] = defaultdict(list)

    for item in detections:
        label = item["label"]
        cost_by_type[label] += item["estimated_cost"]
        area_by_type[label] += item["area_percent"]
        confidence_by_type[label].append(item["confidence_percent"])

    charts = {
        "damage_distribution": [
            {"name": label, "value": count, "color": detections_by_label_color(detections, label)}
            for label, count in damage_counts.items()
        ],
        "cost_per_damage": [
            {"name": label, "cost": round(cost, 2), "color": detections_by_label_color(detections, label)}
            for label, cost in cost_by_type.items()
        ],
        "confidence_scores": [
            {
                "name": label,
                "confidence": round(sum(scores) / len(scores), 2),
                "color": detections_by_label_color(detections, label),
            }
            for label, scores in confidence_by_type.items()
        ],
        "area_percentages": [
            {"name": label, "area": round(area, 2), "color": detections_by_label_color(detections, label)}
            for label, area in area_by_type.items()
        ],
    }

    return {
        "summary": {
            "total_damages": len(detections),
            "total_cost": total_cost,
            "severity": severity,
            "average_confidence": avg_confidence,
            "total_damage_area": total_area,
        },
        "charts": charts,
        "detections": detections,
    }


def detections_by_label_color(detections: list[dict], label: str) -> str:
    for item in detections:
        if item["label"] == label:
            return item.get("color_hex") or rgb_to_hex(CLASS_COLORS.get(label, (255, 255, 255)))
    return rgb_to_hex(CLASS_COLORS.get(label, (255, 255, 255)))


def normalize_detection(item: dict) -> dict:
    label = item.get("label", "unknown")
    confidence_percent = item.get("confidence_percent")
    if confidence_percent is None:
        confidence_percent = round(float(item.get("confidence", 0.0)) * 100, 2)

    return {
        **item,
        "label": label,
        "confidence_percent": float(confidence_percent),
        "area_percent": float(item.get("area_percent", 0.0)),
        "estimated_cost": float(item.get("estimated_cost", REPAIR_COSTS.get(label, 100.0))),
        "color_hex": item.get("color_hex") or rgb_to_hex(CLASS_COLORS.get(label, (255, 255, 255))),
    }
