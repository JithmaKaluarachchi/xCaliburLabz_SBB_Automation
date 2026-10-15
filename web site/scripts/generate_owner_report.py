from __future__ import annotations

import os
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageTemplate, Paragraph, PageBreak,
    Spacer, Table, TableStyle
)

ROOT = Path(__file__).resolve().parents[1]
JUNIT = ROOT / "test-results" / "junit.xml"
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT = OUTPUT_DIR / "SBB-Oxygen-House-Homepage-Test-Report.pdf"
SITE = os.getenv("BASE_URL", "https://sbb.caliburlabz.com/")

AREA_RULES = [
    ("Accessibility", ["automated WCAG scan"]),
    ("Smoke and availability", ["loads successfully", "duplicate element"]),
    ("Header and navigation", ["header contains", "primary page destinations", "clicking Shop", "mobile navigation"]),
    ("Content sections and scrolling", ["semantic structure", "visits every homepage section"]),
    ("Buttons and calls to action", ["buttons and CTA", "hero and section buttons"]),
    ("Images and image links", ["content images", "linked images"]),
    ("Products and carousel", ["product pictures", "product arrows"]),
    ("Services", ["service pictures"]),
    ("Animations", ["entrance animations"]),
    ("Footer", ["footer provides", "all footer link"]),
    ("SEO and quality", ["title, metadata", "uncaught page errors", "keyboard", "layout areas"]),
]


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def escape(value: str) -> str:
    return (value.replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;"))


def parse_results():
    if not JUNIT.exists():
        raise SystemExit("No test-results/junit.xml found. Run npm run test:homepage first.")
    root = ET.parse(JUNIT).getroot()
    rows = []
    for suite in root.findall(".//testsuite"):
        browser = suite.attrib.get("hostname", "unknown")
        for case in suite.findall("testcase"):
            failure = case.find("failure")
            error = case.find("error")
            skipped = case.find("skipped")
            problem = failure if failure is not None else error
            status = "FAILED" if problem is not None else "SKIPPED" if skipped is not None else "PASSED"
            message = clean(problem.attrib.get("message") if problem is not None else "")
            if not message and problem is not None:
                message = clean(problem.text)
            rows.append({
                "name": clean(case.attrib.get("name")),
                "file": clean(case.attrib.get("classname")),
                "browser": browser,
                "seconds": float(case.attrib.get("time", "0") or 0),
                "status": status,
                "message": message,
            })
    return rows


def area_for(name: str) -> str:
    lowered = name.lower()
    for area, phrases in AREA_RULES:
        if any(phrase.lower() in lowered for phrase in phrases):
            return area
    return "Other homepage checks"


def status_color(status: str):
    return {"PASSED": colors.HexColor("#16804B"), "FAILED": colors.HexColor("#C0392B"),
            "SKIPPED": colors.HexColor("#B7791F")}.get(status, colors.HexColor("#475569"))


def build_pdf(rows):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    generated = datetime.now(timezone(timedelta(hours=5, minutes=30), name="Asia/Colombo"))
    counts = {key: sum(row["status"] == key for row in rows) for key in ("PASSED", "FAILED", "SKIPPED")}
    total = len(rows)
    overall = "PASS" if counts["FAILED"] == 0 else "ACTION REQUIRED"
    navy, blue, pale = colors.HexColor("#0D2538"), colors.HexColor("#036083"), colors.HexColor("#EEF5F8")
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleWhite", parent=styles["Title"], textColor=colors.white,
                              fontSize=23, leading=28, alignment=TA_CENTER, spaceAfter=6))
    styles.add(ParagraphStyle(name="SubtitleWhite", parent=styles["Normal"], textColor=colors.HexColor("#D8EAF2"),
                              fontSize=10, leading=14, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="H1Blue", parent=styles["Heading1"], textColor=navy, fontSize=16,
                              leading=20, spaceBefore=7, spaceAfter=8))
    styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontSize=8.5, leading=11))
    styles.add(ParagraphStyle(name="BodyClean", parent=styles["BodyText"], fontSize=9.5, leading=14, spaceAfter=5))

    def page(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#D7E0E5"))
        canvas.line(18 * mm, 15 * mm, 192 * mm, 15 * mm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.drawString(18 * mm, 9 * mm, "SBB Oxygen House - Confidential test report")
        canvas.drawRightString(192 * mm, 9 * mm, f"Page {doc.page}")
        canvas.restoreState()

    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
                          topMargin=16 * mm, bottomMargin=20 * mm, title="SBB Oxygen House Homepage Test Report")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates(PageTemplate(id="report", frames=frame, onPage=page))
    story = []
    banner = Table([[Paragraph("SBB Oxygen House - Homepage Automation Test Report", styles["TitleWhite"])],
                    [Paragraph(f"Production assessment - {generated:%d %B %Y, %I:%M %p} (Sri Lanka time)", styles["SubtitleWhite"])]],
                   colWidths=[172 * mm])
    banner.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), navy),
                                ("BOX", (0, 0), (-1, -1), 0, navy), ("TOPPADDING", (0, 0), (-1, -1), 10),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
    story += [banner, Spacer(1, 8 * mm)]

    story.append(Paragraph("Executive summary", styles["H1Blue"]))
    summary_color = colors.HexColor("#DDF4E8") if overall == "PASS" else colors.HexColor("#FDE8E6")
    summary = Table([[Paragraph(f"<b>Overall result</b><br/><font size='16'>{overall}</font>", styles["BodyClean"]),
                      Paragraph(f"<b>{total}</b><br/>Tests executed", styles["BodyClean"]),
                      Paragraph(f"<b>{counts['PASSED']}</b><br/>Passed", styles["BodyClean"]),
                      Paragraph(f"<b>{counts['FAILED']}</b><br/>Failed", styles["BodyClean"]),
                      Paragraph(f"<b>{counts['SKIPPED']}</b><br/>Skipped", styles["BodyClean"])]],
                    colWidths=[50 * mm, 30 * mm, 30 * mm, 30 * mm, 30 * mm])
    summary.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, 0), summary_color), ("BACKGROUND", (1, 0), (-1, 0), pale),
                                 ("BOX", (0, 0), (-1, -1), .5, colors.HexColor("#C7D5DC")),
                                 ("INNERGRID", (0, 0), (-1, -1), .5, colors.HexColor("#C7D5DC")),
                                 ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                                 ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9)]))
    story += [summary, Spacer(1, 4 * mm)]
    recommendation = ("The automated homepage checks completed without detected failures. The tested release is suitable to proceed, "
                      "subject to normal business approval and manual exploratory review." if counts["FAILED"] == 0 else
                      "One or more automated homepage checks failed. Review the issues below and retest after correction before release approval.")
    story.append(Paragraph(recommendation, styles["BodyClean"]))

    story.append(Paragraph("Test information", styles["H1Blue"]))
    info = [["Website", SITE], ["Environment", "Production"],
            ["Execution time", f"{generated:%d %B %Y, %I:%M:%S %p} - Asia/Colombo"],
            ["Browsers represented", ", ".join(sorted({row['browser'] for row in rows}))],
            ["Automated duration", f"{sum(row['seconds'] for row in rows):.1f} seconds (sum of test durations)"],
            ["Evidence", "Technical HTML report: playwright-report/index.html; failure artifacts: test-results/artifacts/"]]
    table = Table([[Paragraph(f"<b>{escape(k)}</b>", styles["Small"]), Paragraph(escape(v), styles["Small"])] for k, v in info],
                  colWidths=[42 * mm, 128 * mm])
    table.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), .4, colors.HexColor("#D7E0E5")),
                               ("BACKGROUND", (0, 0), (0, -1), pale), ("VALIGN", (0, 0), (-1, -1), "TOP"),
                               ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story += [table, Spacer(1, 3 * mm)]

    story.append(Paragraph("Homepage areas tested", styles["H1Blue"]))
    areas = {}
    for row in rows:
        areas.setdefault(area_for(row["name"]), []).append(row)
    area_data = [["Area", "Result", "Checks"]]
    for area, items in areas.items():
        status = "FAILED" if any(x["status"] == "FAILED" for x in items) else "SKIPPED" if all(x["status"] == "SKIPPED" for x in items) else "PASSED"
        area_data.append([Paragraph(escape(area), styles["Small"]),
                          Paragraph(f"<font color='{status_color(status).hexval()}'><b>{status}</b></font>", styles["Small"]), str(len(items))])
    area_table = Table(area_data, colWidths=[105 * mm, 40 * mm, 25 * mm], repeatRows=1)
    area_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), blue), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                                    ("GRID", (0, 0), (-1, -1), .4, colors.HexColor("#D7E0E5")),
                                    ("VALIGN", (0, 0), (-1, -1), "TOP"), ("ALIGN", (1, 1), (-1, -1), "CENTER"),
                                    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    story += [area_table, Spacer(1, 4 * mm)]

    failures = [row for row in rows if row["status"] == "FAILED"]
    story.append(Paragraph("Issues and required changes", styles["H1Blue"]))
    if not failures:
        story.append(Paragraph("No automated test failures were recorded in this execution. No corrective website changes are required from these test results.", styles["BodyClean"]))
    else:
        for number, row in enumerate(failures, 1):
            message = row["message"][:900] or "The expected behavior did not complete successfully."
            block = Table([[Paragraph(f"<b>{number}. {escape(area_for(row['name']))}</b>", styles["BodyClean"])],
                           [Paragraph(f"<b>Failed check:</b> {escape(row['name'])}", styles["Small"])],
                           [Paragraph(f"<b>Observed:</b> {escape(message)}", styles["Small"])],
                           [Paragraph("<b>Recommended action:</b> Review the named homepage section, reproduce using the Playwright trace, correct the behavior, and rerun the homepage suite.", styles["Small"])]],
                          colWidths=[170 * mm])
            block.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FDE8E6")),
                                       ("BOX", (0, 0), (-1, -1), .6, colors.HexColor("#E8B4AE")),
                                       ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
            story += [KeepTogether(block), Spacer(1, 3 * mm)]

    story += [Spacer(1, 4 * mm), Paragraph("Interpretation", styles["H1Blue"]),
              Paragraph("Passed results are green, failed results are red, and skipped results are orange. PASSED means the stated automated expectation succeeded. FAILED means that specific expectation requires investigation; it does not automatically mean the page was unavailable. In particular, an automated WCAG failure identifies an assistive-technology markup issue while page availability and ordinary browser operation are reported by separate functional checks. SKIPPED means the check was not run or was not applicable. Automated testing does not replace manual accessibility, usability, content, and stakeholder review.", styles["BodyClean"]),
              Spacer(1, 3 * mm), Paragraph("Detailed test results", styles["H1Blue"])]
    detail = [["#", "Test", "Browser", "Time", "Result"]]
    for index, row in enumerate(rows, 1):
        detail.append([str(index), Paragraph(escape(re.sub(r"(?:@[\w-]+\s*)+", "", row["name"]).strip()), styles["Small"]),
                       row["browser"], f"{row['seconds']:.1f}s",
                       Paragraph(f"<font color='{status_color(row['status']).hexval()}'><b>{row['status']}</b></font>", styles["Small"])])
    details = Table(detail, colWidths=[8 * mm, 97 * mm, 25 * mm, 18 * mm, 24 * mm], repeatRows=1)
    details.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), navy), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                                 ("GRID", (0, 0), (-1, -1), .35, colors.HexColor("#D7E0E5")),
                                 ("VALIGN", (0, 0), (-1, -1), "TOP"), ("ALIGN", (0, 1), (0, -1), "CENTER"),
                                 ("ALIGN", (2, 1), (-1, -1), "CENTER"), ("TOPPADDING", (0, 0), (-1, -1), 4),
                                 ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    story.append(details)
    doc.build(story)
    return OUTPUT


if __name__ == "__main__":
    result = build_pdf(parse_results())
    print(result)
