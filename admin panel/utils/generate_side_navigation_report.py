from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
JUNIT = ROOT / 'test-results' / 'junit.xml'
OUTPUT = ROOT / 'output' / 'pdf' / 'SBB-Oxygen-House-Admin-Side-Navigation-Test-Report.pdf'
TARGET = 'https://sbb.caliburlabz.com/admin'

DISPLAY = {
    'chrome-web': 'Chrome - Web', 'edge-web': 'Edge - Web',
    'firefox-web': 'Firefox - Web', 'safari-web-compatibility': 'Safari - Web compatibility',
    'chrome-mobile': 'Chrome - Mobile', 'edge-mobile-compatibility': 'Edge - Mobile compatibility',
    'firefox-mobile-compatibility': 'Firefox - Mobile compatibility',
    'safari-mobile-compatibility': 'Safari - Mobile compatibility',
}

ROUTES = [
    ('Dashboard', '/admin'), ('Products', '/admin/products'), ('Categories', '/admin/categories'),
    ('Brands', '/admin/brands'), ('Orders', '/admin/orders'), ('Coupons', '/admin/coupons'),
    ('Shipping', '/admin/shipping'), ('Advertisements', '/admin/advertisements'),
    ('Reviews', '/admin/reviews'), ('Contact Messages', '/admin/contact'),
    ('Inventory', '/admin/inventory'), ('Settings', '/admin/settings'),
    ('Account & Access', '/admin/users'),
]


def clean(value: str) -> str:
    return (value or '').replace('\u2011', '-').replace('â€º', '>').strip()


def category(name: str) -> str:
    if 'MATRIX' in name: return 'Compatibility Matrix'
    if 'SIDENAV-UI' in name: return 'UI'
    if 'A11Y' in name: return 'Accessibility'
    if 'RESP' in name: return 'Responsive'
    if 'SEC' in name: return 'Security'
    if 'QUAL' in name: return 'Runtime Quality'
    return 'Functional'


def short_error(text: str) -> str:
    lines = [clean(line) for line in (text or '').splitlines() if clean(line)]
    useful = [line for line in lines if line.startswith(('Error:', 'Expected:', 'Received:', 'Locator:', 'TimeoutError:'))]
    return ' | '.join(useful[:3])[:600] or 'Assertion failed; inspect retained Playwright evidence.'


def parse_results():
    if not JUNIT.exists():
        raise SystemExit(f'Missing {JUNIT}. Run npm run test:side-navigation:all first.')
    rows = []
    root = ET.parse(JUNIT).getroot()
    for suite in root.findall('testsuite'):
        browser = DISPLAY.get(suite.get('hostname', ''), suite.get('hostname', 'Unknown'))
        for case in suite.findall('testcase'):
            full_name = clean(case.get('name', ''))
            if 'SIDENAV-' not in full_name:
                continue
            problem = case.find('failure') if case.find('failure') is not None else case.find('error')
            skipped = case.find('skipped')
            result = 'FAILED' if problem is not None else ('SKIPPED' if skipped is not None else 'PASSED')
            match = re.search(r'(SIDENAV-(?:MATRIX-(?:NF|UI|F)|NF-[A-Z0-9]+|UI|F)-\d{3})', full_name)
            out = case.findtext('system-out') or ''
            evidence = re.search(r'\[\[ATTACHMENT\|([^\]]+)\]\]', out)
            rows.append({
                'id': match.group(1) if match else 'SIDENAV-UNMAPPED',
                'name': full_name.split('>')[-1].strip(), 'category': category(full_name),
                'browser': browser, 'result': result, 'duration': float(case.get('time', 0)),
                'detail': short_error(problem.text if problem is not None else ''),
                'evidence': evidence.group(1) if evidence else 'JUnit result',
            })
    if not rows:
        raise SystemExit('JUnit contains no side-navigation results. Run the side-navigation suite first.')
    return rows


styles = getSampleStyleSheet()
title = ParagraphStyle('TitleX', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=24,
                       leading=29, textColor=colors.HexColor('#0B3447'), alignment=TA_CENTER)
h1 = ParagraphStyle('H1X', parent=styles['Heading1'], fontSize=15, leading=19,
                    textColor=colors.HexColor('#0B5D75'), spaceBefore=7, spaceAfter=6)
h2 = ParagraphStyle('H2X', parent=styles['Heading2'], fontSize=11, leading=14,
                    textColor=colors.HexColor('#0B5D75'), spaceBefore=5, spaceAfter=4)
body = ParagraphStyle('BodyX', parent=styles['BodyText'], fontSize=8.2, leading=10.8, spaceAfter=5)
cell = ParagraphStyle('CellX', parent=body, fontSize=5.4, leading=6.5)
head = ParagraphStyle('HeadX', parent=cell, fontName='Helvetica-Bold', textColor=colors.white, alignment=TA_CENTER)


def p(value, style=body):
    safe = str(value).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return Paragraph(safe, style)


def result_color(value):
    return {'PASSED': colors.HexColor('#D9F2E2'), 'FAILED': colors.HexColor('#FFD9D9'),
            'SKIPPED': colors.HexColor('#FFE8C2')}[value]


def header_footer(canvas, doc):
    canvas.saveState(); canvas.setFillColor(colors.HexColor('#60717A')); canvas.setFont('Helvetica', 7)
    canvas.drawString(14 * mm, 8 * mm, 'SBB Oxygen House - Admin Side Navigation Test Report')
    canvas.drawRightString(A4[0] - 14 * mm, 8 * mm, f'Page {doc.page}'); canvas.restoreState()


def styled_table(data, widths, result_rows=None):
    table = Table(data, colWidths=widths, repeatRows=1)
    commands = [('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0B5D75')),
                ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#AABAC1')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]
    for row_index, result in result_rows or []:
        commands.append(('BACKGROUND', (3, row_index), (3, row_index), result_color(result)))
    table.setStyle(TableStyle(commands)); return table


def build():
    rows = parse_results(); counts = Counter(row['result'] for row in rows)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=12*mm, rightMargin=12*mm,
                          topMargin=12*mm, bottomMargin=14*mm, title='Admin Side Navigation Test Report')
    doc.addPageTemplates(PageTemplate(id='report', frames=Frame(doc.leftMargin, doc.bottomMargin,
                          doc.width, doc.height, id='normal'), onPage=header_footer))
    story = [Spacer(1, 13*mm), p('SBB OXYGEN HOUSE', h2), p('ADMIN SIDE NAVIGATION TEST REPORT', title),
             p('Functional, UI, nonfunctional and web/mobile browser compatibility results',
               ParagraphStyle('Sub', parent=body, alignment=TA_CENTER, fontSize=10.5)), Spacer(1, 7*mm)]
    summary = [[p(x, head) for x in ['Execution date', 'Target', 'Total', 'Passed', 'Failed', 'Skipped']],
               [p(datetime.now().astimezone().strftime('%Y-%m-%d %H:%M %Z'), cell), p(TARGET, cell),
                p(len(rows), cell), p(counts['PASSED'], cell), p(counts['FAILED'], cell), p(counts['SKIPPED'], cell)]]
    story += [styled_table(summary, [32*mm, 66*mm, 18*mm, 18*mm, 18*mm, 18*mm]), Spacer(1, 6*mm),
              p('Scope and method', h1),
              p('The suite verifies the top-left SBB Oxygen House / ADMIN identity, navigation groups, exact link targets, page access, keyboard behavior, target sizing, clipping, responsive drawer scrolling, HTTPS authentication boundaries, automated WCAG checks and uncaught page errors.', body),
              p('Browser scope', h1),
              p('Configured profiles cover Chrome, Edge, Firefox and Safari-compatible engines on web and mobile viewports. Chrome and Edge web use installed vendor browsers. Mobile profiles are compatibility simulations. Final Safari acceptance must still be performed on macOS/iOS hardware or a real-device service.', body),
              p('Navigation routes under test', h1)]
    route_data = [[p('Label', head), p('Expected URL', head)]] + [[p(label, cell), p(TARGET.split('/admin')[0] + path, cell)] for label, path in ROUTES]
    story += [styled_table(route_data, [42*mm, 128*mm]), PageBreak(), p('Detailed execution results', h1)]
    for cat in ['Functional', 'UI', 'Accessibility', 'Responsive', 'Security', 'Runtime Quality', 'Compatibility Matrix']:
        subset = [row for row in rows if row['category'] == cat]
        if not subset: continue
        data = [[p(x, head) for x in ['Test ID', 'Test case', 'Browser', 'Result', 'Time', 'Evidence / observed failure']]]
        result_rows = []
        for index, row in enumerate(subset, 1):
            detail = row['evidence'] if row['result'] == 'PASSED' else f"{row['detail']} | Evidence: {row['evidence']}"
            data.append([p(row['id'], cell), p(row['name'], cell), p(row['browser'], cell),
                         p(row['result'], cell), p(f"{row['duration']:.1f}s", cell), p(detail, cell)])
            result_rows.append((index, row['result']))
        story += [p(cat, h2), styled_table(data, [22*mm, 43*mm, 28*mm, 17*mm, 13*mm, 47*mm], result_rows), Spacer(1, 4*mm)]
    story += [Spacer(1, 6*mm), p('Result interpretation and limitations', h1),
              p('Results are read directly from the latest Playwright JUnit file. Failed checks describe what was not observed in that execution and link to retained evidence when available. Screenshots, videos and traces are stored under test-results/artifacts.', body),
              p('Browser emulation validates viewport and engine behavior but does not replace physical-device testing for operating-system browser chrome, touch hardware, virtual keyboards, assistive technologies or real Safari. The report intentionally excludes credentials and session data.', body)]
    doc.build(story); print(OUTPUT)


if __name__ == '__main__':
    build()
