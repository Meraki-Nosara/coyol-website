from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime

# Colors
GOLD = colors.HexColor('#C4A67C')
DARK_GREEN = colors.HexColor('#3D4F3D')
CREAM = colors.HexColor('#FAF8F5')
LIGHT_GOLD = colors.HexColor('#F5EDE0')
DARK = colors.HexColor('#2C2C2C')

doc = SimpleDocTemplate('meraki_executive_report.pdf', pagesize=letter, 
    rightMargin=0.75*inch, leftMargin=0.75*inch, topMargin=0.6*inch, bottomMargin=0.5*inch)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='Brand', fontSize=32, spaceAfter=8, alignment=TA_CENTER, textColor=DARK_GREEN, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='Tagline', fontSize=10, spaceBefore=0, spaceAfter=8, alignment=TA_CENTER, textColor=GOLD))
styles.add(ParagraphStyle(name='ReportTitle', fontSize=16, spaceAfter=3, alignment=TA_CENTER, textColor=DARK))
styles.add(ParagraphStyle(name='Period', fontSize=10, spaceAfter=15, alignment=TA_CENTER, textColor=colors.gray))
styles.add(ParagraphStyle(name='Section', fontSize=12, spaceBefore=20, spaceAfter=8, textColor=DARK_GREEN, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='BigMoney', fontSize=36, alignment=TA_CENTER, textColor=DARK_GREEN, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='BigLabel', fontSize=11, alignment=TA_CENTER, textColor=colors.gray))
styles.add(ParagraphStyle(name='Body', fontSize=10, spaceAfter=4, textColor=DARK))
styles.add(ParagraphStyle(name='Footer', fontSize=8, textColor=colors.gray, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='Tip', fontSize=9, spaceAfter=6, textColor=DARK, leftIndent=15))
styles.add(ParagraphStyle(name='TipHead', fontSize=10, spaceBefore=12, spaceAfter=4, textColor=DARK_GREEN, fontName='Helvetica-Bold'))

story = []

# Header
story.append(Spacer(1, 10))
story.append(Paragraph('MERAKI', styles['Brand']))
story.append(Paragraph('FAMILY LIMITADA', styles['Tagline']))
story.append(Spacer(1, 8))
story.append(HRFlowable(width='30%', thickness=1.5, color=GOLD, spaceAfter=12, hAlign='CENTER'))
story.append(Paragraph('Executive Financial Report', styles['ReportTitle']))
story.append(Paragraph('January - April 2026', styles['Period']))

# Congrats Box
congrats = Table([
    ['Congratulations Angelina!'],
    ['43% Operating Margin'],
    ['Industry average is 10-20%. Meraki is exceptional.'],
], colWidths=[5*inch])
congrats.setStyle(TableStyle([
    ('FONTSIZE', (0, 0), (0, 0), 11),
    ('FONTSIZE', (0, 1), (0, 1), 28),
    ('FONTSIZE', (0, 2), (0, 2), 9),
    ('FONTNAME', (0, 0), (0, 1), 'Helvetica-Bold'),
    ('TEXTCOLOR', (0, 0), (0, 0), DARK_GREEN),
    ('TEXTCOLOR', (0, 1), (0, 1), colors.HexColor('#2E7D32')),
    ('TEXTCOLOR', (0, 2), (0, 2), colors.gray),
    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#E8F5E9')),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#A5D6A7')),
]))
story.append(congrats)
story.append(Spacer(1, 20))

# Revenue
story.append(Paragraph('USD 2,551,557', styles['BigMoney']))
story.append(Paragraph('Total Revenue (4 Months)', styles['BigLabel']))
story.append(Spacer(1, 8))

# Restaurant breakdown
rest_table = Table([['La Luna', 'Coyol', 'Esh'], ['63%', '32%', '5%']], colWidths=[1.5*inch, 1.5*inch, 1.5*inch])
rest_table.setStyle(TableStyle([
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTSIZE', (0, 1), (-1, 1), 14),
    ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
    ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#A65D3F')),
    ('TEXTCOLOR', (1, 0), (1, -1), DARK_GREEN),
    ('TEXTCOLOR', (2, 0), (2, -1), GOLD),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
]))
story.append(rest_table)
story.append(Spacer(1, 20))

# Financial Summary
story.append(Paragraph('Financial Summary', styles['Section']))

fin_data = [
    ['', 'USD', '%'],
    ['Revenue', '2,551,557', '100'],
    ['', '', ''],
    ['Operating Expenses', '', ''],
    ['    Suppliers & Costs', '865,476', '34'],
    ['    Payroll', '284,616', '11'],
    ['    Taxes', '138,614', '5'],
    ['    Other', '160,082', '6'],
    ['Total Operating', '1,448,788', '57'],
    ['', '', ''],
    ['Operating Profit', '1,102,769', '43'],
    ['', '', ''],
    ['Non-Operating', '', ''],
    ['    Equipment (Angelina)', '175,030', '7'],
    ['    Loan to Rancho', '98,700', '4'],
    ['Total Non-Operating', '273,730', '11'],
    ['', '', ''],
    ['Net Cash Retained', '829,039', '32'],
]

t = Table(fin_data, colWidths=[3.2*inch, 1.4*inch, 0.6*inch])
t.setStyle(TableStyle([
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('TEXTCOLOR', (0, 0), (-1, -1), DARK),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
    ('FONTNAME', (0, 8), (-1, 8), 'Helvetica-Bold'),
    ('FONTNAME', (0, 10), (-1, 10), 'Helvetica-Bold'),
    ('FONTNAME', (0, 15), (-1, 15), 'Helvetica-Bold'),
    ('FONTNAME', (0, 17), (-1, 17), 'Helvetica-Bold'),
    ('BACKGROUND', (0, 0), (-1, 0), DARK_GREEN),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), LIGHT_GOLD),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#FFEBEE')),
    ('BACKGROUND', (0, 10), (-1, 10), colors.HexColor('#E8F5E9')),
    ('TEXTCOLOR', (0, 10), (-1, 10), colors.HexColor('#2E7D32')),
    ('BACKGROUND', (0, 15), (-1, 15), colors.HexColor('#FFF3E0')),
    ('BACKGROUND', (0, 17), (-1, 17), GOLD),
    ('TEXTCOLOR', (0, 17), (-1, 17), colors.white),
    ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(t)
story.append(Spacer(1, 15))

# Cash Position
story.append(Paragraph('Cash Position (May 14, 2026)', styles['Section']))

cash_data = [
    ['Account', 'USD'],
    ['LAFISE Colones', '647,525'],
    ['LAFISE USD', '34,000'],
    ['BCR Colones', '59,406'],
    ['BCR USD', '1,000'],
    ['Total Cash', '741,931'],
    ['Rancho Receivable', '98,700'],
    ['Total Assets', '840,631'],
]
t = Table(cash_data, colWidths=[3.2*inch, 1.4*inch])
t.setStyle(TableStyle([
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('TEXTCOLOR', (0, 0), (-1, -1), DARK),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, 5), (-1, 5), 'Helvetica-Bold'),
    ('FONTNAME', (0, 7), (-1, 7), 'Helvetica-Bold'),
    ('BACKGROUND', (0, 0), (-1, 0), DARK_GREEN),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor('#E8F5E9')),
    ('TEXTCOLOR', (0, 5), (-1, 5), colors.HexColor('#2E7D32')),
    ('BACKGROUND', (0, 7), (-1, 7), GOLD),
    ('TEXTCOLOR', (0, 7), (-1, 7), colors.white),
    ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('ROWBACKGROUNDS', (0, 1), (-1, 4), [colors.white, CREAM]),
]))
story.append(t)

# Page 2
story.append(PageBreak())

story.append(Paragraph('MERAKI', styles['Brand']))
story.append(HRFlowable(width='30%', thickness=1.5, color=GOLD, spaceAfter=15, hAlign='CENTER'))

story.append(Paragraph('Recommendations', styles['Section']))

story.append(Paragraph('What Is Working', styles['TipHead']))
for tip in [
    '43% margin is exceptional - double the industry average',
    'La Luna is your powerhouse at 63% of revenue',
    'Labor costs at 11% are well controlled (industry: 25-35%)',
    'Strong cash generation - 32% retained after all costs',
]:
    story.append(Paragraph('+ ' + tip, styles['Tip']))

story.append(Paragraph('Action Items', styles['TipHead']))
for tip in [
    'Build reserve: target 350K before low season (you have 742K - great!)',
    'Get BCR statements to track the 670K that flows through there',
    'Set repayment schedule for Rancho loan (99K receivable)',
    'Prepare for low season: May-Oct expect 30-40% less revenue',
    'Review supplier contracts - 34% COGS may have room to improve',
]:
    story.append(Paragraph('> ' + tip, styles['Tip']))

story.append(Paragraph('Watch Out', styles['TipHead']))
for tip in [
    'BCR balance low (60K) - transfer needed for next payroll',
    'April revenue dropped 27% vs March - seasonality starting',
    'Track remaining equipment debt if applicable',
]:
    story.append(Paragraph('! ' + tip, styles['Tip']))

story.append(Spacer(1, 20))

# Metrics
metrics = Table([
    ['Operating Margin', 'Cash Available', 'Monthly Average'],
    ['43%', '742K', '638K'],
    ['Excellent', 'Strong', 'per month'],
], colWidths=[2*inch, 2*inch, 2*inch])
metrics.setStyle(TableStyle([
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTSIZE', (0, 1), (-1, 1), 22),
    ('FONTSIZE', (0, 2), (-1, 2), 8),
    ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.gray),
    ('TEXTCOLOR', (0, 1), (-1, 1), DARK_GREEN),
    ('TEXTCOLOR', (0, 2), (-1, 2), GOLD),
    ('BACKGROUND', (0, 0), (-1, -1), CREAM),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('BOX', (0, 0), (-1, -1), 1, GOLD),
]))
story.append(metrics)

story.append(Spacer(1, 25))
story.append(HRFlowable(width='100%', thickness=0.5, color=colors.gray, spaceAfter=8))
story.append(Paragraph(f'Generated {datetime.now().strftime("%B %d, %Y")} | Exchange rate: 505 CRC = 1 USD', styles['Footer']))
story.append(Paragraph('Data verified against LAFISE bank statements', styles['Footer']))

doc.build(story)
print('PDF created: meraki_executive_report.pdf')
