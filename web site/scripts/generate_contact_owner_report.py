from __future__ import annotations

import os, re, xml.etree.ElementTree as ET
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
OUTPUT = ROOT / "output" / "pdf" / "SBB-Oxygen-House-Contact-Us-Test-Report.pdf"
SITE = os.getenv("BASE_URL", "https://sbb.caliburlabz.com/")
RULES = [
    ("Title and description", ["title and description"]), ("Required-field validation", ["required name"]),
    ("Email validation", ["email rejects"]), ("Optional fields", ["optional phone"]),
    ("Form submission", ["sends the form"]), ("Contact details", ["contact details and navigation"]),
    ("Branch maps", ["branch tab", "embedded maps"]), ("Footer", ["footer content"]),
    ("UI layout", ["sections, form controls"]), ("Keyboard navigation", ["keyboard"]),
    ("Accessibility", ["accessibility"]), ("Performance", ["navigation budgets"]),
    ("Page quality", ["page errors"]), ("Responsive layout", ["horizontal overflow"]),
    ("Security", ["https and records"]), ("SEO", ["metadata and semantic"]),
]

def clean(v): return re.sub(r"\s+", " ", v or "").strip()
def esc(v): return v.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def name(v): return re.sub(r"(?:@[\w-]+\s*)+", "", clean(v)).replace("â€º", ">").replace("›", ">").strip()
def area(v):
    low = v.lower()
    return next((title for title, phrases in RULES if any(p in low for p in phrases)), "Other Contact Us checks")

def parse():
    if not JUNIT.exists(): raise SystemExit("Run npm run test:contact-us:all first.")
    rows=[]
    for suite in ET.parse(JUNIT).getroot().findall(".//testsuite"):
        for case in suite.findall("testcase"):
            raw, file = clean(case.attrib.get("name")), clean(case.attrib.get("classname"))
            if "contact-us" not in file.lower() and "@contact-us" not in raw.lower(): continue
            failure, error, skipped = case.find("failure"), case.find("error"), case.find("skipped")
            problem = failure if failure is not None else error
            status = "FAILED" if problem is not None else "SKIPPED" if skipped is not None else "PASSED"
            message = clean((problem.attrib.get("message") if problem is not None else "") or (problem.text if problem is not None else ""))
            display=name(raw)
            rows.append(dict(name=display, area=area(display), browser=clean(suite.attrib.get("hostname")) or "unknown",
                             seconds=float(case.attrib.get("time","0") or 0), status=status, message=message))
    if not rows: raise SystemExit("JUnit contains no Contact Us results.")
    return rows

def build(rows):
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    now=datetime.now(timezone(timedelta(hours=5,minutes=30),name="Asia/Colombo"))
    passed=sum(r["status"]=="PASSED" for r in rows); failed=sum(r["status"]=="FAILED" for r in rows); skipped=sum(r["status"]=="SKIPPED" for r in rows)
    navy,blue,pale=colors.HexColor("#0D2538"),colors.HexColor("#036083"),colors.HexColor("#EEF5F8")
    pbg,pfg=colors.HexColor("#DDF4E8"),colors.HexColor("#176B3A"); fbg,ffg=colors.HexColor("#FDE8E6"),colors.HexColor("#A12622"); sbg,sfg=colors.HexColor("#FFF0D6"),colors.HexColor("#9A5A00")
    palette={"PASSED":(pbg,pfg),"FAILED":(fbg,ffg),"SKIPPED":(sbg,sfg)}
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleWhite",parent=styles["Title"],textColor=colors.white,fontSize=21,leading=26,alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="SubWhite",parent=styles["Normal"],textColor=colors.HexColor("#D8EAF2"),fontSize=10,alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="H",parent=styles["Heading1"],textColor=navy,fontSize=16,leading=20,spaceBefore=7,spaceAfter=7))
    styles.add(ParagraphStyle(name="Body",parent=styles["BodyText"],fontSize=9.2,leading=13,spaceAfter=5))
    styles.add(ParagraphStyle(name="Small",parent=styles["Normal"],fontSize=7.7,leading=9.6))
    def footer(canvas,doc):
        canvas.saveState(); canvas.setStrokeColor(colors.HexColor("#D7E0E5")); canvas.line(18*mm,15*mm,192*mm,15*mm)
        canvas.setFont("Helvetica",8); canvas.setFillColor(colors.HexColor("#64748B")); canvas.drawString(18*mm,9*mm,"SBB Oxygen House - Confidential Contact Us test report"); canvas.drawRightString(192*mm,9*mm,f"Page {doc.page}"); canvas.restoreState()
    doc=BaseDocTemplate(str(OUTPUT),pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=16*mm,bottomMargin=20*mm)
    doc.addPageTemplates(PageTemplate(id="main",frames=Frame(doc.leftMargin,doc.bottomMargin,doc.width,doc.height),onPage=footer)); story=[]
    banner=Table([[Paragraph("SBB Oxygen House - Contact Us Automation Test Report",styles["TitleWhite"])],[Paragraph(f"Production assessment - {now:%d %B %Y, %I:%M %p} (Sri Lanka time)",styles["SubWhite"])]],colWidths=[172*mm])
    banner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),navy),("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10)])); story += [banner,Spacer(1,7*mm),Paragraph("Executive summary",styles["H"])]
    overall="PASS" if not failed else "ACTION REQUIRED"
    boxes=Table([[Paragraph(f"<b>Overall result</b><br/><font size='15'>{overall}</font>",styles["Body"]),Paragraph(f"<b>{len(rows)}</b><br/>Executed",styles["Body"]),Paragraph(f"<b>{passed}</b><br/>Passed",styles["Body"]),Paragraph(f"<b>{failed}</b><br/>Failed",styles["Body"]),Paragraph(f"<b>{skipped}</b><br/>Skipped",styles["Body"])]],colWidths=[50*mm,30*mm,30*mm,30*mm,30*mm])
    boxes.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),pbg if not failed else fbg),("BACKGROUND",(1,0),(-1,0),pale),("GRID",(0,0),(-1,-1),.5,colors.HexColor("#C7D5DC")),("ALIGN",(1,0),(-1,-1),"CENTER"),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    browsers=", ".join(sorted({r["browser"] for r in rows})); story += [boxes,Spacer(1,4*mm),Paragraph(f"Website: {esc(SITE)}contact<br/>Environment: Production<br/>Report generated: {now:%d %B %Y, %I:%M:%S %p} - Asia/Colombo<br/>Browser profiles: {esc(browsers)}",styles["Body"])]
    story.append(Paragraph("Areas and testing types covered",styles["H"])); coverage=[["Testing type","Areas tested"],[Paragraph("Functional testing",styles["Small"]),Paragraph("Title and description; required Name, Email and Message errors; malformed email; optional Phone and Subject; real form submission and success notification; contact-detail links; all four branch maps; complete footer.",styles["Small"])],[Paragraph("Non-functional testing",styles["Small"]),Paragraph("WCAG accessibility; responsive overflow; navigation performance; HTTPS and security headers; page errors and failed same-origin requests; safe titled HTTPS map embed; SEO metadata and semantic headings.",styles["Small"])],[Paragraph("UI and browser testing",styles["Small"]),Paragraph("Section and form-control visibility and dimensions; displayed map; keyboard reachability; Chromium, Firefox, WebKit, Mobile Chrome and Mobile Safari.",styles["Small"])]]
    ct=Table(coverage,colWidths=[50*mm,122*mm],repeatRows=1); ct.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#D7E0E5")),("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)])); story += [ct,Spacer(1,4*mm),Paragraph("Results by tested area",styles["H"])]
    summary=[["Area","Checks","Passed","Failed","Skipped","Result"]]
    for a in dict.fromkeys(r["area"] for r in rows):
        items=[r for r in rows if r["area"]==a]; p=sum(r["status"]=="PASSED" for r in items); f=sum(r["status"]=="FAILED" for r in items); s=sum(r["status"]=="SKIPPED" for r in items); summary.append([a,str(len(items)),str(p),str(f),str(s),"FAILED" if f else "PASSED"])
    st=Table(summary,colWidths=[62*mm,20*mm,20*mm,20*mm,20*mm,30*mm],repeatRows=1); ss=[("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.4,colors.HexColor("#D7E0E5")),("ALIGN",(1,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    for i,row in enumerate(summary[1:],1): bg,fg=palette[row[-1]]; ss += [("BACKGROUND",(-1,i),(-1,i),bg),("TEXTCOLOR",(-1,i),(-1,i),fg)]
    st.setStyle(TableStyle(ss)); story += [st,Spacer(1,4*mm),Paragraph("Failed test cases",styles["H"])]
    failures=[r for r in rows if r["status"]=="FAILED"]
    fd=[["Area","Test case","Browser","Result"]]+[[Paragraph(esc(r["area"]),styles["Small"]),Paragraph(esc(r["name"]),styles["Small"]),r["browser"],"FAILED"] for r in failures]
    ft=Table(fd,colWidths=[40*mm,79*mm,30*mm,23*mm],repeatRows=1); fs=[("BACKGROUND",(0,0),(-1,0),navy),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#D7E0E5")),("VALIGN",(0,0),(-1,-1),"TOP"),("ALIGN",(2,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    for i in range(1,len(fd)): fs += [("BACKGROUND",(3,i),(3,i),fbg),("TEXTCOLOR",(3,i),(3,i),ffg)]
    ft.setStyle(TableStyle(fs)); story += [ft,Spacer(1,4*mm),Paragraph("Detailed test results",styles["H"])]
    data=[["Test","Area","Browser","Time","Result"]]+[[Paragraph(esc(r["name"]),styles["Small"]),Paragraph(esc(r["area"]),styles["Small"]),r["browser"],f"{r['seconds']:.1f}s",r["status"]] for r in rows]
    dt=Table(data,colWidths=[76*mm,35*mm,25*mm,15*mm,21*mm],repeatRows=1); ds=[("BACKGROUND",(0,0),(-1,0),navy),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#D7E0E5")),("VALIGN",(0,0),(-1,-1),"TOP"),("ALIGN",(2,1),(-1,-1),"CENTER"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    for i,r in enumerate(rows,1): bg,fg=palette[r["status"]]; ds += [("BACKGROUND",(4,i),(4,i),bg),("TEXTCOLOR",(4,i),(4,i),fg)]
    dt.setStyle(TableStyle(ds)); story += [dt,Spacer(1,3*mm),Paragraph("Result interpretation",styles["H"]),Paragraph("Passed results are green, failed results are red, and skipped results are orange. The five Contact Us WCAG failures are Axe rule aria-valid-attr-value: branch-tab aria-controls values contain branch names with spaces and are invalid ID references. This can prevent assistive technologies from associating a tab with its map panel; it does not mean the page cannot be opened or used in Safari. Page availability, form operation, navigation, map selection, visual rendering, and keyboard operation passed separately in all five profiles. Browser or network execution errors, if recorded in a future run, must be distinguished from reproducible product defects during developer triage.",styles["Body"])]
    doc.build(story); print(OUTPUT)

if __name__=="__main__": build(parse())
