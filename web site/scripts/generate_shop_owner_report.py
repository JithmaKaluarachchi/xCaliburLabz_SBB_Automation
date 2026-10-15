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
from reportlab.platypus import BaseDocTemplate, Frame, KeepTogether, PageTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
JUNIT = ROOT / "test-results" / "junit.xml"
OUTPUT = ROOT / "output" / "pdf" / "SBB-Oxygen-House-Shop-Test-Report.pdf"
SITE = os.getenv("BASE_URL", "https://sbb.caliburlabz.com/")

SECTIONS = [
    ("Shop Page", ["shop-listing.spec", "nonfunctional\\shop\\nonfunctional.spec", "nonfunctional/shop/nonfunctional.spec"]),
    ("Item Detail Page", ["product-details.spec"]),
    ("Cart Page", ["cart.spec"]),
    ("Checkout Page", ["checkout.spec"]),
]


def esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def parse():
    if not JUNIT.exists():
        raise SystemExit("No test-results/junit.xml found. Run npm run test:shop first.")
    root = ET.parse(JUNIT).getroot()
    rows = []
    for suite in root.findall(".//testsuite"):
        for case in suite.findall("testcase"):
            file = clean(case.attrib.get("classname"))
            if "shop" not in file.lower() and "cart.spec" not in file.lower() and "checkout.spec" not in file.lower():
                continue
            failure, error, skipped = case.find("failure"), case.find("error"), case.find("skipped")
            problem = failure if failure is not None else error
            status = "FAILED" if problem is not None else "SKIPPED" if skipped is not None else "PASSED"
            message = clean((problem.attrib.get("message") if problem is not None else "") or (problem.text if problem is not None else ""))
            rows.append({"name": clean(case.attrib.get("name")), "file": file,
                         "browser": suite.attrib.get("hostname", "unknown"),
                         "seconds": float(case.attrib.get("time", "0") or 0),
                         "status": status, "message": message})
    if not rows:
        raise SystemExit("JUnit contains no shop results. Run npm run test:shop first.")
    return rows


def section(row):
    normalized = row["file"].lower()
    for title, patterns in SECTIONS:
        if any(pattern.lower() in normalized for pattern in patterns):
            return title
    return "Shop Page"


def build(rows):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone(timedelta(hours=5, minutes=30), name="Asia/Colombo"))
    passed = sum(r["status"] == "PASSED" for r in rows)
    failed = sum(r["status"] == "FAILED" for r in rows)
    skipped = sum(r["status"] == "SKIPPED" for r in rows)
    overall = "PASS" if failed == 0 else "ACTION REQUIRED"
    navy, blue, pale = colors.HexColor("#0D2538"), colors.HexColor("#036083"), colors.HexColor("#EEF5F8")
    passed_bg, passed_fg = colors.HexColor("#DDF4E8"), colors.HexColor("#176B3A")
    failed_bg, failed_fg = colors.HexColor("#FDE8E6"), colors.HexColor("#A12622")
    skipped_bg, skipped_fg = colors.HexColor("#FFF0D6"), colors.HexColor("#9A5A00")
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleWhite", parent=styles["Title"], textColor=colors.white, fontSize=22, leading=27, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="SubWhite", parent=styles["Normal"], textColor=colors.HexColor("#D8EAF2"), fontSize=10, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="H", parent=styles["Heading1"], textColor=navy, fontSize=16, leading=20, spaceBefore=7, spaceAfter=7))
    styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], fontSize=9.5, leading=14, spaceAfter=5))
    styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontSize=8.2, leading=10.5))

    def footer(canvas, doc):
        canvas.saveState(); canvas.setStrokeColor(colors.HexColor("#D7E0E5")); canvas.line(18*mm, 15*mm, 192*mm, 15*mm)
        canvas.setFont("Helvetica", 8); canvas.setFillColor(colors.HexColor("#64748B")); canvas.drawString(18*mm, 9*mm, "SBB Oxygen House - Confidential shop test report")
        canvas.drawRightString(192*mm, 9*mm, f"Page {doc.page}"); canvas.restoreState()

    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=20*mm)
    doc.addPageTemplates(PageTemplate(id="main", frames=Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height), onPage=footer))
    story = []
    banner = Table([[Paragraph("SBB Oxygen House - Shop Automation Test Report", styles["TitleWhite"])],
                    [Paragraph(f"Production assessment - {now:%d %B %Y, %I:%M %p} (Sri Lanka time)", styles["SubWhite"])]], colWidths=[172*mm])
    banner.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), navy), ("TOPPADDING", (0,0), (-1,-1), 10), ("BOTTOMPADDING", (0,0), (-1,-1), 10)]))
    story += [banner, Spacer(1, 7*mm), Paragraph("Executive summary", styles["H"])]
    boxes = Table([[Paragraph(f"<b>Overall result</b><br/><font size='16'>{overall}</font>", styles["Body"]),
                    Paragraph(f"<b>{len(rows)}</b><br/>Executed", styles["Body"]), Paragraph(f"<b>{passed}</b><br/>Passed", styles["Body"]),
                    Paragraph(f"<b>{failed}</b><br/>Failed", styles["Body"]), Paragraph(f"<b>{skipped}</b><br/>Skipped", styles["Body"])]],
                  colWidths=[50*mm,30*mm,30*mm,30*mm,30*mm])
    boxes.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),colors.HexColor("#DDF4E8") if not failed else colors.HexColor("#FDE8E6")),
                               ("BACKGROUND",(1,0),(-1,0),pale),("GRID",(0,0),(-1,-1),.5,colors.HexColor("#C7D5DC")),
                               ("ALIGN",(1,0),(-1,-1),"CENTER"),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    story += [boxes, Spacer(1,4*mm), Paragraph(f"Website: {esc(SITE)}shop<br/>Environment: Production<br/>Execution: {now:%d %B %Y, %I:%M:%S %p} - Asia/Colombo<br/>Browser(s): {esc(', '.join(sorted({r['browser'] for r in rows})))}", styles["Body"])]

    story.append(Paragraph("Areas and testing types covered", styles["H"]))
    coverage = [
        ["Testing type", "Areas tested"],
        [Paragraph("Functional testing", styles["Small"]), Paragraph("Shop navigation and listing; search; sorting; category, brand and price filters; product links and product details; quantity and tabs; add-to-cart, cart totals, removal and continue-shopping; checkout totals, customer details, province/district dependencies, required/optional fields, invalid formats, coupon handling and safe order validation.", styles["Small"])],
        [Paragraph("Non-functional testing", styles["Small"]), Paragraph("Accessibility; responsive layout and horizontal overflow; navigation performance budgets; uncaught errors and failed same-origin requests; image loading and alternative text; keyboard reachability; SEO metadata and headings; control/card names and usable dimensions.", styles["Small"])],
        [Paragraph("Cross-browser/device coverage", styles["Small"]), Paragraph("Desktop Chromium, Firefox and WebKit, plus Mobile Chrome and Mobile Safari profiles.", styles["Small"])],
    ]
    coverage_table = Table(coverage, colWidths=[52*mm,120*mm], repeatRows=1)
    coverage_table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),
                                        ("GRID",(0,0),(-1,-1),.4,colors.HexColor("#D7E0E5")),("VALIGN",(0,0),(-1,-1),"TOP"),
                                        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story += [coverage_table, Spacer(1,4*mm)]

    grouped = {title: [r for r in rows if section(r) == title] for title, _ in SECTIONS}
    story.append(Paragraph("Shop section results", styles["H"]))
    summary = [["Sub-section", "Checks", "Passed", "Failed", "Skipped", "Result"]]
    for title, items in grouped.items():
        f = sum(x["status"] == "FAILED" for x in items); p = sum(x["status"] == "PASSED" for x in items); s = sum(x["status"] == "SKIPPED" for x in items)
        summary.append([title, str(len(items)), str(p), str(f), str(s), "PASSED" if items and not f else "FAILED" if f else "NOT RUN"])
    st = Table(summary, colWidths=[62*mm,20*mm,20*mm,20*mm,20*mm,30*mm], repeatRows=1)
    summary_style = [("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#D7E0E5")),
                     ("ALIGN",(1,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]
    for row_no, row in enumerate(summary[1:], 1):
        bg, fg = (failed_bg, failed_fg) if row[-1] == "FAILED" else (passed_bg, passed_fg) if row[-1] == "PASSED" else (skipped_bg, skipped_fg)
        summary_style += [("BACKGROUND",(-1,row_no),(-1,row_no),bg),("TEXTCOLOR",(-1,row_no),(-1,row_no),fg)]
    st.setStyle(TableStyle(summary_style))
    story += [st, Spacer(1,4*mm)]

    story.append(Paragraph("Issues and required changes", styles["H"]))
    failures = [r for r in rows if r["status"] == "FAILED"]
    if not failures:
        story.append(Paragraph("No automated shop failures were recorded. No corrective changes are required from this execution.", styles["Body"]))
    for i, r in enumerate(failures, 1):
        issue = Table([[Paragraph(f"<b>{i}. {esc(section(r))}: {esc(re.sub(r'(?:@[\w-]+\s*)+', '', r['name']).strip())}</b>", styles["Body"])],
                       [Paragraph(f"<b>Observed:</b> {esc(r['message'][:800] or 'Expected behavior did not complete.')}", styles["Small"])],
                       [Paragraph("<b>Recommendation:</b> Review the named page and Playwright evidence, correct the behavior, and rerun the shop suite.", styles["Small"])]], colWidths=[170*mm])
        issue.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#FDE8E6")),("BOX",(0,0),(-1,-1),.5,colors.HexColor("#E8B4AE")),
                                   ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
        story += [KeepTogether(issue), Spacer(1,3*mm)]

    if failures:
        story.append(Paragraph("Failed test cases", styles["H"]))
        failed_data = [["Sub-section", "Test case", "Browser", "Result"]]
        for r in failures:
            name = re.sub(r"(?:@[\w-]+\s*)+", "", r["name"]).strip()
            failed_data.append([section(r), Paragraph(esc(name), styles["Small"]), r["browser"], "FAILED"])
        failed_table = Table(failed_data, colWidths=[31*mm,91*mm,27*mm,23*mm], repeatRows=1)
        failed_style = [("BACKGROUND",(0,0),(-1,0),navy),("TEXTCOLOR",(0,0),(-1,0),colors.white),
                        ("GRID",(0,0),(-1,-1),.35,colors.HexColor("#D7E0E5")),("VALIGN",(0,0),(-1,-1),"TOP"),
                        ("ALIGN",(2,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
        for row_no in range(1, len(failed_data)):
            failed_style += [("BACKGROUND",(3,row_no),(3,row_no),failed_bg),("TEXTCOLOR",(3,row_no),(3,row_no),failed_fg)]
        failed_table.setStyle(TableStyle(failed_style))
        story += [failed_table, Spacer(1,3*mm)]

    story.append(Paragraph("Detailed results by sub-section", styles["H"]))
    for title, items in grouped.items():
        story.append(Paragraph(title, ParagraphStyle(name=f"sub{title}", parent=styles["Heading2"], textColor=blue, fontSize=12, spaceBefore=5, spaceAfter=4)))
        data = [["Test", "Browser", "Time", "Result"]]
        for r in items:
            name = re.sub(r"(?:@[\w-]+\s*)+", "", r["name"]).strip()
            data.append([Paragraph(esc(name), styles["Small"]), r["browser"], f"{r['seconds']:.1f}s", r["status"]])
        table = Table(data, colWidths=[100*mm,27*mm,18*mm,27*mm], repeatRows=1)
        detail_style = [("BACKGROUND",(0,0),(-1,0),navy),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#D7E0E5")),
                        ("VALIGN",(0,0),(-1,-1),"TOP"),("ALIGN",(1,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
        status_colors = {"PASSED": (passed_bg, passed_fg), "FAILED": (failed_bg, failed_fg), "SKIPPED": (skipped_bg, skipped_fg)}
        for row_no, r in enumerate(items, 1):
            bg, fg = status_colors[r["status"]]
            detail_style += [("BACKGROUND",(3,row_no),(3,row_no),bg),("TEXTCOLOR",(3,row_no),(3,row_no),fg)]
        table.setStyle(TableStyle(detail_style))
        story += [table, Spacer(1,3*mm)]
    story.append(KeepTogether([
        Paragraph("Safety note", styles["H"]),
        Paragraph("The suite validates Place Order availability and form validation but does not submit a successful production order. Coupon entry is optional; an invalid coupon must not change the payable total or prevent checkout.", styles["Body"]),
        Paragraph("Result interpretation", styles["H"]),
        Paragraph("Passed results are green, failed results are red, and skipped results are orange. A failed automated WCAG scan identifies a critical-impact assistive-technology markup finding; it does not mean the page was unavailable in that browser. Page availability, visual rendering, shopping behavior, navigation, and keyboard operation are separate checks. Timeouts and execution errors must be distinguished from reproducible product defects during developer triage.", styles["Body"]),
    ]))
    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build(parse())
