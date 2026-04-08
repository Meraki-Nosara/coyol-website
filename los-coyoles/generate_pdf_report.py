"""
LOS COYOLES - D1 PRELIMINARY DESIGN REPORT
Generate PDF for architect/topographer
"""

import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime

os.chdir('/Users/Coyol/.openclaw/workspace/los-coyoles')

# Colors - Land Rover Heritage
MOSS = HexColor('#5C6B5C')
SAND = HexColor('#C4A67C')
DARK = HexColor('#1A1F16')
CREAM = HexColor('#F5F3EF')
TERRACOTTA = HexColor('#A65D3F')

# Create PDF
doc = SimpleDocTemplate(
    'los-coyoles-d1-report.pdf',
    pagesize=letter,
    rightMargin=0.75*inch,
    leftMargin=0.75*inch,
    topMargin=0.75*inch,
    bottomMargin=0.75*inch
)

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'Title',
    parent=styles['Heading1'],
    fontSize=28,
    textColor=DARK,
    spaceAfter=6,
    fontName='Helvetica-Bold'
)

subtitle_style = ParagraphStyle(
    'Subtitle',
    parent=styles['Normal'],
    fontSize=14,
    textColor=MOSS,
    spaceAfter=20,
    fontName='Helvetica-Oblique'
)

heading_style = ParagraphStyle(
    'Heading',
    parent=styles['Heading2'],
    fontSize=16,
    textColor=MOSS,
    spaceBefore=20,
    spaceAfter=10,
    fontName='Helvetica-Bold'
)

subheading_style = ParagraphStyle(
    'SubHeading',
    parent=styles['Heading3'],
    fontSize=12,
    textColor=DARK,
    spaceBefore=15,
    spaceAfter=8,
    fontName='Helvetica-Bold'
)

body_style = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontSize=10,
    textColor=black,
    spaceAfter=8,
    fontName='Helvetica',
    leading=14
)

# Content
story = []

# Title Page
story.append(Spacer(1, 2*inch))
story.append(Paragraph('LOS COYOLES', title_style))
story.append(Paragraph('An Ecological Estate Community', subtitle_style))
story.append(Spacer(1, 0.5*inch))
story.append(Paragraph('D1 PRELIMINARY SUBDIVISION DESIGN', ParagraphStyle(
    'DocTitle',
    fontSize=18,
    textColor=TERRACOTTA,
    fontName='Helvetica-Bold'
)))
story.append(Spacer(1, 1*inch))

# Project info table
project_info = [
    ['Location:', 'Nosara, Guanacaste, Costa Rica'],
    ['Total Area:', '91 hectares (225 acres)'],
    ['Developable:', '~55 hectares'],
    ['Conservation:', '~36 hectares (40%)'],
    ['Homesites:', '45 lots'],
    ['Phases:', '3'],
    ['Date:', datetime.now().strftime('%B %d, %Y')],
    ['Prepared by:', 'Coyol Real Estate'],
]

info_table = Table(project_info, colWidths=[1.5*inch, 4*inch])
info_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 11),
    ('TEXTCOLOR', (0, 0), (0, -1), MOSS),
    ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(info_table)

story.append(PageBreak())

# Executive Summary
story.append(Paragraph('EXECUTIVE SUMMARY', heading_style))
story.append(Paragraph('''
Los Coyoles is an ultra-premium ecological estate community located in the hills above Nosara, 
Costa Rica. Adjacent to the established Mar Azul development, Los Coyoles offers 45 exclusive 
homesites across 91 hectares of pristine tropical forest and rolling terrain.
''', body_style))

story.append(Paragraph('''
The development follows a Zapotal-style approach: large estate lots, generous spacing, 
premium amenities, and significant conservation areas. Over 40% of the property will be 
preserved as biological corridor, protecting the quebradas (seasonal streams) that flow 
through the southern portion of the site.
''', body_style))

story.append(Paragraph('Key Features:', subheading_style))
features = [
    '• 45 homesites ranging from 2,000 to 8,000 m²',
    '• Ocean views to the west from ridge lots',
    '• 40% conservation area with protected biological corridor',
    '• The Coyoles Club - full-service clubhouse and amenities',
    '• Organic farm and equestrian center',
    '• 10+ km of nature trails',
    '• Three distinct phases with unique character',
]
for f in features:
    story.append(Paragraph(f, body_style))

story.append(PageBreak())

# Masterplan Image
story.append(Paragraph('MASTERPLAN', heading_style))
if os.path.exists('los-coyoles-zapotal-style.png'):
    img = Image('los-coyoles-zapotal-style.png', width=7*inch, height=4.9*inch)
    story.append(img)
story.append(Spacer(1, 0.3*inch))

story.append(PageBreak())

# Lot Summary
story.append(Paragraph('HOMESITE SUMMARY', heading_style))

# Lot types table
lot_data = [
    ['Type', 'Count', 'Size Range', 'Avg Size', 'Price Range*', 'Total Value*'],
    ['Estate Lots', '20', '4,000 - 8,000 m²', '6,150 m²', '$1.5M - $2.4M', '$36.9M'],
    ['Hillside Lots', '15', '2,500 - 4,000 m²', '3,360 m²', '$525K - $665K', '$8.8M'],
    ['Garden Lots', '10', '2,000 - 3,000 m²', '2,530 m²', '$300K - $380K', '$3.4M'],
    ['TOTAL', '45', '', '', '', '$49.1M'],
]

lot_table = Table(lot_data, colWidths=[1.2*inch, 0.7*inch, 1.3*inch, 1*inch, 1.3*inch, 1*inch])
lot_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), MOSS),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
    ('GRID', (0, 0), (-1, -1), 0.5, MOSS),
    ('BACKGROUND', (0, -1), (-1, -1), CREAM),
    ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(lot_table)
story.append(Paragraph('* Estimated values based on $135-300/m² depending on lot type and views', 
    ParagraphStyle('Note', fontSize=8, textColor=MOSS, fontName='Helvetica-Oblique')))

story.append(Spacer(1, 0.3*inch))

# Phase breakdown
story.append(Paragraph('PHASE BREAKDOWN', heading_style))

phase_data = [
    ['Phase', 'Name', 'Area', 'Estate', 'Hillside', 'Garden', 'Total'],
    ['1', 'The Sunset Ridge', '32 ha', '8', '6', '4', '18'],
    ['2', 'The Panorama', '34 ha', '7', '5', '3', '15'],
    ['3', 'The Reserve', '25 ha', '5', '4', '3', '12'],
    ['', 'TOTAL', '91 ha', '20', '15', '10', '45'],
]

phase_table = Table(phase_data, colWidths=[0.6*inch, 1.4*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.7*inch])
phase_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), MOSS),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
    ('GRID', (0, 0), (-1, -1), 0.5, MOSS),
    ('BACKGROUND', (0, -1), (-1, -1), CREAM),
    ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(phase_table)

story.append(PageBreak())

# Phase Details
story.append(Paragraph('PHASE DESCRIPTIONS', heading_style))

story.append(Paragraph('Phase 1: The Sunset Ridge', subheading_style))
story.append(Paragraph('''
The western portion of the development, featuring the best sunset and ocean views. 
Eight estate lots occupy the prime ridge positions with unobstructed views to the Pacific. 
This phase includes the main amenity hub: The Coyoles Club.
''', body_style))
story.append(Paragraph('• 18 homesites (8 estate, 6 hillside, 4 garden)', body_style))
story.append(Paragraph('• Best sunset views', body_style))
story.append(Paragraph('• Adjacent to Mar Azul', body_style))
story.append(Paragraph('• Main clubhouse and amenities', body_style))

story.append(Paragraph('Phase 2: The Panorama', subheading_style))
story.append(Paragraph('''
The central ridge offers 360-degree panoramic views. Estate lots here enjoy both ocean views 
to the west and mountain views to the east. This phase includes the organic farm amenity.
''', body_style))
story.append(Paragraph('• 15 homesites (7 estate, 5 hillside, 3 garden)', body_style))
story.append(Paragraph('• Panoramic views in all directions', body_style))
story.append(Paragraph('• Organic farm and gardens', body_style))
story.append(Paragraph('• Central location with trail connections', body_style))

story.append(Paragraph('Phase 3: The Reserve', subheading_style))
story.append(Paragraph('''
The eastern portion of the property, designed with a nature-forward approach. Lower density 
and maximum integration with the surrounding forest. Includes the equestrian center.
''', body_style))
story.append(Paragraph('• 12 homesites (5 estate, 4 hillside, 3 garden)', body_style))
story.append(Paragraph('• Most private and secluded', body_style))
story.append(Paragraph('• Equestrian center and stables', body_style))
story.append(Paragraph('• Direct access to trail system', body_style))

story.append(PageBreak())

# Amenities
story.append(Paragraph('AMENITIES', heading_style))

story.append(Paragraph('The Coyoles Club (Phase 1)', subheading_style))
amenities_club = [
    '• Main Clubhouse - Restaurant, bar, lounge, event space',
    '• Infinity Edge Pool - Ocean view, heated, 25m lap lanes',
    '• Wellness Center - Full spa, yoga studio, fitness center',
    '• Racquet Club - 2 tennis courts, 4 pickleball courts',
    '• Family Zone - Playground, splash pad, picnic areas',
]
for a in amenities_club:
    story.append(Paragraph(a, body_style))

story.append(Paragraph('The Farm (Phase 2)', subheading_style))
amenities_farm = [
    '• Organic Gardens - Vegetables, herbs, tropical fruits',
    '• Farm-to-Table Program - Supply to clubhouse restaurant',
    '• Educational Center - Workshops and tours',
    '• Greenhouse and nursery',
]
for a in amenities_farm:
    story.append(Paragraph(a, body_style))

story.append(Paragraph('Equestrian Center (Phase 3)', subheading_style))
amenities_equestrian = [
    '• Stables for 12 horses',
    '• Riding arena',
    '• Trail riding access to 10+ km of trails',
    '• Boarding and lessons available',
]
for a in amenities_equestrian:
    story.append(Paragraph(a, body_style))

story.append(Paragraph('Trail System', subheading_style))
story.append(Paragraph('''
Over 10 kilometers of maintained trails wind through the property, connecting all phases 
and amenities while providing access to the biological corridor. Trails accommodate 
hiking, mountain biking, and horseback riding.
''', body_style))

story.append(PageBreak())

# Conservation
story.append(Paragraph('CONSERVATION & ENVIRONMENT', heading_style))

story.append(Paragraph('Biological Corridor', subheading_style))
story.append(Paragraph('''
Approximately 40% of the property (36 hectares) is designated as biological corridor, 
protecting the quebradas and associated riparian habitat. This corridor runs along the 
southern boundary of the property and connects to adjacent protected areas.
''', body_style))

story.append(Paragraph('Environmental Features:', subheading_style))
env_features = [
    '• Protected quebradas (seasonal streams)',
    '• Native forest preservation',
    '• Wildlife corridors maintained',
    '• Reforestation program for disturbed areas',
    '• Sustainable stormwater management',
]
for e in env_features:
    story.append(Paragraph(e, body_style))

story.append(Paragraph('SETENA Compliance', subheading_style))
story.append(Paragraph('''
The development is designed to comply with SETENA environmental requirements, including:
''', body_style))
setena = [
    '• 50-meter buffer zones along quebradas',
    '• Maximum 60% lot coverage for construction',
    '• Native species landscaping requirements',
    '• Environmental impact assessment pending',
    '• Biological corridor management plan',
]
for s in setena:
    story.append(Paragraph(s, body_style))

story.append(PageBreak())

# Infrastructure
story.append(Paragraph('INFRASTRUCTURE', heading_style))

story.append(Paragraph('Road Network', subheading_style))
story.append(Paragraph('''
The road network follows terrain contours to minimize earthwork and environmental impact:
''', body_style))
roads = [
    '• Main Spine Road: 8m wide, paved, connects all phases',
    '• Ridge Loop Roads: 6m wide, paved, serves estate lots',
    '• Secondary Roads: 5m wide, serves hillside and garden lots',
    '• Total road length: approximately 8 km',
]
for r in roads:
    story.append(Paragraph(r, body_style))

story.append(Paragraph('Utilities', subheading_style))
utilities = [
    '• Water: Connection to municipal supply + on-site storage',
    '• Electric: Underground distribution from ICE grid',
    '• Internet: Fiber optic to each lot',
    '• Sewage: Individual septic systems (soil study required)',
    '• Drainage: Engineered stormwater management system',
]
for u in utilities:
    story.append(Paragraph(u, body_style))

story.append(PageBreak())

# Lot Coordinates
story.append(Paragraph('LOT COORDINATES (PRELIMINARY)', heading_style))
story.append(Paragraph('''
The following coordinates represent preliminary lot center points. Final boundaries 
to be determined by topographic survey.
''', body_style))

# Estate lots
story.append(Paragraph('Estate Lots', subheading_style))
estate_coords = [
    ['Lot', 'Phase', 'Longitude', 'Latitude', 'Size (m²)'],
    ['1', '1', '-85.6420', '10.0050', '6,500'],
    ['2', '1', '-85.6410', '10.0030', '5,800'],
    ['3', '1', '-85.6400', '10.0010', '5,500'],
    ['4', '1', '-85.6390', '10.0050', '7,200'],
    ['5', '1', '-85.6380', '10.0030', '6,000'],
    ['6', '1', '-85.6370', '10.0060', '8,000'],
    ['7', '1', '-85.6360', '10.0040', '5,500'],
    ['8', '1', '-85.6350', '10.0020', '5,000'],
    ['9', '2', '-85.6310', '10.0040', '7,000'],
    ['10', '2', '-85.6290', '10.0050', '7,500'],
    ['11', '2', '-85.6270', '10.0040', '6,500'],
    ['12', '2', '-85.6250', '10.0030', '6,000'],
    ['13', '2', '-85.6230', '10.0020', '5,500'],
    ['14', '2', '-85.6280', '10.0020', '5,800'],
    ['15', '2', '-85.6260', '10.0010', '5,200'],
    ['16', '3', '-85.6170', '10.0050', '6,000'],
    ['17', '3', '-85.6150', '10.0060', '7,000'],
    ['18', '3', '-85.6130', '10.0050', '6,500'],
    ['19', '3', '-85.6110', '10.0030', '5,500'],
    ['20', '3', '-85.6140', '10.0030', '5,000'],
]

estate_table = Table(estate_coords, colWidths=[0.5*inch, 0.6*inch, 1*inch, 1*inch, 0.9*inch])
estate_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), MOSS),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, MOSS),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
]))
story.append(estate_table)

story.append(PageBreak())

# Contact
story.append(Paragraph('CONTACT', heading_style))
story.append(Spacer(1, 0.3*inch))

contact_info = [
    ['Developer:', 'Coyol Real Estate'],
    ['Contact:', 'Marion Peri'],
    ['Email:', 'info@coyolrealestate.com'],
    ['Phone:', '+506 8713 4120'],
    ['Website:', 'www.coyolrealestate.com'],
    ['Address:', 'Nosara, Guanacaste, Costa Rica'],
]

contact_table = Table(contact_info, colWidths=[1.2*inch, 4*inch])
contact_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 11),
    ('TEXTCOLOR', (0, 0), (0, -1), MOSS),
    ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
]))
story.append(contact_table)

story.append(Spacer(1, 1*inch))
story.append(Paragraph('''
This document presents a preliminary subdivision design for planning and discussion purposes. 
Final lot boundaries, sizes, and configurations are subject to topographic survey, 
environmental assessment, and regulatory approval.
''', ParagraphStyle('Disclaimer', fontSize=9, textColor=MOSS, fontName='Helvetica-Oblique', alignment=TA_CENTER)))

# Build PDF
doc.build(story)
print("✅ PDF Report generated: los-coyoles-d1-report.pdf")
