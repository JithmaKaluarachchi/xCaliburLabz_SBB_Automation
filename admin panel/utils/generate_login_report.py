from __future__ import annotations

import os
import re
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageTemplate, Paragraph, PageBreak,
    Spacer, Table, TableStyle
)

ROOT = Path(__file__).resolve().parents[1]
JUNIT = ROOT / 'test-results' / 'junit.xml'
OUTPUT = ROOT / 'output' / 'pdf' / 'SBB-Oxygen-House-Admin-Login-Test-Report.pdf'

DISPLAY = {
    'chrome-web': 'Chrome - Web',
    'edge-web': 'Edge - Web',
    'firefox-web': 'Firefox - Web',
    'safari-web-compatibility': 'Safari - Web compatibility',
    'chrome-mobile': 'Chrome - Mobile',
    'edge-mobile-compatibility': 'Edge - Mobile compatibility',
    'firefox-mobile-compatibility': 'Firefox - Mobile compatibility',
    'safari-mobile-compatibility': 'Safari - Mobile compatibility',
}

def clean(value: str) -> str:
    return (value or '').replace('â€º', '>').replace('›', '>').replace('\u2011', '-').strip()

def test_id(name: str) -> str:
    found = re.search(r'(LOGIN-(?:NF-[A-Z0-9]+|UI|F)-\d{3})', name)
    return found.group(1) if found else 'LOGIN-UNMAPPED'

def category(name: str) -> str:
    if 'LOGIN-UI-' in name: return 'UI'
    if 'A11Y' in name: return 'Accessibility'
    if 'PERF' in name: return 'Performance'
    if 'RESP' in name: return 'Responsive/Compatibility'
    if 'SEC' in name: return 'Security/Privacy'
    if 'QUAL' in name: return 'Runtime Quality'
    return 'Functional'

def short_error(text: str) -> str:
    lines = [clean(x) for x in (text or '').splitlines() if clean(x)]
    useful = [x for x in lines if x.startswith(('Error:', 'Expected:', 'Received:', 'Locator:'))]
    return ' | '.join(useful[:3])[:650] or 'Assertion failed; see retained evidence.'

def parse_results():
    if not JUNIT.exists():
        raise SystemExit(f'Missing {JUNIT}. Run npm run test:login:all first.')
    root = ET.parse(JUNIT).getroot()
    rows = []
    for suite in root.findall('testsuite'):
        browser = DISPLAY.get(suite.get('hostname', ''), suite.get('hostname', 'Unknown'))
        for case in suite.findall('testcase'):
            name = clean(case.get('name', ''))
            failure = case.find('failure')
            error = case.find('error')
            skipped = case.find('skipped')
            problem = failure if failure is not None else error
            result = 'FAILED' if problem is not None else ('SKIPPED' if skipped is not None else 'PASSED')
            out = case.findtext('system-out') or ''
            match = re.search(r'\[\[ATTACHMENT\|([^\]]+\.(?:png|webm|zip))\]\]', out, re.I)
            rows.append({
                'id': test_id(name), 'name': name.split('>')[-1].strip(), 'category': category(name),
                'browser': browser, 'result': result, 'duration': float(case.get('time', 0)),
                'error': short_error(problem.text if problem is not None else ''),
                'evidence': match.group(1) if match else ('JUnit result' if result == 'PASSED' else 'Not generated')
            })
    return rows

styles = getSampleStyleSheet()
title_style = ParagraphStyle('TitleX', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=25, leading=29, textColor=colors.HexColor('#0B3447'), alignment=TA_CENTER, spaceAfter=8)
h1 = ParagraphStyle('H1X', parent=styles['Heading1'], fontSize=16, leading=20, textColor=colors.HexColor('#0B5D75'), spaceBefore=8, spaceAfter=7)
h2 = ParagraphStyle('H2X', parent=styles['Heading2'], fontSize=12, leading=15, textColor=colors.HexColor('#0B5D75'), spaceBefore=5, spaceAfter=4)
body = ParagraphStyle('BodyX', parent=styles['BodyText'], fontSize=8.3, leading=11, spaceAfter=5)
small = ParagraphStyle('SmallX', parent=body, fontSize=6.5, leading=8)
cell = ParagraphStyle('CellX', parent=small, fontSize=5.8, leading=7)
head = ParagraphStyle('HeadX', parent=cell, fontName='Helvetica-Bold', textColor=colors.white, alignment=TA_CENTER)

def p(text, style=body):
    safe = str(text).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return Paragraph(safe, style)

def result_color(result):
    return {'PASSED': colors.HexColor('#D9F2E2'), 'FAILED': colors.HexColor('#FFD9D9'), 'SKIPPED': colors.HexColor('#FFE8C2')}[result]

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor('#60717A')); canvas.setFont('Helvetica', 7)
    canvas.drawString(14 * mm, 8 * mm, 'SBB Oxygen House - Admin Login Test Report')
    canvas.drawRightString(A4[0] - 14 * mm, 8 * mm, f'Page {doc.page}')
    canvas.restoreState()

def build():
    rows = parse_results(); OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    counts = Counter(r['result'] for r in rows); total = len(rows)
    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=12*mm, leftMargin=12*mm, topMargin=12*mm, bottomMargin=14*mm,
                          title='SBB Oxygen House Admin Login Test Report', author='QA Automation')
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')
    doc.addPageTemplates(PageTemplate(id='report', frames=frame, onPage=header_footer))
    story = [Spacer(1, 15*mm), p('SBB OXYGEN HOUSE', h2), p('ADMIN LOGIN TEST REPORT', title_style),
             p('Functional, UI, nonfunctional and browser compatibility results', ParagraphStyle('sub', parent=body, alignment=TA_CENTER, fontSize=11)), Spacer(1, 8*mm)]
    summary = Table([
        [p('Execution date', head), p('Target', head), p('Total', head), p('Passed', head), p('Failed', head), p('Skipped', head)],
        [p(datetime.now().astimezone().strftime('%Y-%m-%d %H:%M %Z'), cell), p('https://sbb.caliburlabz.com/admin/login', cell), p(total, cell), p(counts['PASSED'], cell), p(counts['FAILED'], cell), p(counts['SKIPPED'], cell)]
    ], colWidths=[32*mm, 66*mm, 18*mm, 18*mm, 18*mm, 18*mm])
    summary.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0B5D75')),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#9FB2BA')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('ALIGN',(2,1),(-1,1),'CENTER'),('BACKGROUND',(3,1),(3,1),result_color('PASSED')),('BACKGROUND',(4,1),(4,1),result_color('FAILED')),('BACKGROUND',(5,1),(5,1),result_color('SKIPPED')),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story += [summary, Spacer(1, 8*mm), p('Result legend: PASSED is green, FAILED is red, and SKIPPED is orange.', body),
              p('Accuracy note', h1), p('Results below are generated from the latest JUnit execution file. A failed automated check means the stated expected behavior was not observed in that run; it is not a claim that the whole page was unreachable. The authorised-login test uses environment credentials and never prints them in this report.', body),
              p('Browser scope', h1), p('Chrome and Edge web runs use installed vendor browsers. Firefox uses the Firefox automation build. Mobile entries are device/viewport compatibility profiles. Safari compatibility uses the Safari-like browser engine available on Windows and is not a substitute for final testing in real Safari on macOS/iOS.', body),
              p('Areas tested', h1)]
    coverage = [
        ('Functional', 'Page title and description; fields; HTML semantics; password masking and visibility control; empty, invalid and keyboard submissions; authorised navigation.'),
        ('UI', 'Logo, card, content visibility, control sizing, clipping and keyboard focus order.'),
        ('Accessibility', 'Automated WCAG A/AA scan for critical-impact violations; manual assistive-technology acceptance remains separate.'),
        ('Nonfunctional', 'Responsive overflow, DOM-ready performance threshold, HTTPS/privacy, noindex metadata and uncaught runtime errors.'),
    ]
    cov = Table([[p('Type', head), p('Coverage', head)]] + [[p(a, cell), p(b, cell)] for a,b in coverage], colWidths=[32*mm, 138*mm], repeatRows=1)
    cov.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0B5D75')),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#AABAC1')),('VALIGN',(0,0),(-1,-1),'TOP'),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F2F7F9')]),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
    story += [cov, PageBreak(), p('Detailed results by subsection', h1)]
    for cat in ['Functional','UI','Accessibility','Responsive/Compatibility','Performance','Security/Privacy','Runtime Quality']:
        subset = [r for r in rows if r['category'] == cat]
        if not subset: continue
        story.append(p(cat, h2))
        data = [[p(x, head) for x in ['Test ID','Test case','Browser','Result','Time','Evidence / observed failure']]]
        for r in subset:
            detail = r['evidence'] if r['result'] != 'FAILED' else f"{r['error']} | Evidence: {r['evidence']}"
            data.append([p(r['id'],cell),p(r['name'],cell),p(r['browser'],cell),p(r['result'],cell),p(f"{r['duration']:.1f}s",cell),p(detail,cell)])
        table = Table(data, colWidths=[22*mm,43*mm,28*mm,17*mm,13*mm,47*mm], repeatRows=1)
        commands=[('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0B5D75')),('GRID',(0,0),(-1,-1),0.25,colors.HexColor('#AABAC1')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]
        for idx,r in enumerate(subset,1): commands.append(('BACKGROUND',(3,idx),(3,idx),result_color(r['result'])))
        table.setStyle(TableStyle(commands)); story += [table, Spacer(1,4*mm)]
    failures = [r for r in rows if r['result']=='FAILED']
    story += [Spacer(1, 6*mm), p('Failed test cases', h1)]
    if not failures: story.append(p('No failed test cases were recorded in the latest execution.', body))
    else:
        unique = {}
        for r in failures: unique.setdefault(r['id'], r)
        for r in unique.values():
            story.append(KeepTogether([p(f"{r['id']} - {r['name']}", h2), p(f"Component: Admin login | Type: {r['category']} | Representative browser: {r['browser']}", body), p(f"Observed result: {r['error']}", body), p(f"Screenshot/evidence: {r['evidence']}", small)]))
    story += [Spacer(1,5*mm), p('Interpretation and limitations', h1), p('Compatibility emulation checks rendering and browser-engine behavior at the configured viewport. It does not validate physical-device hardware, operating-system browser chrome, virtual keyboard behavior, password managers, assistive technologies, or network conditions. Those require a separate manual device pass. Retained screenshots, video and traces are stored under test-results/artifacts.', body)]
    doc.build(story)
    print(OUTPUT)

if __name__ == '__main__': build()
