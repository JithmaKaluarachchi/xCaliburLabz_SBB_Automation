from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "SBB-Oxygen-House-Correct-Browser-Testing-and-Bug-Reporting-Guide.pdf"


def esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build() -> Path:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    navy = colors.HexColor("#0D2538")
    blue = colors.HexColor("#036083")
    pale = colors.HexColor("#EEF5F8")
    line = colors.HexColor("#CBD8DF")
    green_bg, green_fg = colors.HexColor("#DDF4E8"), colors.HexColor("#176B3A")
    orange_bg, orange_fg = colors.HexColor("#FFF0D6"), colors.HexColor("#9A5A00")
    red_bg, red_fg = colors.HexColor("#FDE8E6"), colors.HexColor("#A12622")

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleWhite", parent=styles["Title"], fontSize=20, leading=24, textColor=colors.white, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="SubWhite", parent=styles["Normal"], fontSize=9, leading=12, textColor=colors.HexColor("#D8EAF2"), alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="H", parent=styles["Heading1"], fontSize=15, leading=19, textColor=navy, spaceBefore=7, spaceAfter=7))
    styles.add(ParagraphStyle(name="BodyClean", parent=styles["BodyText"], fontSize=9, leading=13, spaceAfter=5))
    styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontSize=7.8, leading=10))
    styles.add(ParagraphStyle(name="SmallBold", parent=styles["Small"], fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle(name="Header", parent=styles["SmallBold"], textColor=colors.white, alignment=TA_CENTER))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(line)
        canvas.line(18 * mm, 15 * mm, 192 * mm, 15 * mm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.drawString(18 * mm, 9 * mm, "SBB Oxygen House - Correct browser testing and reporting guide")
        canvas.drawRightString(192 * mm, 9 * mm, f"Page {doc.page}")
        canvas.restoreState()

    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=20 * mm)
    doc.addPageTemplates(PageTemplate(id="guide", frames=Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height), onPage=footer))
    now = datetime.now(timezone(timedelta(hours=5, minutes=30), name="Asia/Colombo"))
    story = []
    banner = Table([[Paragraph("SBB Oxygen House - Correct Browser Testing and Bug Reporting", styles["TitleWhite"])], [Paragraph(f"Developer and QA handoff guide - {now:%d %B %Y} (Sri Lanka time)", styles["SubWhite"])]], colWidths=[172 * mm])
    banner.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), navy), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
    story += [banner, Spacer(1, 6 * mm)]

    story.append(Paragraph("Decision", styles["H"]))
    decision = Table([[Paragraph("Manual testing passed", styles["SmallBold"]), Paragraph("Do not send the current automated failures as confirmed production bugs. Record them as findings that require verification.", styles["Small"])], [Paragraph("Browser naming", styles["SmallBold"]), Paragraph("Only use Chrome, Safari, Edge and Firefox in developer-facing reports, and state whether the result came from Web or Mobile testing.", styles["Small"])], [Paragraph("Evidence standard", styles["SmallBold"]), Paragraph("A browser result is reportable only when that named browser or device was actually tested. Never substitute another browser result under a different browser name.", styles["Small"])]] , colWidths=[42 * mm, 130 * mm])
    decision.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, -1), pale), ("GRID", (0, 0), (-1, -1), 0.4, line), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    story += [decision, Spacer(1, 3 * mm)]

    story.append(Paragraph("Approved browser matrix", styles["H"]))
    matrix_rows = [
        ("Chrome", "Web", "Actual Google Chrome on desktop", "Report as Chrome Web"),
        ("Chrome", "Mobile", "Real Android Chrome is preferred; otherwise label the result as mobile emulation", "Report as Chrome Mobile"),
        ("Edge", "Web", "Actual Microsoft Edge on desktop", "Report as Edge Web"),
        ("Edge", "Mobile", "Real Microsoft Edge on Android/iOS or a real-device service", "Report as Edge Mobile"),
        ("Firefox", "Web", "Actual Mozilla Firefox on desktop", "Report as Firefox Web"),
        ("Firefox", "Mobile", "Real Firefox on Android or a real-device service", "Report as Firefox Mobile"),
        ("Safari", "Web", "Actual Safari on macOS", "Report as Safari Web"),
        ("Safari", "Mobile", "Actual Safari on iPhone or iPad", "Report as Safari Mobile"),
    ]
    matrix = [[Paragraph(value, styles["Header"]) for value in ["Browser", "Platform", "Required test environment", "Developer-facing label"]]]
    matrix += [[Paragraph(esc(value), styles["SmallBold"] if index < 2 else styles["Small"]) for index, value in enumerate(row)] for row in matrix_rows]
    matrix_table = Table(matrix, colWidths=[26 * mm, 24 * mm, 78 * mm, 44 * mm], repeatRows=1)
    matrix_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), blue), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.35, line), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story += [matrix_table, Spacer(1, 3 * mm)]

    story.append(Paragraph("Correct result classifications", styles["H"]))
    classes = [
        ("Confirmed Bug", "The problem is reproduced manually in the named browser and supported by repeatable evidence.", red_bg, red_fg),
        ("Manual Test Passed", "The manual scenario works. An earlier automated failure must not be presented as a confirmed product defect.", green_bg, green_fg),
        ("Automation Issue", "The failure is caused by timing, selectors, emulation, test data or the automated check itself.", orange_bg, orange_fg),
        ("Needs Verification", "The result has not yet been reproduced manually in the required real browser or device.", orange_bg, orange_fg),
        ("Accessibility Finding", "Markup or assistive-technology behavior requires accessibility review; ordinary visual access may still work.", orange_bg, orange_fg),
        ("Performance Observation", "A timing budget was exceeded, but functional behavior may still be correct.", orange_bg, orange_fg),
    ]
    class_data = [[Paragraph("Classification", styles["Header"]), Paragraph("Meaning", styles["Header"])]]
    for name, meaning, _, _ in classes:
        class_data.append([Paragraph(esc(name), styles["SmallBold"]), Paragraph(esc(meaning), styles["Small"])])
    class_table = Table(class_data, colWidths=[45 * mm, 127 * mm], repeatRows=1)
    class_style = [("BACKGROUND", (0, 0), (-1, 0), blue), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.35, line), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]
    for index, (_, _, bg, fg) in enumerate(classes, 1):
        class_style += [("BACKGROUND", (0, index), (0, index), bg), ("TEXTCOLOR", (0, index), (0, index), fg)]
    class_table.setStyle(TableStyle(class_style))
    story += [class_table, Spacer(1, 3 * mm)]

    story.append(Paragraph("How to handle the current findings", styles["H"]))
    current_rows = [
        ("Home navigation, images and CTA findings", "Manual Test Passed / Needs Verification", "Repeat in the actual named Chrome, Safari, Edge and Firefox environment before raising a developer bug."),
        ("Shop sorting and filtering findings", "Manual Test Passed / Needs Verification", "Repeat each control in the actual named browser and capture a screen recording only if it fails again."),
        ("Services and About Us keyboard findings", "Needs Verification", "Verify using a physical keyboard on desktop browsers and accessibility testing on the required devices."),
        ("About Us timing finding", "Performance Observation", "Retest several times on a controlled network and report median timing, not one slow run."),
        ("Contact Us branch-tab ARIA finding", "Accessibility Finding", "Keep for developer accessibility review. It does not mean Safari or another browser cannot open the page."),
    ]
    current = [[Paragraph(value, styles["Header"]) for value in ["Finding group", "Current status", "Required action"]]]
    current += [[Paragraph(esc(value), styles["SmallBold"] if index == 1 else styles["Small"]) for index, value in enumerate(row)] for row in current_rows]
    current_table = Table(current, colWidths=[57 * mm, 47 * mm, 68 * mm], repeatRows=1)
    current_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), blue), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.35, line), ("BACKGROUND", (1, 1), (1, -1), orange_bg), ("TEXTCOLOR", (1, 1), (1, -1), orange_fg), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story += [current_table, Spacer(1, 4 * mm)]

    story.append(Paragraph("Developer handoff rule", styles["H"]))
    story.append(Paragraph("Send only Confirmed Bugs as product defects. Keep Manual Test Passed, Automation Issue, Needs Verification, Accessibility Finding and Performance Observation in a separate QA findings register until the required verification is complete.", styles["BodyClean"]))
    doc.build(story)
    return OUTPUT


if __name__ == "__main__":
    print(build())
