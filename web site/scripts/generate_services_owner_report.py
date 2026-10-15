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
OUTPUT = ROOT / "output" / "pdf" / "SBB-Oxygen-House-Services-Test-Report.pdf"
SITE = os.getenv("BASE_URL", "https://sbb.caliburlabz.com/")
SERVICES = ["All Gases & Equipments", "Ship Handling"]


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def display_name(value: str) -> str:
    value = re.sub(r"(?:@[\w-]+\s*)+", "", value).strip()
    return value.replace("â€º", ">").replace("›", ">")


def parse():
    if not JUNIT.exists():
        raise SystemExit("No test-results/junit.xml found. Run npm run test:services:all first.")
    root = ET.parse(JUNIT).getroot()
    rows = []
    for suite in root.findall(".//testsuite"):
        for case in suite.findall("testcase"):
            file_name = clean(case.attrib.get("classname"))
            name = clean(case.attrib.get("name"))
            if "services" not in file_name.lower() and "@services" not in name.lower():
                continue
            failure, error, skipped = case.find("failure"), case.find("error"), case.find("skipped")
            problem = failure if failure is not None else error
            status = "FAILED" if problem is not None else "SKIPPED" if skipped is not None else "PASSED"
            message = clean((problem.attrib.get("message") if problem is not None else "") or (problem.text if problem is not None else ""))
            service = next((item for item in SERVICES if item.lower() in name.lower()), "Unassigned service")
            rows.append({"name": display_name(name), "service": service, "file": file_name,
                         "browser": clean(suite.attrib.get("hostname")) or "unknown",
                         "seconds": float(case.attrib.get("time", "0") or 0), "status": status, "message": message})
    if not rows:
        raise SystemExit("JUnit contains no services results. Run npm run test:services:all first.")
    return rows


def build(rows):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone(timedelta(hours=5, minutes=30), name="Asia/Colombo"))
    passed = sum(row["status"] == "PASSED" for row in rows)
    failed = sum(row["status"] == "FAILED" for row in rows)
    skipped = sum(row["status"] == "SKIPPED" for row in rows)
    navy, blue = colors.HexColor("#0D2538"), colors.HexColor("#036083")
    pale = colors.HexColor("#EEF5F8")
    passed_bg, passed_fg = colors.HexColor("#DDF4E8"), colors.HexColor("#176B3A")
    failed_bg, failed_fg = colors.HexColor("#FDE8E6"), colors.HexColor("#A12622")
    skipped_bg, skipped_fg = colors.HexColor("#FFF0D6"), colors.HexColor("#9A5A00")
    status_colors = {"PASSED": (passed_bg, passed_fg), "FAILED": (failed_bg, failed_fg), "SKIPPED": (skipped_bg, skipped_fg)}
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleWhite", parent=styles["Title"], textColor=colors.white, fontSize=21, leading=26, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="SubWhite", parent=styles["Normal"], textColor=colors.HexColor("#D8EAF2"), fontSize=10, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="H", parent=styles["Heading1"], textColor=navy, fontSize=16, leading=20, spaceBefore=7, spaceAfter=7))
    styles.add(ParagraphStyle(name="H2", parent=styles["Heading2"], textColor=blue, fontSize=12, leading=15, spaceBefore=6, spaceAfter=4))
    styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], fontSize=9.2, leading=13, spaceAfter=5))
    styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontSize=7.8, leading=9.8))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#D7E0E5")); canvas.line(18*mm, 15*mm, 192*mm, 15*mm)
        canvas.setFont("Helvetica", 8); canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.drawString(18*mm, 9*mm, "SBB Oxygen House - Confidential services test report")
        canvas.drawRightString(192*mm, 9*mm, f"Page {doc.page}"); canvas.restoreState()

    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=20*mm)
    doc.addPageTemplates(PageTemplate(id="main", frames=Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height), onPage=footer))
    story = []
    banner = Table([[Paragraph("SBB Oxygen House - Services Automation Test Report", styles["TitleWhite"])],
                    [Paragraph(f"Production assessment - {now:%d %B %Y, %I:%M %p} (Sri Lanka time)", styles["SubWhite"])]], colWidths=[172*mm])
    banner.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), navy), ("TOPPADDING", (0,0), (-1,-1), 10), ("BOTTOMPADDING", (0,0), (-1,-1), 10)]))
    story += [banner, Spacer(1, 7*mm), Paragraph("Executive summary", styles["H"])]
    overall = "PASS" if failed == 0 else "ACTION REQUIRED"
    boxes = Table([[Paragraph(f"<b>Overall result</b><br/><font size='15'>{overall}</font>", styles["Body"]),
                    Paragraph(f"<b>{len(rows)}</b><br/>Executed", styles["Body"]), Paragraph(f"<b>{passed}</b><br/>Passed", styles["Body"]),
                    Paragraph(f"<b>{failed}</b><br/>Failed", styles["Body"]), Paragraph(f"<b>{skipped}</b><br/>Skipped", styles["Body"])]],
                  colWidths=[50*mm,30*mm,30*mm,30*mm,30*mm])
    boxes.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),passed_bg if not failed else failed_bg),("BACKGROUND",(1,0),(-1,0),pale),
                               ("GRID",(0,0),(-1,-1),.5,colors.HexColor("#C7D5DC")),("ALIGN",(1,0),(-1,-1),"CENTER"),
                               ("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    browsers = ", ".join(sorted({row["browser"] for row in rows}))
    story += [boxes, Spacer(1,4*mm), Paragraph(f"Website: {esc(SITE)}services<br/>Environment: Production<br/>Execution report generated: {now:%d %B %Y, %I:%M:%S %p} - Asia/Colombo<br/>Browser profiles: {esc(browsers)}", styles["Body"])]

    story.append(Paragraph("Areas and testing types covered", styles["H"]))
    coverage = [["Testing type", "Areas tested"],
                [Paragraph("Functional testing", styles["Small"]), Paragraph("Page title and description; hero Request a Quote and Call Us actions; navigation destinations; every Key Features & Benefits card and description; lower call-to-action heading; Request a Quote and Contact Us actions; footer headings, locations, contact channels, social links and quick links.", styles["Small"])],
                [Paragraph("Non-functional testing", styles["Small"]), Paragraph("WCAG accessibility scan; responsive overflow; navigation performance; page errors and failed same-origin requests; SEO title, description, canonical URL and heading structure; image loading and alternative text.", styles["Small"])],
                [Paragraph("UI and browser testing", styles["Small"]), Paragraph("Section visibility and usable dimensions; control target sizes; keyboard reachability; Chromium, Firefox, WebKit, Mobile Chrome and Mobile Safari profiles.", styles["Small"])]]
    coverage_table = Table(coverage, colWidths=[50*mm,122*mm], repeatRows=1)
    coverage_table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#D7E0E5")),
                                        ("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story += [coverage_table, Spacer(1,4*mm), Paragraph("Service section results", styles["H"])]
    summary = [["Service sub-section", "Checks", "Passed", "Failed", "Skipped", "Result"]]
    for service in SERVICES:
        items = [row for row in rows if row["service"] == service]
        p = sum(row["status"] == "PASSED" for row in items); f = sum(row["status"] == "FAILED" for row in items); s = sum(row["status"] == "SKIPPED" for row in items)
        summary.append([service, str(len(items)), str(p), str(f), str(s), "FAILED" if f else "PASSED"])
    summary_table = Table(summary, colWidths=[60*mm,20*mm,20*mm,20*mm,20*mm,32*mm], repeatRows=1)
    summary_style = [("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#D7E0E5")),
                     ("ALIGN",(1,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]
    for index, row in enumerate(summary[1:], 1):
        bg, fg = status_colors[row[-1]]
        summary_style += [("BACKGROUND",(-1,index),(-1,index),bg),("TEXTCOLOR",(-1,index),(-1,index),fg)]
    summary_table.setStyle(TableStyle(summary_style)); story += [summary_table, Spacer(1,4*mm)]

    failures = [row for row in rows if row["status"] == "FAILED"]
    story.append(Paragraph("Failed test cases", styles["H"]))
    if not failures:
        story.append(Paragraph("No failed service test cases were recorded.", styles["Body"]))
    else:
        failed_data = [["Service", "Test case", "Browser", "Result"]]
        for row in failures:
            failed_data.append([Paragraph(esc(row["service"]), styles["Small"]), Paragraph(esc(row["name"]), styles["Small"]), row["browser"], "FAILED"])
        failed_table = Table(failed_data, colWidths=[40*mm,79*mm,30*mm,23*mm], repeatRows=1)
        failed_style = [("BACKGROUND",(0,0),(-1,0),navy),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#D7E0E5")),
                        ("VALIGN",(0,0),(-1,-1),"TOP"),("ALIGN",(2,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
        for index in range(1, len(failed_data)):
            failed_style += [("BACKGROUND",(3,index),(3,index),failed_bg),("TEXTCOLOR",(3,index),(3,index),failed_fg)]
        failed_table.setStyle(TableStyle(failed_style)); story += [failed_table, Spacer(1,4*mm)]

    story.append(Paragraph("Detailed results by service sub-section", styles["H"]))
    for service in SERVICES:
        items = [row for row in rows if row["service"] == service]
        story.append(Paragraph(service, styles["H2"]))
        data = [["Test", "Browser", "Time", "Result"]]
        for row in items:
            data.append([Paragraph(esc(row["name"]), styles["Small"]), row["browser"], f"{row['seconds']:.1f}s", row["status"]])
        table = Table(data, colWidths=[100*mm,27*mm,18*mm,27*mm], repeatRows=1)
        detail_style = [("BACKGROUND",(0,0),(-1,0),navy),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#D7E0E5")),
                        ("VALIGN",(0,0),(-1,-1),"TOP"),("ALIGN",(1,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
        for index, row in enumerate(items, 1):
            bg, fg = status_colors[row["status"]]
            detail_style += [("BACKGROUND",(3,index),(3,index),bg),("TEXTCOLOR",(3,index),(3,index),fg)]
        table.setStyle(TableStyle(detail_style)); story += [table, Spacer(1,3*mm)]

    story.append(Paragraph("Result interpretation", styles["H"]))
    story.append(Paragraph("Passed results are green, failed results are red, and skipped results are orange. A failed automated WCAG scan means the page contains a critical-impact assistive-technology markup finding; it does not mean the page was unavailable in that browser. Page availability, visual rendering, navigation, and keyboard operation are separate checks. Timeouts and execution errors are retained as recorded and must be distinguished from reproducible product defects during developer triage.", styles["Body"]))
    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build(parse())
