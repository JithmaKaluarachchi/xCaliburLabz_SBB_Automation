from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "SBB-Oxygen-House-Developer-Bug-Register.pdf"


BUGS = [
    ("BUG-001", "Home", "Page quality / API requests", "Homepage records failed same-origin requests",
     "The homepage quality check detected failed requests to the same production origin in Firefox, WebKit and Mobile Safari.",
     "1. Open the production homepage. 2. Start monitoring page errors and failed same-origin responses. 3. Wait for initial content and lazy-loaded sections. 4. Review failed responses.",
     "The homepage should complete without uncaught page errors or failed same-origin requests.",
     "One or more same-origin requests failed during the recorded runs.", "Medium",
     "Homepage report - Issues 1, 3 and 13; Firefox, WebKit, Mobile Safari; Playwright traces/screenshots in test-results/artifacts when retained."),
    ("BUG-002", "Home", "Content images", "Homepage images do not complete loading reliably",
     "The image-loading check timed out with incomplete images in WebKit and Mobile Safari.",
     "1. Open the homepage in WebKit or Mobile Safari. 2. Scroll through all content sections. 3. Wait for every content image to report complete. 4. Inspect remaining incomplete images.",
     "Every displayed content image should finish loading and provide alternative text.",
     "Images remained incomplete until the automated wait expired.", "Medium",
     "Homepage report - Issues 2 and 12; WebKit and Mobile Safari; failure screenshots/traces referenced by the HTML report."),
    ("BUG-003", "Home", "Product cards", "Product image does not open its matching detail page",
     "A homepage product-picture navigation check timed out in WebKit.",
     "1. Open the homepage in WebKit. 2. Scroll to the product carousel. 3. Select each visible product image. 4. Compare the opened route with the selected product.",
     "Each product image should open the corresponding valid product-detail route.",
     "At least one product-image action did not reach the expected detail page before timeout.", "High",
     "Homepage report - Issue 4; WebKit; Playwright trace and screenshot referenced in the report evidence."),
    ("BUG-004", "Home", "Mobile header", "Required header controls are missing or unusable on mobile",
     "The header-content assertion failed on Mobile Chrome and Mobile Safari.",
     "1. Open the homepage using Pixel 7 or iPhone 15 viewport. 2. Inspect the header. 3. Verify logo, contact, cart and navigation controls. 4. Attempt normal interaction.",
     "All required mobile header controls should be present, visible and usable.",
     "The expected header-control state was not satisfied in both mobile profiles.", "High",
     "Homepage report - Issues 5 and 9; Mobile Chrome and Mobile Safari."),
    ("BUG-005", "Home", "Shop navigation", "Shop navigation does not reliably reach the Shop page on mobile",
     "Clicking Shop did not satisfy the expected route assertion in Mobile Chrome and Mobile Safari.",
     "1. Open the homepage on a mobile profile. 2. Expose the navigation if required. 3. Select Shop. 4. Observe the resulting URL and page.",
     "Selecting Shop should navigate to the production Shop route and load its content.",
     "The expected Shop destination was not reached within the recorded check.", "High",
     "Homepage report - Issues 6 and 10; Mobile Chrome and Mobile Safari."),
    ("BUG-006", "Home", "Mobile navigation menu", "Mobile navigation does not open, expose links and close correctly",
     "The complete mobile-menu behavior check failed in Mobile Chrome and Mobile Safari.",
     "1. Open the homepage on a mobile profile. 2. Activate the menu control. 3. Verify navigation links. 4. Close the menu. 5. Confirm its final state.",
     "The menu should open, expose usable links and close without leaving an incorrect state.",
     "The expected open/link/close state sequence was not completed.", "High",
     "Homepage report - Issues 7 and 11; Mobile Chrome and Mobile Safari."),
    ("BUG-007", "Home", "Hero and section CTAs", "Homepage CTA navigation times out on mobile",
     "Hero or section CTA navigation exceeded the expected completion time in Mobile Chrome and Mobile Safari.",
     "1. Open the homepage on a mobile profile. 2. Select each hero and section CTA. 3. Record its final route. 4. Repeat after returning to Home.",
     "Every CTA should navigate to its configured destination within the allowed time.",
     "At least one CTA navigation exceeded the timeout in both mobile profiles.", "High",
     "Homepage report - Issues 8 and 14; Mobile Chrome and Mobile Safari."),
    ("BUG-008", "Shop", "Sorting", "A Shop sort option does not complete in Firefox",
     "Exercising every available sort option exceeded the locator/action timeout in Firefox.",
     "1. Open Shop in Firefox. 2. Open the sort control. 3. Select each available option in sequence. 4. Observe product ordering and control completion.",
     "Every sort option should apply successfully and leave a usable, correctly ordered product list.",
     "At least one sort option exceeded the 10-second action timeout.", "Medium",
     "Shop report - BUG section item 1 and Failed test cases; Firefox."),
    ("BUG-009", "Shop", "Category / brand / price filters", "Shop filters time out on mobile browsers",
     "The combined category, brand and price filtering check timed out in Mobile Chrome and Mobile Safari.",
     "1. Open Shop on a mobile profile. 2. Apply category, brand and price filters individually. 3. Clear each filter. 4. Verify the product grid after every change.",
     "Each filter should update the product list and remain responsive on mobile.",
     "The filtering sequence exceeded the 10-second action timeout in both mobile profiles.", "High",
     "Shop report - BUG section items 2 and 3 and Failed test cases; Mobile Chrome and Mobile Safari."),
    ("BUG-010", "All Gases & Equipments", "Primary action keyboard navigation", "Primary service actions are not keyboard reachable in Safari engines",
     "The Request a Quote and Call Us actions were not reached through keyboard traversal in WebKit and Mobile Safari.",
     "1. Open All Gases & Equipments in WebKit. 2. Use Tab from the top of the page. 3. Record focused control names. 4. Repeat using Mobile Safari emulation.",
     "Request a Quote and Call Us should enter the keyboard focus order and show visible focus.",
     "Neither expected action was recorded in the keyboard focus sequence.", "High",
     "Services report - Failed test cases; WebKit and Mobile Safari."),
    ("BUG-011", "Ship Handling", "Primary action keyboard navigation", "Primary service actions are not keyboard reachable in Safari engines",
     "The Request a Quote and Call Us actions were not reached through keyboard traversal in WebKit and Mobile Safari.",
     "1. Open Ship Handling in WebKit. 2. Use Tab from the top of the page. 3. Record focused control names. 4. Repeat using Mobile Safari emulation.",
     "Request a Quote and Call Us should enter the keyboard focus order and show visible focus.",
     "Neither expected action was recorded in the keyboard focus sequence.", "High",
     "Services report - Failed test cases; WebKit and Mobile Safari."),
    ("BUG-012", "About Us", "Primary action keyboard navigation", "About Us primary actions are not keyboard reachable in Safari engines",
     "Primary About Us actions failed the keyboard-reachability check in WebKit and Mobile Safari.",
     "1. Open About Us in WebKit. 2. Traverse interactive elements using Tab. 3. Verify Browse Products, Our Services, Contact Us and Call Us. 4. Repeat in Mobile Safari.",
     "All primary actions should be reachable in a logical order with visible focus.",
     "The complete expected action set was not reached in the Safari-engine profiles.", "High",
     "About Us report - Failed test cases; WebKit and Mobile Safari."),
    ("BUG-013", "About Us", "Navigation performance", "About Us exceeds the mobile navigation budget",
     "The Mobile Safari performance check exceeded the configured DOM-content-loaded or page-load threshold after retry.",
     "1. Open About Us using the Mobile Safari profile. 2. Capture Navigation Timing values. 3. Compare DOMContentLoaded with 5,000 ms and load with 8,000 ms. 4. Repeat from a clean context.",
     "DOMContentLoaded should be below 5 seconds and full load below 8 seconds under the test conditions.",
     "The recorded navigation timing exceeded the configured budget.", "Medium",
     "About Us report - Failed test cases; Mobile Safari; navigation-timing attachment in Playwright evidence."),
    ("BUG-014", "Contact Us", "Branch map tabs / ARIA", "Branch tabs contain invalid aria-controls ID references",
     "Axe reports critical-impact rule aria-valid-attr-value because branch-tab aria-controls values contain branch names with spaces. This is an assistive-technology defect, not a Safari page-access failure.",
     "1. Open Contact Us. 2. Inspect each branch tab. 3. Run Axe with WCAG 2 A/AA tags. 4. Review aria-controls values such as the Main Branch reference. 5. Compare each value with a valid map-panel element ID.",
     "Every aria-controls value should be a valid ID reference to the controlled map panel and work with assistive technologies.",
     "All five browser profiles report aria-valid-attr-value. Visual access, form operation and map selection otherwise pass.", "High",
     "Contact Us report - Failed test cases and Result interpretation; Chromium, Firefox, WebKit, Mobile Chrome and Mobile Safari; Axe JSON attachment."),
]


def esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build() -> Path:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    navy = colors.HexColor("#0D2538")
    blue = colors.HexColor("#036083")
    line = colors.HexColor("#CFDCE3")
    pale = colors.HexColor("#F3F7F9")
    high = colors.HexColor("#FDE8E6")
    medium = colors.HexColor("#FFF0D6")
    styles = getSampleStyleSheet()
    title = ParagraphStyle("Title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=colors.white, alignment=TA_CENTER)
    subtitle = ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=9, leading=12, textColor=colors.HexColor("#D8EAF2"), alignment=TA_CENTER)
    cell = ParagraphStyle("Cell", parent=styles["Normal"], fontSize=6.2, leading=7.6)
    cell_bold = ParagraphStyle("CellBold", parent=cell, fontName="Helvetica-Bold")
    header = ParagraphStyle("Header", parent=cell, fontName="Helvetica-Bold", textColor=colors.white, alignment=TA_CENTER)
    body = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=9, leading=13)

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(line)
        canvas.line(10 * mm, 9 * mm, 410 * mm, 9 * mm)
        canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.setFont("Helvetica", 7)
        canvas.drawString(10 * mm, 5 * mm, "SBB Oxygen House - Confidential developer bug register")
        canvas.drawRightString(410 * mm, 5 * mm, f"Page {doc.page}")
        canvas.restoreState()

    doc = BaseDocTemplate(str(OUTPUT), pagesize=landscape(A3), leftMargin=10 * mm, rightMargin=10 * mm, topMargin=10 * mm, bottomMargin=13 * mm)
    doc.addPageTemplates(PageTemplate(id="bugs", frames=Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height), onPage=footer))
    now = datetime.now(timezone(timedelta(hours=5, minutes=30), name="Asia/Colombo"))
    story = []
    banner = Table([[Paragraph("SBB Oxygen House - Developer Bug Register", title)], [Paragraph(f"Consolidated from the final cross-browser automation reports - {now:%d %B %Y, %I:%M %p} (Sri Lanka time)", subtitle)]], colWidths=[400 * mm])
    banner.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), navy), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    story += [banner, Spacer(1, 4 * mm), Paragraph(f"This register contains {len(BUGS)} consolidated developer defects. Identical failures across browsers are grouped under one Bug ID; the evidence column lists every affected browser. Severity reflects user impact and remediation priority.", body), Spacer(1, 4 * mm)]

    headings = ["Bug ID", "Page name", "Component", "Title", "Description", "Steps to Reproduce", "Expected Result", "Actual Result", "Severity", "Screenshot / Evidence"]
    data = [[Paragraph(esc(value), header) for value in headings]]
    for row in BUGS:
        data.append([Paragraph(esc(value), cell_bold if index in (0, 8) else cell) for index, value in enumerate(row)])
    widths = [14, 27, 30, 45, 54, 64, 53, 55, 19, 39]
    table = Table(data, colWidths=[value * mm for value in widths], repeatRows=1)
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), blue), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("GRID", (0, 0), (-1, -1), 0.35, line),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    for index, row in enumerate(BUGS, 1):
        commands.append(("BACKGROUND", (0, index), (-1, index), colors.white if index % 2 else pale))
        commands.append(("BACKGROUND", (8, index), (8, index), high if row[8] == "High" else medium))
        commands.append(("TEXTCOLOR", (8, index), (8, index), colors.HexColor("#A12622") if row[8] == "High" else colors.HexColor("#9A5A00")))
        commands.append(("ALIGN", (0, index), (0, index), "CENTER"))
        commands.append(("ALIGN", (8, index), (8, index), "CENTER"))
    table.setStyle(TableStyle(commands))
    story.append(table)
    doc.build(story)
    return OUTPUT


if __name__ == "__main__":
    print(build())
