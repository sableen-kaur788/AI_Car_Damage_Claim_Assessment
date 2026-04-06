from __future__ import annotations

from openai import OpenAI


GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama-3.1-8b-instant"


def _fallback_report(analysis: dict, user_name: str) -> str:
    detections = analysis.get("detections", [])
    if not detections:
        return (
            f"Insurance Assessment Summary for {user_name}: No visible insured damage was detected "
            "in the submitted image. A manual inspection is still recommended to confirm hidden impact."
        )

    lines = [
        f"Insurance Assessment Summary for {user_name}:",
        f"The inspection identified {len(detections)} visible damage findings with an overall severity of {analysis['severity']}.",
        f"Estimated affected surface area: {analysis['total_damage_area']:.2f}%.",
        f"Estimated repair cost: ${analysis['total_estimated_cost']:.2f}.",
        "Detected damages: " + ", ".join(item["label"] for item in detections) + ".",
        "Recommendation: Prioritize structural and safety-related repairs before cosmetic remediation and complete a workshop inspection before claim closure.",
    ]
    return "\n".join(lines)


def generate_insurance_report(api_key: str | None, user_name: str, analysis: dict) -> str:
    if not api_key:
        return _fallback_report(analysis, user_name)

    prompt = f"""
You are an automotive insurance assessor. Write a professional insurance-style report.

Customer: {user_name}
Severity: {analysis["severity"]}
Total damage area: {analysis["total_damage_area"]:.2f}%
Estimated repair cost: ${analysis["total_estimated_cost"]:.2f}
Detected damages: {analysis["detections"]}

Structure the response with these headings:
1. Summary
2. Detected Damages Explanation
3. Risk and Severity Analysis
4. Repair Recommendations
5. Final Conclusion

Keep the tone formal, precise, and suitable for an insurance claims record. Use USD for all money values.
"""

    try:
        client = OpenAI(api_key=api_key, base_url=GROQ_BASE_URL)
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            temperature=0.2,
            messages=[
                {"role": "system", "content": "You produce concise, professional vehicle insurance reports."},
                {"role": "user", "content": prompt},
            ],
        )
        return completion.choices[0].message.content or _fallback_report(analysis, user_name)
    except Exception:
        return _fallback_report(analysis, user_name)
