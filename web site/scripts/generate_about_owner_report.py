from __future__ import annotations

import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
JUNIT = ROOT / "test-results" / "junit.xml"
OUTPUT = ROOT / "output" / "pdf" / "SBB-Oxygen-House-About-Us-Test-Report.pdf"
SITE = os.getenv("BASE_URL", "https://sbb.caliburlabz.com/")

AREA_RULES = [
    ("Title and description", ["page title and business description"]),
    ("Our Story and navigation", ["our story content and buttons"]),
    ("Our Vision and Our Mission", ["our vision and our mission"]),
    ("Our Values", ["our values contains"]),
    ("Why Choose Us", ["why choose us contains"]),
    ("Partnership call to action", ["lasting partnership actions"]),
    ("Footer", ["footer content and links"]),
    ("UI layout", ["sections are visible"]),
    ("Keyboard navigation", ["keyboard", "keyboard reachable"]),
    ("Accessibility", ["accessibility"]),
    ("Images", ["images load"]),
    ("Performance", ["navigation budgets"]),
    ("Page quality", ["page errors"]),
    ("Responsive layout", ["horizontal overflow"]),
    ("Security", ["https", "security headers"]),
    ("SEO", ["metadata and semantic structure"]),
]


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def display_name(value: str) -> str:
    return re.sub(r"(?:@[\w-]+\s*)+", "", clean(value)).replace("â€º", ">").replace("›", ">").strip()


def area_for(name: str) -> str:
    lowered = name.lower()
    for area, phrases in AREA_RULES:
        if any(phrase in lowered for phrase in phrases):
            return area
    return "Other About Us checks"


def parse():
    if not JUNIT.exists():
        raise SystemExit("No test-results/junit.xml found. Run npm run test:about-us:all first.")
    root = ET.parse(JUNIT).getroot()
    rows = []
    for suite in root.findall(".//testsuite"):
        for case in suite.findall("testcase"):
            file_name, raw_name = clean(case.attrib.get("classname")), clean(case.attrib.get("name"))
            if "about-us" not in file_name.lower() and "@about-us" not in raw_name.lower():
                continue
            failure, error, skipped = case.find("failure"), case.find("error"), case.find("skipped")
            problem = failure if failure is not None else error
            status = "FAILED" if problem is not None else "SKIPPED" if skipped is not None else "PASSED"
            message = clean((problem.attrib.get("message") if problem is not None else "") or (problem.text if problem is not None else ""))
            name = display_name(raw_name)
            rows.append({"name": name, "area": area_for(name), "browser": clean(suite.attrib.get("hostname")) or "unknown",
                         "seconds": float(case.attrib.get("time", "0") or 0), "status": status, "message": message})
    if not rows:
        raise SystemExit("JUnit contains no About Us results. Run npm run test:about-us:all first.")
    return rows


def build(rows):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone(timedelta(hours=5, minutes=30), name="Asia/Colombo"))
    passed = sum(row["status"] == "PASSED" for row in rows)
    failed = sum(row["status"] == "FAILED" for row in rows)
    skipped = sum(row["status"] == "SKIPPED" for row in rows)
    navy, blue, pale = colors.HexColor("#0D2538"), colors.HexColor("#036083"), colors.HexColor("#EEF5F8")
    passed_bg, passed_fg = colors.HexColor("#DDF4E8"), colors.HexColor("#176B3A")
    failed_bg, failed_fg = colors.HexColor("#FDE8E6"), colors.HexColor("#A12622")
    skipped_bg, skipped_fg = colors.HexColor("#FFF0D6"), colors.HexColor("#9A5A00")
    status_colors = {"PASSED": (passed_bg, passed_fg), "FAILED": (failed_bg, failed_fg), "SKIPPED": (skipped_bg, skipped_fg)}
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleWhite", parent=styles["Title"], textColor=colors.white, fontSize=21, leading=26, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="SubWhite", parent=styles["Normal"], textColor=colors.HexColor("#D8EAF2"), fontSize=10, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="H", parent=styles["Heading1"], textColor=navy, fontSize=16, leading=20, spaceBefore=7, spaceAfter=7))
    styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], fontSize=9.2, leading=13, spaceAfter=5))
    styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontSize=7.8, leading=9.8))

    def footer(canvas, doc):
        canvas.saveState(); canvas.setStrokeColor(colors.HexColor("#D7E0E5")); canvas.line(18*mm, 15*mm, 192*mm, 15*mm)
        canvas.setFont("Helvetica", 8); canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.drawString(18*mm, 9*mm, "SBB Oxygen House - Confidential About Us test report")
        canvas.drawRightString(192*mm, 9*mm, f"Page {doc.page}"); canvas.restoreState()

    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=20*mm)
    doc.addPageTemplates(PageTemplate(id="main", frames=Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height), onPage=footer))
    story = []
    banner = Table([[Paragraph("SBB Oxygen House - About Us Automation Test Report", styles["TitleWhite"])],
                    [Paragraph(f"Production assessment - {now:%d %B %Y, %I:%M %p} (Sri Lanka time)", styles["SubWhite"])]], colWidths=[172*mm])
    banner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),navy),("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10)]))
    story += [banner, Spacer(1,7*mm), Paragraph("Executive summary", styles["H"])]
    overall = "PASS" if failed == 0 else "ACTION REQUIRED"
    boxes = Table([[Paragraph(f"<b>Overall result</b><br/><font size='15'>{overall}</font>", styles["Body"]),
                    Paragraph(f"<b>{len(rows)}</b><br/>Executed", styles["Body"]), Paragraph(f"<b>{passed}</b><br/>Passed", styles["Body"]),
                    Paragraph(f"<b>{failed}</b><br/>Failed", styles["Body"]), Paragraph(f"<b>{skipped}</b><br/>Skipped", styles["Body"])]],
                  colWidths=[50*mm,30*mm,30*mm,30*mm,30*mm])
    boxes.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),passed_bg if not failed else failed_bg),("BACKGROUND",(1,0),(-1,0),pale),
                               ("GRID",(0,0),(-1,-1),.5,colors.HexColor("#C7D5DC")),("ALIGN",(1,0),(-1,-1),"CENTER"),
                               ("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    browsers = ", ".join(sorted({row["browser"] for row in rows}))
    story += [boxes, Spacer(1,4*mm), Paragraph(f"Website: {esc(SITE)}about<br/>Environment: Production<br/>Report generated: {now:%d %B %Y, %I:%M:%S %p} - Asia/Colombo<br/>Browser profiles: {esc(browsers)}", styles["Body"])]

    story.append(Paragraph("Areas and testing types covered", styles["H"]))
    coverage = [["Testing type", "Areas tested"],
                [Paragraph("Functional testing", styles["Small"]), Paragraph("Title and description; Our Story content; Browse Products and Our Services navigation; separate Vision and Mission cards; every Our Values card; every Why Choose Us card; partnership Contact Us and Call Us actions; complete footer.", styles["Small"])],
                [Paragraph("Non-functional testing", styles["Small"]), Paragraph("WCAG accessibility; responsive overflow; navigation performance; HTTPS and security headers; page errors and failed same-origin requests; displayed image loading and alt declarations; SEO metadata and semantic heading structure.", styles["Small"])],
                [Paragraph("UI and browser testing", styles["Small"]), Paragraph("Six-section visibility and order; viewport containment; usable section dimensions; primary-action keyboard reachability; Chromium, Firefox, WebKit, Mobile Chrome and Mobile Safari.", styles["Small"])]]
    coverage_table = Table(coverage, colWidths=[50*mm,122*mm], repeatRows=1)
    coverage_table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#D7E0E5")),
                                        ("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story += [coverage_table, Spacer(1,4*mm), Paragraph("Results by tested area", styles["H"])]
    area_data = [["Area", "Checks", "Passed", "Failed", "Skipped", "Result"]]
    ordered_areas = list(dict.fromkeys(row["area"] for row in rows))
    for area in ordered_areas:
        items = [row for row in rows if row["area"] == area]
        p = sum(row["status"] == "PASSED" for row in items); f = sum(row["status"] == "FAILED" for row in items); s = sum(row["status"] == "SKIPPED" for row in items)
        area_data.append([area, str(len(items)), str(p), str(f), str(s), "FAILED" if f else "PASSED"])
    area_table = Table(area_data, colWidths=[62*mm,20*mm,20*mm,20*mm,20*mm,30*mm], repeatRows=1)
    area_style = [("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#D7E0E5")),
                  ("ALIGN",(1,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    for index, row in enumerate(area_data[1:], 1):
        bg, fg = status_colors[row[-1]]; area_style += [("BACKGROUND",(-1,index),(-1,index),bg),("TEXTCOLOR",(-1,index),(-1,index),fg)]
    area_table.setStyle(TableStyle(area_style)); story += [area_table, Spacer(1,4*mm)]

    failures = [row for row in rows if row["status"] == "FAILED"]
    story.append(Paragraph("Failed test cases", styles["H"]))
    if not failures:
        story.append(Paragraph("No failed About Us test cases were recorded.", styles["Body"]))
    else:
        failed_data = [["Area", "Test case", "Browser", "Result"]]
        for row in failures:
            failed_data.append([Paragraph(esc(row["area"]), styles["Small"]), Paragraph(esc(row["name"]), styles["Small"]), row["browser"], "FAILED"])
        failed_table = Table(failed_data, colWidths=[40*mm,79*mm,30*mm,23*mm], repeatRows=1)
        failed_style = [("BACKGROUND",(0,0),(-1,0),navy),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#D7E0E5")),
                        ("VALIGN",(0,0),(-1,-1),"TOP"),("ALIGN",(2,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
        for index in range(1, len(failed_data)):
            failed_style += [("BACKGROUND",(3,index),(3,index),failed_bg),("TEXTCOLOR",(3,index),(3,index),failed_fg)]
        failed_table.setStyle(TableStyle(failed_style)); story += [failed_table, Spacer(1,4*mm)]

    story.append(Paragraph("Detailed test results", styles["H"]))
    data = [["Test", "Area", "Browser", "Time", "Result"]]
    for row in rows:
        data.append([Paragraph(esc(row["name"]), styles["Small"]), Paragraph(esc(row["area"]), styles["Small"]), row["browser"], f"{row['seconds']:.1f}s", row["status"]])
    table = Table(data, colWidths=[76*mm,35*mm,25*mm,15*mm,21*mm], repeatRows=1)
    detail_style = [("BACKGROUND",(0,0),(-1,0),navy),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#D7E0E5")),
                    ("VALIGN",(0,0),(-1,-1),"TOP"),("ALIGN",(2,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    for index, row in enumerate(rows, 1):
        bg, fg = status_colors[row["status"]]; detail_style += [("BACKGROUND",(4,index),(4,index),bg),("TEXTCOLOR",(4,index),(4,index),fg)]
    table.setStyle(TableStyle(detail_style)); story += [table, Spacer(1,3*mm)]
    story.append(Paragraph("Result interpretation", styles["H"]))
    story.append(Paragraph("Passed results are green, failed results are red, and skipped results are orange. A failed automated WCAG scan means the page contains a critical-impact assistive-technology markup finding; it does not mean the page was unavailable in that browser. Page availability, visual rendering, navigation, and keyboard operation are separate checks. All failures shown are the results of this recorded execution and should be verified with the saved Playwright evidence before correction.", styles["Body"]))
    doc.build(story); print(OUTPUT)


if __name__ == "__main__":
    build(parse())
