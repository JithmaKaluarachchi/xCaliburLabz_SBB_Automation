from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle

from generate_bug_register import BUGS


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "SBB-Oxygen-House-Test-Findings-and-Verification-Register.pdf"


def esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def browser_safe(value: str) -> str:
    replacements = [
        ("Chromium, Firefox, WebKit, Mobile Chrome and Mobile Safari", "Chrome Web/Mobile, Firefox Web and Safari Web/Mobile require verification; Edge Web/Mobile has not yet been tested"),
        ("WebKit and Mobile Safari", "Safari Web and Safari Mobile verification"),
        ("Mobile Chrome and Mobile Safari", "Chrome Mobile and Safari Mobile verification"),
        ("Mobile Safari", "Safari Mobile"),
        ("Mobile Chrome", "Chrome Mobile"),
        ("WebKit", "Safari Web verification"),
        ("Firefox", "Firefox Web verification"),
        ("Chromium", "Chrome Web verification"),
        ("Playwright", "automation"),
    ]
    for old, new in replacements:
        value = value.replace(old, new)
    return value


def status_for(bug_id: str) -> str:
    if bug_id == "BUG-014":
        return "Accessibility Finding - Needs Developer Verification"
    if bug_id == "BUG-013":
        return "Performance Observation - Needs Controlled Retest"
    return "Manual Test Passed - Earlier Automation Finding Needs Verification"


def rows():
    revised = []
    for bug in BUGS:
        values = [browser_safe(str(value)) for value in bug]
        status = status_for(values[0])
        values[4] = f"Status: {status}. {values[4]}"
        values[7] = f"{values[7]} Manual testing did not reproduce this as a confirmed production bug."
        values[9] = f"{values[9]} Classification: {status}. Edge Web/Mobile evidence is not available."
        revised.append(tuple(values))
    return revised


def build() -> Path:
    findings = rows()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    navy, blue = colors.HexColor("#0D2538"), colors.HexColor("#036083")
    line, pale = colors.HexColor("#CFDCE3"), colors.HexColor("#F3F7F9")
    high_bg, high_fg = colors.HexColor("#FDE8E6"), colors.HexColor("#A12622")
    medium_bg, medium_fg = colors.HexColor("#FFF0D6"), colors.HexColor("#9A5A00")
    styles = getSampleStyleSheet()
    title = ParagraphStyle("Title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=19, leading=23, textColor=colors.white, alignment=TA_CENTER)
    subtitle = ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=9, leading=12, textColor=colors.HexColor("#D8EAF2"), alignment=TA_CENTER)
    cell = ParagraphStyle("Cell", parent=styles["Normal"], fontSize=5.9, leading=7.2)
    cell_bold = ParagraphStyle("CellBold", parent=cell, fontName="Helvetica-Bold")
    header = ParagraphStyle("Header", parent=cell_bold, textColor=colors.white, alignment=TA_CENTER)
    body = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=9, leading=13)

    def footer(canvas, doc):
        canvas.saveState(); canvas.setStrokeColor(line); canvas.line(10*mm, 9*mm, 410*mm, 9*mm)
        canvas.setFillColor(colors.HexColor("#64748B")); canvas.setFont("Helvetica", 7)
        canvas.drawString(10*mm, 5*mm, "SBB Oxygen House - Confidential test findings and verification register")
        canvas.drawRightString(410*mm, 5*mm, f"Page {doc.page}"); canvas.restoreState()

    doc = BaseDocTemplate(str(OUTPUT), pagesize=landscape(A3), leftMargin=10*mm, rightMargin=10*mm, topMargin=10*mm, bottomMargin=13*mm)
    doc.addPageTemplates(PageTemplate(id="findings", frames=Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height), onPage=footer))
    now = datetime.now(timezone(timedelta(hours=5, minutes=30), name="Asia/Colombo"))
    banner = Table([[Paragraph("SBB Oxygen House - Test Findings and Verification Register", title)], [Paragraph(f"Developer and QA review table - {now:%d %B %Y, %I:%M %p} (Sri Lanka time)", subtitle)]], colWidths=[400*mm])
    banner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),navy),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    story = [banner, Spacer(1,4*mm), Paragraph("Important: these 14 rows are findings, not 14 confirmed production bugs. Manual testing passed the reported scenarios. Each row retains the earlier evidence for investigation and states the verification required before a developer defect is raised. Browser labels are limited to Chrome, Safari, Edge and Firefox for Web/Mobile.", body), Spacer(1,4*mm)]

    headings = ["Bug ID", "Page name", "Component", "Title", "Description", "Steps to Reproduce", "Expected Result", "Actual Result", "Severity", "Screenshot / Evidence"]
    data = [[Paragraph(value, header) for value in headings]]
    for row in findings:
        data.append([Paragraph(esc(value), cell_bold if index in (0,8) else cell) for index,value in enumerate(row)])
    widths = [14,27,30,45,54,64,53,55,19,39]
    table = Table(data, colWidths=[w*mm for w in widths], repeatRows=1)
    commands = [("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("VALIGN",(0,0),(-1,-1),"TOP"),("GRID",(0,0),(-1,-1),.35,line),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    for index,row in enumerate(findings,1):
        commands += [("BACKGROUND",(0,index),(-1,index),colors.white if index%2 else pale),("ALIGN",(0,index),(0,index),"CENTER"),("ALIGN",(8,index),(8,index),"CENTER")]
        bg,fg = (high_bg,high_fg) if row[8]=="High" else (medium_bg,medium_fg)
        commands += [("BACKGROUND",(8,index),(8,index),bg),("TEXTCOLOR",(8,index),(8,index),fg)]
    table.setStyle(TableStyle(commands)); story.append(table); doc.build(story)
    return OUTPUT


if __name__ == "__main__":
    print(build())
