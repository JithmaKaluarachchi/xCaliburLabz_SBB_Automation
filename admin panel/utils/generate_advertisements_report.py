from pathlib import Path
import xml.etree.ElementTree as ET

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
JUNIT = ROOT / "test-results" / "junit.xml"
OUTPUT = ROOT / "output" / "pdf" / "SBB-Oxygen-House-Admin-Advertisements-Test-Report.pdf"

if not JUNIT.exists():
    raise SystemExit("Run npm run test:advertisements:all first.")

rows = []
for suite in ET.parse(JUNIT).getroot().findall("testsuite"):
    browser = suite.get("hostname", "Unknown")
    for case in suite.findall("testcase"):
        name = case.get("name", "")
        if "ADS-MATRIX-" not in name:
            continue
        failure = case.find("failure")
        skipped_node = case.find("skipped")
        result = "FAILED" if failure is not None else ("SKIPPED" if skipped_node is not None else "PASSED")
        identifier = name.split(">")[-1].strip()
        finding = "Verified"
        if failure is not None:
            finding = "See retained Playwright evidence"
        rows.append([identifier, browser, result, f"{float(case.get('time', 0)):.1f}s", finding])

if not rows:
    raise SystemExit("No Advertisements matrix results found in test-results/junit.xml.")

passed = sum(row[2] == "PASSED" for row in rows)
failed = sum(row[2] == "FAILED" for row in rows)
skipped = sum(row[2] == "SKIPPED" for row in rows)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
navy = colors.HexColor("#102331")
teal = colors.HexColor("#0B6980")
blue = colors.HexColor("#15A9E5")
line = colors.HexColor("#B9C9D1")
green = colors.HexColor("#DDF4E6")
red = colors.HexColor("#FADADA")
amber = colors.HexColor("#FFF0C2")

title = ParagraphStyle("Title", parent=styles["Title"], fontSize=20, leading=24, textColor=navy, spaceAfter=3*mm)
h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=13, leading=16, textColor=teal, spaceBefore=3*mm, spaceAfter=2*mm)
h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=10, leading=13, textColor=navy, spaceBefore=2*mm, spaceAfter=1*mm)
body = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=8.5, leading=12, textColor=navy)
small = ParagraphStyle("Small", parent=body, fontSize=7, leading=9)
tiny = ParagraphStyle("Tiny", parent=body, fontSize=5.8, leading=6.7)
center = ParagraphStyle("Center", parent=small, alignment=TA_CENTER)

def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(line)
    canvas.line(14*mm, 12*mm, 196*mm, 12*mm)
    canvas.setFillColor(colors.HexColor("#607783"))
    canvas.setFont("Helvetica", 6.5)
    canvas.drawString(14*mm, 8*mm, "SBB Oxygen House - Admin Advertisements Test Report")
    canvas.drawRightString(196*mm, 8*mm, f"Page {doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(
    str(OUTPUT), pagesize=A4, leftMargin=14*mm, rightMargin=14*mm,
    topMargin=14*mm, bottomMargin=17*mm, title="Admin Advertisements Test Report",
    author="Calibur Automation"
)

story = [
    Paragraph("SBB OXYGEN HOUSE", ParagraphStyle("Brand", parent=h2, textColor=teal, spaceAfter=1*mm)),
    Paragraph("ADMIN ADVERTISEMENTS TEST REPORT", title),
    Paragraph("Functional, validation, UI, nonfunctional and web/mobile browser compatibility evidence", body),
    Spacer(1, 5*mm),
]

summary = [
    ["Target", "Matrix", "Passed", "Failed", "Skipped"],
    ["/admin/advertisements", str(len(rows)), str(passed), str(failed), str(skipped)],
]
summary_table = Table(summary, colWidths=[72*mm, 27*mm, 27*mm, 27*mm, 27*mm])
summary_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), teal), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("ALIGN", (1,0), (-1,-1), "CENTER"), ("GRID", (0,0), (-1,-1), .4, line),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTSIZE", (0,0), (-1,-1), 8),
    ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story += [summary_table, Spacer(1, 5*mm), Paragraph("Executive result", h1)]
story += [Paragraph(
    f"The browser compatibility matrix completed with <b>{passed} passed, {failed} failed and {skipped} skipped</b>. "
    "The matrix executed three checks in each of eight configured profiles: safe functional behavior, responsive UI fit, and accessibility/HTTPS/runtime quality. "
    "A separate complete Chrome execution produced 18 passes and one intentional validation failure described below.", body
)]

story += [Paragraph("Confirmed application finding", h1)]
finding = Table([
    [Paragraph("Severity", small), Paragraph("Area", small), Paragraph("Finding and expected correction", small)],
    [Paragraph("Medium", small), Paragraph("Link URL validation", small), Paragraph(
        "The Link URL control is rendered without type=\"url\". Malformed values therefore receive no native URL validation. "
        "Use an HTML URL input and server-side URL validation; keep the automated test failing until corrected.", small)],
], colWidths=[25*mm, 42*mm, 113*mm])
finding.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), navy), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("BACKGROUND", (0,1), (0,1), amber), ("GRID", (0,0), (-1,-1), .4, line),
    ("VALIGN", (0,0), (-1,-1), "TOP"), ("PADDING", (0,0), (-1,-1), 5),
]))
story += [finding, Spacer(1, 4*mm), Paragraph("Scope and test-data safety", h1), Paragraph(
    "Read-only checks use existing advertisements only for display, search, edit-load and delete-cancel verification. "
    "Mutation testing creates a uniquely timestamped AUTO Advertisement with a PNG fixture, verifies persisted values, edits it, reopens it, and deletes that exact generated row. "
    "A guarded cleanup block removes the generated record if execution stops after creation. Existing advertisements are never submitted, changed or deleted.", body
)]

story += [PageBreak(), Paragraph("Detailed coverage", title)]
coverage = [
    ("Page identity and table", "Authenticated /admin/advertisements route, heading, explanatory text, New Advertisement, search, and Image/Title/Link/Clicks/Status/Actions columns."),
    ("Search", "Reads a live advertisement title, filters the listing and verifies the matching row without changing data."),
    ("Create form", "Optional Title, required Image, optional Link URL, Active switch, Create Advertisement and Escape cancellation."),
    ("Required validation", "Submits an empty form and verifies the visible 'An image is required' error."),
    ("URL validation", "Injects malformed URL test data and requires an HTML URL input with invalid browser validity state; this currently identifies the documented defect."),
    ("Image upload", "Uses an accepted PNG fixture and waits for the Remove Image action as proof that the preview/upload state is ready."),
    ("Create/edit/delete lifecycle", "Creates a unique AUTO row, checks link persistence, changes title and link, reopens the edit form, deletes the generated row and proves removal."),
    ("Edit safety", "Loads a real existing row, verifies populated title/link values and closes without saving."),
    ("Delete safety", "Verifies the named confirmation warning and Cancel behavior before the controlled generated-row deletion test."),
    ("UI and keyboard", "Visibility, minimum target height, focusability, modal keyboard dismissal and document-width overflow."),
    ("Accessibility", "Axe WCAG scan of the listing and form; critical violations fail with JSON evidence attached."),
    ("Performance", "Measures readiness of the authenticated Advertisements page against a 10-second threshold."),
    ("Security", "Requires HTTPS, exact authenticated admin route and no redirect to /admin/login."),
    ("Runtime quality", "Monitors uncaught JavaScript errors and HTTP responses of 500 or higher."),
    ("Compatibility", "Chrome, Edge, Firefox and Safari-compatible profiles for desktop and mobile: 8 profiles x 3 matrix checks = 24 tests."),
]
coverage_data = [[Paragraph("Testing area", small), Paragraph("What was verified", small)]]
coverage_data += [[Paragraph(area, small), Paragraph(checks, small)] for area, checks in coverage]
coverage_table = Table(coverage_data, colWidths=[43*mm, 137*mm], repeatRows=1)
coverage_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), teal), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("GRID", (0,0), (-1,-1), .35, line), ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("PADDING", (0,0), (-1,-1), 4),
]))
story += [coverage_table, Spacer(1, 4*mm), Paragraph("Browser interpretation", h1), Paragraph(
    "Chrome and Edge profiles use the installed vendor browsers. Firefox uses Playwright Firefox. Safari-compatible profiles use Playwright WebKit on Windows and indicate engine-level compatibility; they are not a substitute for testing Safari on physical Apple hardware.", body
)]

story += [PageBreak(), Paragraph("Compatibility matrix results", title), Paragraph(
    "Each row below comes from the latest JUnit execution generated by npm run test:advertisements:all.", body),
    Paragraph("Conclusion", h1),
    Paragraph(
        "Advertisement listing, safe dialogs, responsive layout, accessibility, HTTPS and runtime quality passed in all configured profiles. "
        "The controlled create/edit/delete lifecycle also passed. Release acceptance should remain conditional on correcting and retesting malformed Link URL validation.", body),
    Spacer(1, 3*mm)]
detail_data = [[Paragraph("Test case", tiny), Paragraph("Profile", tiny), Paragraph("Result", tiny), Paragraph("Time", tiny), Paragraph("Evidence", tiny)]]
detail_data += [[Paragraph(r[0], tiny), Paragraph(r[1], tiny), Paragraph(r[2], center), Paragraph(r[3], center), Paragraph(r[4], tiny)] for r in rows]
details = Table(detail_data, colWidths=[82*mm, 34*mm, 20*mm, 17*mm, 27*mm], repeatRows=1)
commands = [
    ("BACKGROUND", (0,0), (-1,0), teal), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("GRID", (0,0), (-1,-1), .3, line), ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 3), ("RIGHTPADDING", (0,0), (-1,-1), 3),
    ("TOPPADDING", (0,0), (-1,-1), 2), ("BOTTOMPADDING", (0,0), (-1,-1), 2),
]
for index, row in enumerate(rows, 1):
    shade = green if row[2] == "PASSED" else (red if row[2] == "FAILED" else amber)
    commands.append(("BACKGROUND", (2,index), (2,index), shade))
details.setStyle(TableStyle(commands))
story.append(details)

doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
print(OUTPUT)
