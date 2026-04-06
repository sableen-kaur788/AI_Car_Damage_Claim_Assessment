from __future__ import annotations

from openai import OpenAI


GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama3-70b-8192"


def _format_detection_lines(detections: list[dict]) -> str:
    if not detections:
        return "No confirmed visible damages were detected."

    lines = []
    for index, item in enumerate(detections, start=1):
        lines.append(
            (
                f"{index}. Damage type: {item['label']}; "
                f"confidence: {item['confidence_percent']:.2f}%; "
                f"affected area: {item['area_percent']:.2f}%; "
                f"estimated repair cost: ${item['estimated_cost']:.2f}."
            )
        )
    return "\n".join(lines)


def _fallback_report(analysis: dict, user_name: str, image_name: str) -> str:
    summary = analysis["summary"]
    detections = analysis.get("detections", [])
    if not detections:
        return (
            f"Summary: No visible insurable damage was detected for {user_name} in the uploaded vehicle image.\n"
            "Detected Damages Explanation: The uploaded image did not show a confirmed damage event above the configured confidence threshold, so no visible repair item could be tied to this specific inspection.\n"
            "Risk and Severity Analysis: Current claim risk is low, though hidden damage may still require manual inspection.\n"
            "Repair Recommendations: Perform a workshop inspection if the vehicle was involved in an impact.\n"
            "Final Conclusion: No immediate visible repair estimate is recommended from image evidence alone."
        )

    primary_damage = max(detections, key=lambda item: item["area_percent"])
    damage_list = ", ".join(item["label"] for item in detections)
    return (
        f"Summary: {user_name}'s vehicle inspection found {summary['total_damages']} visible damage event(s) with overall severity rated {summary['severity']}.\n"
        f"Detected Damages Explanation: The system identified {damage_list}. The most visually significant finding was {primary_damage['label']} covering {primary_damage['area_percent']:.2f}% of the image area. Total estimated damaged area is {summary['total_damage_area']:.2f}%.\n"
        f"Risk and Severity Analysis: Estimated repair exposure is ${summary['total_cost']:.2f}, with average model confidence of {summary['average_confidence']:.2f}%.\n"
        "Repair Recommendations: Prioritize safety-critical items first, inspect the highest-area damage before cosmetic restoration, and validate the affected panels in a workshop.\n"
        f"Final Conclusion: This inspection for {user_name} is suitable for preliminary insurance review, with workshop validation recommended before settlement."
    )


def generate_insurance_report(api_key: str | None, user_name: str, image_name: str, analysis: dict) -> str:
    if not api_key:
        return _fallback_report(analysis, user_name, image_name)

    summary = analysis["summary"]
    detections = analysis.get("detections", [])
    detection_lines = _format_detection_lines(detections)

    prompt = f"""
You are a senior auto insurance assessor writing a professional claims report.

Customer Name: {user_name}
Image Reference: {image_name}
Summary Metrics: {summary}
Detection Evidence:
{detection_lines}
Charts Data: {analysis["charts"]}

Write a concise but professional report with exactly these section headings:
Summary
Detected Damages Explanation
Risk and Severity Analysis
Repair Recommendations
Final Conclusion

Use USD for all money values.
Base the report only on the supplied evidence for this specific image and this specific customer.
Mention the actual detected damage types, their approximate affected area, and the estimated repair exposure.
Do not write a generic report. If the damage profile changes, the report wording and conclusions should also change.
If there are no detections, clearly say that no visible insurable damage was confirmed in this image.
Do not mention raw uploaded file names, UUIDs, or internal image identifiers in the final report text.
"""

    try:
        client = OpenAI(api_key=api_key, base_url=GROQ_BASE_URL)
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            temperature=0.35,
            messages=[
                {"role": "system", "content": "You write insurer-ready vehicle damage reports."},
                {"role": "user", "content": prompt},
            ],
        )
        return completion.choices[0].message.content or _fallback_report(analysis, user_name, image_name)
    except Exception:
        return _fallback_report(analysis, user_name, image_name)
