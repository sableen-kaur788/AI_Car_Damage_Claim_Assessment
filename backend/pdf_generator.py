from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.shapes import Drawing, String
from reportlab.platypus import Image as PdfImage
from reportlab.platypus import PageBreak
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _fit_image(path: Path, max_width: float = 5.8 * inch, max_height: float = 3.2 * inch) -> PdfImage:
    image = PdfImage(str(path))
    image.drawWidth = max_width
    image.drawHeight = max_height
    image._restrictSize(max_width, max_height)
    return image


def _build_cost_chart(cost_data: list[dict]) -> Drawing:
    drawing = Drawing(420, 210)
    drawing.add(String(10, 190, "Cost Per Damage Type", fontSize=12, fillColor=colors.HexColor("#102a43")))
    chart = VerticalBarChart()
    chart.x = 40
    chart.y = 35
    chart.height = 130
    chart.width = 340
    chart.data = [[item["cost"] for item in cost_data] or [0]]
    chart.categoryAxis.categoryNames = [item["name"] for item in cost_data] or ["No Data"]
    chart.valueAxis.valueMin = 0
    chart.bars[0].fillColor = colors.HexColor("#2f855a")
    drawing.add(chart)
    return drawing


def _build_distribution_chart(distribution_data: list[dict]) -> Drawing:
    drawing = Drawing(420, 220)
    drawing.add(String(10, 200, "Damage Type Distribution", fontSize=12, fillColor=colors.HexColor("#102a43")))
    pie = Pie()
    pie.x = 120
    pie.y = 15
    pie.width = 150
    pie.height = 150
    pie.data = [item["value"] for item in distribution_data] or [1]
    pie.labels = [item["name"] for item in distribution_data] or ["No Data"]
    for index, item in enumerate(distribution_data[: len(pie.data)]):
        pie.slices[index].fillColor = colors.HexColor(item["color"])
    drawing.add(pie)
    return drawing


def build_pdf_report(
    output_path: Path,
    user_name: str,
    user_email: str,
    original_image_path: Path,
    annotated_image_path: Path,
    analysis: dict,
    report_text: str,
) -> None:
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="SectionTitle", parent=styles["Heading2"], textColor=colors.HexColor("#102a43")))

    doc = SimpleDocTemplate(str(output_path), pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = [
        Paragraph("AI Car Damage Detection and Insurance Report", styles["Title"]),
        Spacer(1, 12),
        Paragraph(f"<b>User:</b> {user_name}", styles["Normal"]),
        Paragraph(f"<b>Email:</b> {user_email}", styles["Normal"]),
        Paragraph(f"<b>Severity:</b> {analysis['summary']['severity']}", styles["Normal"]),
        Paragraph(f"<b>Estimated Repair Cost:</b> ${analysis['summary']['total_cost']:.2f}", styles["Normal"]),
        Paragraph(f"<b>Estimated Damage Area:</b> {analysis['summary']['total_damage_area']:.2f}%", styles["Normal"]),
        Paragraph(f"<b>Average Confidence:</b> {analysis['summary']['average_confidence']:.2f}%", styles["Normal"]),
        Paragraph(f"<b>Total Damage Events:</b> {analysis['summary']['total_damages']}", styles["Normal"]),
        Spacer(1, 16),
        Paragraph("This report summarizes AI-assisted visual inspection results for preliminary claims review.", styles["BodyText"]),
        PageBreak(),
        Spacer(1, 12),
        Paragraph("Uploaded Image", styles["SectionTitle"]),
        Spacer(1, 8),
        _fit_image(original_image_path),
        Spacer(1, 12),
        Paragraph("Annotated Detection Result", styles["SectionTitle"]),
        Spacer(1, 8),
        _fit_image(annotated_image_path),
        Spacer(1, 12),
        Paragraph("Detected Damages", styles["SectionTitle"]),
        Spacer(1, 8),
    ]

    table_data = [["Damage", "Confidence", "Area %", "Est. Cost ($)"]]
    for item in analysis["detections"]:
        table_data.append(
            [
                item["label"],
                f"{item['confidence_percent']:.2f}%",
                f"{item['area_percent']:.2f}%",
                f"{item['estimated_cost']:.2f}",
            ]
        )

    if len(table_data) == 1:
        table_data.append(["No visible damage detected", "-", "-", "0.00"])

    table = Table(table_data, repeatRows=1, colWidths=[160, 110, 90, 110])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9ca3af")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ]
        )
    )
    story.extend(
        [
            table,
            Spacer(1, 16),
            Paragraph("Charts", styles["SectionTitle"]),
            Spacer(1, 8),
            _build_distribution_chart(analysis["charts"]["damage_distribution"]),
            Spacer(1, 12),
            _build_cost_chart(analysis["charts"]["cost_per_damage"]),
            Spacer(1, 12),
            Paragraph("LLM Insurance Narrative", styles["SectionTitle"]),
            Spacer(1, 8),
        ]
    )

    for paragraph in report_text.splitlines():
        cleaned = paragraph.strip()
        if cleaned:
            story.append(Paragraph(cleaned.replace("\n", "<br />"), styles["BodyText"]))
            story.append(Spacer(1, 6))

    doc.build(story)
