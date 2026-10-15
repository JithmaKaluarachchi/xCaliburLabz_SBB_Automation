from pathlib import Path
import xml.etree.ElementTree as ET
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak
root=Path(__file__).resolve().parents[1];j=root/'test-results'/'junit.xml';out=root/'output'/'pdf'/'SBB-Oxygen-House-Admin-Shipping-Test-Report.pdf'
if not j.exists():raise SystemExit('Run Shipping tests first.')
rows=[]
for s in ET.parse(j).getroot().findall('testsuite'):
 for c in s.findall('testcase'):
  n=c.get('name','')
  if 'SHIP-' not in n:continue
  f=c.find('failure');result='FAILED' if f is not None else('SKIPPED' if c.find('skipped')is not None else'PASSED');finding='Negative price validation is missing.' if f is not None and 'Expected: false' in(f.text or'') else('See retained evidence.' if f is not None else'JUnit result')
  rows.append([n.split('>')[-1].strip(),s.get('hostname','Unknown'),result,f"{float(c.get('time',0)):.1f}s",finding])
p=sum(x[2]=='PASSED'for x in rows);f=sum(x[2]=='FAILED'for x in rows);sk=sum(x[2]=='SKIPPED'for x in rows);styles=getSampleStyleSheet();h=ParagraphStyle('h',parent=styles['Heading1'],textColor=colors.HexColor('#0B5D75'));sm=ParagraphStyle('sm',parent=styles['BodyText'],fontSize=7,leading=9);out.parent.mkdir(parents=True,exist_ok=True);doc=SimpleDocTemplate(str(out),pagesize=A4,leftMargin=14*mm,rightMargin=14*mm,topMargin=15*mm,bottomMargin=15*mm,title='Admin Shipping Test Report')
story=[Paragraph('SBB OXYGEN HOUSE',h),Paragraph('ADMIN SHIPPING TEST REPORT',styles['Title']),Paragraph('Methods, zones, validation, UI, nonfunctional and browser compatibility evidence',styles['BodyText']),Spacer(1,7*mm)]
summary=[['Target','Total','Passed','Failed','Skipped'],['/admin/shipping',len(rows),p,f,sk]];t=Table(summary,colWidths=[70*mm,25*mm,25*mm,25*mm,25*mm]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0B5D75')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.4,colors.grey),('PADDING',(0,0),(-1,-1),6)]));story+=[t,Spacer(1,7*mm),Paragraph('Coverage details',h)]
cov=[('Methods','Table, New Method, Name, Description, Price, Sort order, Min/Max days, Active, edit and delete.'),('Zones','Tab navigation, empty state, New Zone availability and safe modal dismissal.'),('Test data','Unique timestamped AUTO method; create, persist, edit and exact-row delete with guarded cleanup.'),('Validation','Required name, numeric price boundary, day boundaries and unfinished-form cancellation.'),('UI','Tabs, actions, keyboard focus, modal behavior and responsive overflow.'),('Nonfunctional','WCAG accessibility, performance, HTTPS/authentication, runtime errors and HTTP 5xx responses.'),('Compatibility','Chrome, Edge, Firefox and Safari-compatible web/mobile profiles.')];d=[['Area','Checks']]+[[Paragraph(a,sm),Paragraph(b,sm)]for a,b in cov];ct=Table(d,colWidths=[38*mm,142*mm],repeatRows=1);ct.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0B5D75')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.3,colors.grey),('VALIGN',(0,0),(-1,-1),'TOP'),('PADDING',(0,0),(-1,-1),5)]));story+=[ct,Spacer(1,6*mm),Paragraph('Result interpretation',h),Paragraph(f'{p} passed, {f} failed and {sk} skipped. Existing methods are opened only for read-only and cancel checks. Mutation tests target only the generated AUTO method.',styles['BodyText']),PageBreak(),Paragraph('Detailed execution results',h)]
d=[['Test case','Browser','Result','Time','Finding']]+[[Paragraph(x[0],sm),Paragraph(x[1],sm),x[2],x[3],Paragraph(x[4],sm)]for x in rows];t=Table(d,colWidths=[65*mm,30*mm,18*mm,15*mm,52*mm],repeatRows=1);cmd=[('BACKGROUND',(0,0),(-1,0),colors.HexColor('#0B5D75')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.3,colors.grey),('VALIGN',(0,0),(-1,-1),'TOP'),('FONTSIZE',(0,0),(-1,-1),7)];[cmd.append(('BACKGROUND',(2,i),(2,i),colors.HexColor('#D9F2E2'if x[2]=='PASSED'else'#FFD9D9')))for i,x in enumerate(rows,1)];t.setStyle(TableStyle(cmd));story.append(t);doc.build(story);print(out)
