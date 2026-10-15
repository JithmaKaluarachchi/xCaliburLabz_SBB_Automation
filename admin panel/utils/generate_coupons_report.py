from pathlib import Path
import xml.etree.ElementTree as ET
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

root=Path(__file__).resolve().parents[1]; junit=root/'test-results'/'junit.xml'; output=root/'output'/'pdf'/'SBB-Oxygen-House-Admin-Coupons-Test-Report.pdf'
if not junit.exists(): raise SystemExit('Run npm run test:coupons first.')
rows=[]
for suite in ET.parse(junit).getroot().findall('testsuite'):
  browser=suite.get('hostname','Unknown')
  for case in suite.findall('testcase'):
    name=case.get('name','')
    if 'COUPON-' not in name: continue
    failure=case.find('failure'); result='FAILED' if failure is not None else ('SKIPPED' if case.find('skipped') is not None else 'PASSED')
    finding='JUnit result'
    if failure is not None and 'Expected: false' in (failure.text or ''): finding='Value field accepts negative numbers; minimum validation is missing.'
    rows.append([name.split('>')[-1].strip(),browser,result,f"{float(case.get('time',0)):.1f}s",finding])
passed=sum(r[2]=='PASSED' for r in rows); failed=sum(r[2]=='FAILED' for r in rows); skipped=sum(r[2]=='SKIPPED' for r in rows)
output.parent.mkdir(parents=True,exist_ok=True); styles=getSampleStyleSheet(); h=ParagraphStyle('h',parent=styles['Heading1'],textColor=colors.HexColor('#0B5D75')); small=ParagraphStyle('small',parent=styles['BodyText'],fontSize=7,leading=9)
doc=SimpleDocTemplate(str(output),pagesize=A4,leftMargin=14*mm,rightMargin=14*mm,topMargin=16*mm,bottomMargin=16*mm,title='Admin Coupons Test Report')
story=[Paragraph('SBB OXYGEN HOUSE',h),Paragraph('ADMIN COUPONS TEST REPORT',styles['Title']),Paragraph('Detailed functional, validation, UI, nonfunctional and browser compatibility evidence',styles['BodyText']),Spacer(1,8*mm)]
summary=[['Target','Total','Passed','Failed','Skipped'],['/admin/coupons',len(rows),passed,failed,skipped]]
t=Table(summary,colWidths=[70*mm,25*mm,25*mm,25*mm,25*mm]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0B5D75')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.4,colors.grey),('PADDING',(0,0),(-1,-1),6)]));story += [t,Spacer(1,8*mm),Paragraph('Coverage details',h)]
coverage=[
 ('Page and table','Heading, description, search, New Coupon, Code/Discount/Used/Expires/Status/Actions columns and live row data.'),
 ('Search','Reads an existing coupon code as safe test data and verifies its exact matching row.'),
 ('Create form','Code, Type, Description, Value, Min subtotal, Max discount, Usage limit, Per customer, Starts, Ends, Active and Create Coupon.'),
 ('Validation','Required code, numeric value constraints, valid start/end dates and cancellation without creating data.'),
 ('Lifecycle','Creates a timestamped AUTO coupon, verifies values, edits description/value, proves persistence and deletes only that generated coupon.'),
 ('Edit and delete safety','Loads existing values without saving; verifies the permanent-delete warning and Cancel behavior.'),
 ('UI and keyboard','Visibility, target sizing, search focus and Escape-key modal dismissal.'),
 ('Accessibility','WCAG 2.0/2.1 A and AA Axe scan; critical violations fail and JSON evidence is retained.'),
 ('Responsive','No document-width overflow in each desktop and mobile viewport.'),
 ('Performance and quality','10-second readiness threshold, uncaught JavaScript errors and HTTP 5xx monitoring.'),
 ('Security','HTTPS, authenticated /admin/coupons route and no login redirect.'),
 ('Compatibility','Chrome, Edge, Firefox and Safari-compatible web/mobile profiles: 8 profiles x 3 checks = 24.')]
coverage_data=[['Testing area','What was verified']]+[[Paragraph(a,small),Paragraph(b,small)] for a,b in coverage]
ct=Table(coverage_data,colWidths=[40*mm,140*mm],repeatRows=1);ct.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0B5D75')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#AABAC1')),('VALIGN',(0,0),(-1,-1),'TOP'),('PADDING',(0,0),(-1,-1),4)]))
story += [ct,Spacer(1,6*mm),Paragraph('Test-data and cleanup strategy',h),Paragraph('Read-only checks use the first available live coupon only for display, search, edit-load and delete-cancel verification. Mutation testing uses a unique AUTO timestamp code. Cleanup targets that exact code only, including a guarded finally block if execution stops early. Existing coupons are never submitted, changed or deleted.',styles['BodyText']),Spacer(1,4*mm),Paragraph('Result interpretation',h),Paragraph(f'{passed} of {len(rows)} checks passed; {failed} failed and {skipped} skipped. A 24/24 matrix means functional, responsive UI, accessibility, HTTPS and runtime-quality checks passed in all eight configured profiles. Safari-compatible profiles on Windows are simulations, not real Apple hardware.',styles['BodyText']),PageBreak(),Paragraph('Detailed execution results',h)]
data=[['Test case','Browser','Result','Time','Finding']]+[[Paragraph(r[0],small),Paragraph(r[1],small),r[2],r[3],Paragraph(r[4],small)] for r in rows]
t=Table(data,colWidths=[65*mm,30*mm,18*mm,15*mm,52*mm],repeatRows=1);cmd=[('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0B5D75')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#AABAC1')),('VALIGN',(0,0),(-1,-1),'TOP'),('FONTSIZE',(0,0),(-1,-1),7)]
for i,r in enumerate(rows,1): cmd.append(('BACKGROUND',(2,i),(2,i),colors.HexColor('#D9F2E2' if r[2]=='PASSED' else '#FFD9D9')))
t.setStyle(TableStyle(cmd));story.append(t);doc.build(story);print(output)
