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
OUTPUT = ROOT / 'output' / 'pdf' / 'SBB-Oxygen-House-Admin-Orders-Test-Report.pdf'
DISPLAY = {
    'chrome-web': 'Chrome - Web', 'edge-web': 'Edge - Web', 'firefox-web': 'Firefox - Web',
    'safari-web-compatibility': 'Safari - Web compatibility', 'chrome-mobile': 'Chrome - Mobile',
    'edge-mobile-compatibility': 'Edge - Mobile compatibility',
    'firefox-mobile-compatibility': 'Firefox - Mobile compatibility',
    'safari-mobile-compatibility': 'Safari - Mobile compatibility',
}


def clean(value):
    return (value or '').replace('\u2011', '-').strip()


def parse_results():
    if not JUNIT.exists():
        raise SystemExit('Missing test-results/junit.xml. Run npm run test:orders:all first.')
    rows = []
    for suite in ET.parse(JUNIT).getroot().findall('testsuite'):
        browser = DISPLAY.get(suite.get('hostname', ''), suite.get('hostname', 'Unknown'))
        for case in suite.findall('testcase'):
            name = clean(case.get('name', ''))
            if 'ORDER-' not in name:
                continue
            problem = case.find('failure') if case.find('failure') is not None else case.find('error')
            skipped = case.find('skipped')
            result = 'FAILED' if problem is not None else ('SKIPPED' if skipped is not None else 'PASSED')
            match = re.search(r'(ORDER-(?:MATRIX-(?:F|UI|NF)|DETAIL-F|NF-[A-Z0-9]+|UI|F)-\d{3})', name)
            raw = clean(problem.text if problem is not None else '')
            finding = 'JUnit result'
            if result == 'FAILED' and 'button-name' in raw:
                finding = 'Critical WCAG button-name violation: order combobox controls lack accessible names.'
            elif result == 'FAILED':
                finding = next((line for line in raw.splitlines() if line.startswith(('Error:', 'TimeoutError:'))), 'See retained evidence.')
            rows.append({
                'id': match.group(1) if match else 'ORDER-UNMAPPED',
                'name': name.split('>')[-1].strip(), 'browser': browser, 'result': result,
                'time': float(case.get('time', 0)), 'finding': finding,
            })
    if not rows:
        raise SystemExit('JUnit contains no Orders results. Run the Orders suite first.')
    return rows


styles = getSampleStyleSheet()
title = ParagraphStyle('TitleX', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#0B3447'), alignment=TA_CENTER)
h1 = ParagraphStyle('H1X', parent=styles['Heading1'], fontSize=15, leading=19, textColor=colors.HexColor('#0B5D75'), spaceAfter=6)
h2 = ParagraphStyle('H2X', parent=styles['Heading2'], fontSize=11, leading=14, textColor=colors.HexColor('#0B5D75'), spaceAfter=4)
body = ParagraphStyle('BodyX', parent=styles['BodyText'], fontSize=8.2, leading=11, spaceAfter=5)
cell = ParagraphStyle('CellX', parent=body, fontSize=5.7, leading=6.8)
head = ParagraphStyle('HeadX', parent=cell, fontName='Helvetica-Bold', textColor=colors.white, alignment=TA_CENTER)


def p(value, style=body):
    return Paragraph(str(value).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'), style)


def make_table(data, widths, results=()):
    value = Table(data, colWidths=widths, repeatRows=1)
    commands = [('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0B5D75')), ('GRID', (0, 0), (-1, -1), .3, colors.HexColor('#AABAC1')), ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]
    palette = {'PASSED': '#D9F2E2', 'FAILED': '#FFD9D9', 'SKIPPED': '#FFE8C2'}
    for index, result in results:
        commands.append(('BACKGROUND', (3, index), (3, index), colors.HexColor(palette[result])))
    value.setStyle(TableStyle(commands))
    return value


def footer(canvas, doc):
    canvas.saveState(); canvas.setFont('Helvetica', 7); canvas.setFillColor(colors.HexColor('#60717A'))
    canvas.drawString(14 * mm, 8 * mm, 'SBB Oxygen House - Admin Orders Test Report')
    canvas.drawRightString(A4[0] - 14 * mm, 8 * mm, f'Page {doc.page}'); canvas.restoreState()


def build():
    rows = parse_results(); counts = Counter(x['result'] for x in rows); OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=12 * mm, rightMargin=12 * mm, topMargin=12 * mm, bottomMargin=14 * mm, title='Admin Orders Test Report')
    doc.addPageTemplates(PageTemplate(id='report', frames=Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height), onPage=footer))
    story = [Spacer(1, 14 * mm), p('SBB OXYGEN HOUSE', h2), p('ADMIN ORDERS TEST REPORT', title), p('Functional, UI, nonfunctional and web/mobile browser compatibility results', ParagraphStyle('Sub', parent=body, alignment=TA_CENTER, fontSize=10.5)), Spacer(1, 8 * mm)]
    summary = [[p(x, head) for x in ['Execution date', 'Target', 'Total', 'Passed', 'Failed', 'Skipped']], [p(datetime.now().astimezone().strftime('%Y-%m-%d %H:%M %Z'), cell), p('https://sbb.caliburlabz.com/admin/orders', cell), p(len(rows), cell), p(counts['PASSED'], cell), p(counts['FAILED'], cell), p(counts['SKIPPED'], cell)]]
    story += [make_table(summary, [32 * mm, 66 * mm, 18 * mm, 18 * mm, 18 * mm, 18 * mm]), Spacer(1, 7 * mm), p('Coverage', h1)]
    coverage = [('Functional', 'List, live read-only search data, status/payment/date filters, row controls, details navigation, totals, customer/shipping, timeline, status/payment validation and invoice availability.'), ('UI', 'Visibility, focus, control sizing, confirmation safety and viewport overflow.'), ('Nonfunctional', 'Accessibility, responsive layout, performance, HTTPS authentication, server responses and runtime errors.'), ('Compatibility', 'Chrome, Edge, Firefox and Safari-compatible profiles for web and mobile viewports.')]
    story += [make_table([[p('Area', head), p('Checks', head)]] + [[p(a, cell), p(b, cell)] for a, b in coverage], [32 * mm, 138 * mm]), Spacer(1, 6 * mm), p('Safety and test data', h1), p('The matrix reads the first available order as test data. It does not submit status or payment changes and always cancels deletion, so customer orders and inventory remain unchanged.', body), Spacer(1, 4 * mm), p('Key finding', h1), p(f"{counts['PASSED']} of {len(rows)} matrix checks passed. The {counts['FAILED']} failures represent the same critical WCAG button-name defect repeated across the eight browser profiles: order combobox controls do not expose accessible names.", body), PageBreak(), p('Detailed compatibility results', h1)]
    data = [[p(x, head) for x in ['Test ID', 'Test case', 'Browser', 'Result', 'Time', 'Evidence / observed failure']]]; result_cells = []
    for index, row in enumerate(rows, 1):
        data.append([p(row['id'], cell), p(row['name'], cell), p(row['browser'], cell), p(row['result'], cell), p(f"{row['time']:.1f}s", cell), p(row['finding'], cell)])
        result_cells.append((index, row['result']))
    story += [make_table(data, [22 * mm, 43 * mm, 28 * mm, 17 * mm, 13 * mm, 47 * mm], result_cells), Spacer(1, 7 * mm), p('Interpretation and limitations', h1), p('Results are generated from the latest Playwright JUnit execution. Screenshots, video, traces and Axe JSON evidence are retained under test-results/artifacts. Automated accessibility checks do not replace manual keyboard and assistive-technology acceptance.', body), p('Safari profiles on Windows are compatibility simulations. Final Safari acceptance requires macOS/iOS or a real-device browser service.', body)]
    doc.build(story)
    print(OUTPUT)


if __name__ == '__main__':
    build()
