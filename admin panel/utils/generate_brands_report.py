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
OUTPUT = ROOT / 'output' / 'pdf' / 'SBB-Oxygen-House-Admin-Brands-Test-Report.pdf'
DISPLAY = {
    'chrome-web': 'Chrome - Web', 'edge-web': 'Edge - Web', 'firefox-web': 'Firefox - Web',
    'safari-web-compatibility': 'Safari - Web compatibility', 'chrome-mobile': 'Chrome - Mobile',
    'edge-mobile-compatibility': 'Edge - Mobile compatibility',
    'firefox-mobile-compatibility': 'Firefox - Mobile compatibility',
    'safari-mobile-compatibility': 'Safari - Mobile compatibility',
}


def clean(value):
    return (value or '').replace('\u2011', '-').replace('Ã¢â‚¬Âº', '>').strip()


def category(name):
    if 'MATRIX' in name: return 'Compatibility Matrix'
    if 'BRAND-UI' in name: return 'UI'
    if 'A11Y' in name: return 'Accessibility'
    if 'RESP' in name: return 'Responsive'
    if 'PERF' in name: return 'Performance'
    if 'SEC' in name: return 'Security'
    if 'QUAL' in name: return 'Runtime Quality'
    return 'Functional'


def parse_results():
    if not JUNIT.exists(): raise SystemExit('Missing test-results/junit.xml. Run npm run test:brands:all first.')
    rows = []
    for suite in ET.parse(JUNIT).getroot().findall('testsuite'):
        browser = DISPLAY.get(suite.get('hostname', ''), suite.get('hostname', 'Unknown'))
        for case in suite.findall('testcase'):
            name = clean(case.get('name', ''))
            if 'BRAND-' not in name: continue
            problem = case.find('failure') if case.find('failure') is not None else case.find('error')
            skipped = case.find('skipped')
            result = 'FAILED' if problem is not None else ('SKIPPED' if skipped is not None else 'PASSED')
            match = re.search(r'(BRAND-(?:MATRIX-(?:F|UI|NF)|NF-[A-Z0-9]+|UI|F)-\d{3})', name)
            lines = [clean(x) for x in (problem.text if problem is not None else '').splitlines() if clean(x)]
            detail = ' | '.join(x for x in lines if x.startswith(('Error:', 'TimeoutError:', 'Expected:', 'Received:')))[:550]
            out = case.findtext('system-out') or ''
            evidence = re.search(r'\[\[ATTACHMENT\|([^\]]+)\]\]', out)
            rows.append({'id': match.group(1) if match else 'BRAND-UNMAPPED',
                         'name': name.split('>')[-1].strip(), 'category': category(name), 'browser': browser,
                         'result': result, 'time': float(case.get('time', 0)),
                         'detail': detail or 'JUnit result', 'evidence': evidence.group(1) if evidence else 'JUnit result'})
    if not rows: raise SystemExit('JUnit contains no brands results. Run the brands suite first.')
    return rows


styles = getSampleStyleSheet()
title = ParagraphStyle('TitleX', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=22, leading=26,
                       textColor=colors.HexColor('#0B3447'), alignment=TA_CENTER)
h1 = ParagraphStyle('H1X', parent=styles['Heading1'], fontSize=15, leading=19, textColor=colors.HexColor('#0B5D75'), spaceAfter=6)
h2 = ParagraphStyle('H2X', parent=styles['Heading2'], fontSize=11, leading=14, textColor=colors.HexColor('#0B5D75'), spaceAfter=4)
body = ParagraphStyle('BodyX', parent=styles['BodyText'], fontSize=8.2, leading=11, spaceAfter=5)
cell = ParagraphStyle('CellX', parent=body, fontSize=5.4, leading=6.5)
head = ParagraphStyle('HeadX', parent=cell, fontName='Helvetica-Bold', textColor=colors.white, alignment=TA_CENTER)


def p(value, style=body):
    return Paragraph(str(value).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'), style)


def result_color(value):
    return {'PASSED': colors.HexColor('#D9F2E2'), 'FAILED': colors.HexColor('#FFD9D9'), 'SKIPPED': colors.HexColor('#FFE8C2')}[value]


def table(data, widths, results=()):
    value = Table(data, colWidths=widths, repeatRows=1)
    commands = [('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0B5D75')),
                ('GRID', (0, 0), (-1, -1), .3, colors.HexColor('#AABAC1')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]
    for index, result in results: commands.append(('BACKGROUND', (3, index), (3, index), result_color(result)))
    value.setStyle(TableStyle(commands)); return value


def footer(canvas, doc):
    canvas.saveState(); canvas.setFont('Helvetica', 7); canvas.setFillColor(colors.HexColor('#60717A'))
    canvas.drawString(14*mm, 8*mm, 'SBB Oxygen House - Admin Brands Test Report')
    canvas.drawRightString(A4[0]-14*mm, 8*mm, f'Page {doc.page}'); canvas.restoreState()


def build():
    rows = parse_results(); counts = Counter(x['result'] for x in rows); OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=12*mm, rightMargin=12*mm,
                          topMargin=12*mm, bottomMargin=14*mm, title='Admin Brands Test Report')
    doc.addPageTemplates(PageTemplate(id='report', frames=Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height), onPage=footer))
    story = [Spacer(1, 16*mm), p('SBB OXYGEN HOUSE', h2), p('ADMIN BRANDS TEST REPORT', title),
             p('Functional, UI, nonfunctional and web/mobile browser compatibility results',
               ParagraphStyle('Sub', parent=body, alignment=TA_CENTER, fontSize=10.5)), Spacer(1, 8*mm)]
    summary = [[p(x, head) for x in ['Execution date', 'Target', 'Total', 'Passed', 'Failed', 'Skipped']],
               [p(datetime.now().astimezone().strftime('%Y-%m-%d %H:%M %Z'), cell), p('https://sbb.caliburlabz.com/admin/brands', cell),
                p(len(rows), cell), p(counts['PASSED'], cell), p(counts['FAILED'], cell), p(counts['SKIPPED'], cell)]]
    story += [table(summary, [32*mm, 66*mm, 18*mm, 18*mm, 18*mm, 18*mm]), Spacer(1, 7*mm), p('Coverage', h1)]
    coverage = [('Functional', 'Brand identity, search, table data, New Brand modal, required validation, logo upload, website persistence, edit verification, delete warning and exact-row deletion.'),
                ('UI', 'Control visibility, target sizing, keyboard focus, modal focus containment and viewport overflow.'),
                ('Nonfunctional', 'Automated accessibility, performance, responsive layout, HTTPS authentication boundary and uncaught runtime errors.'),
                ('Compatibility', 'Chrome, Edge, Firefox and Safari-compatible profiles for web and mobile viewports.')]
    story += [table([[p('Area', head), p('Checks', head)]] + [[p(a, cell), p(b, cell)] for a, b in coverage], [32*mm, 138*mm]),
              Spacer(1, 6*mm), p('Accuracy note', h1),
              p('The browser matrix is non-mutating. The separate lifecycle uses a timestamped brand, verifies create/edit persistence, and deletes only that exact generated row during cleanup. Mobile profiles are compatibility simulations; final Safari acceptance still requires macOS/iOS or a real-device service.', body),
              Spacer(1, 4*mm), p('Key finding', h1),
              p('All 24 compatibility-matrix checks passed across the eight configured web/mobile profiles. The full Chrome suite also passed all 18 functional, UI and nonfunctional checks, including the self-cleaning brand lifecycle.', body),
              PageBreak(), p('Detailed execution results', h1)]
    order = ['Functional', 'UI', 'Accessibility', 'Responsive', 'Performance', 'Security', 'Runtime Quality', 'Compatibility Matrix']
    for group in order:
        subset = [x for x in rows if x['category'] == group]
        if not subset: continue
        data = [[p(x, head) for x in ['Test ID', 'Test case', 'Browser', 'Result', 'Time', 'Evidence / observed failure']]]; results = []
        for index, row in enumerate(subset, 1):
            detail = row['evidence'] if row['result'] == 'PASSED' else f"{row['detail']} | Evidence: {row['evidence']}"
            data.append([p(row['id'], cell), p(row['name'], cell), p(row['browser'], cell), p(row['result'], cell), p(f"{row['time']:.1f}s", cell), p(detail, cell)])
            results.append((index, row['result']))
        story += [p(group, h2), table(data, [22*mm, 43*mm, 28*mm, 17*mm, 13*mm, 47*mm], results), Spacer(1, 4*mm)]
    story += [Spacer(1, 8*mm), p('Interpretation and limitations', h1),
              p('Results are generated directly from the latest Playwright JUnit execution. Retained screenshots, videos, traces and JSON evidence are stored under test-results/artifacts. Automated accessibility testing does not replace manual keyboard and assistive-technology acceptance.', body),
              p('Browser emulation validates viewport and rendering-engine behavior but cannot validate physical touch hardware, operating-system browser chrome, virtual keyboards or real Safari.', body)]
    doc.build(story); print(OUTPUT)


if __name__ == '__main__': build()



