from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Create PDF
doc = SimpleDocTemplate(
    "/Users/Coyol/.openclaw/workspace/docs/catalina-email-setup.pdf",
    pagesize=letter,
    rightMargin=72,
    leftMargin=72,
    topMargin=72,
    bottomMargin=72
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Title'],
    fontSize=24,
    spaceAfter=30,
    textColor=colors.HexColor('#3D4F3D')  # Keswick Green
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading1'],
    fontSize=16,
    spaceAfter=12,
    spaceBefore=20,
    textColor=colors.HexColor('#3D4F3D')
)

body_style = ParagraphStyle(
    'CustomBody',
    parent=styles['Normal'],
    fontSize=12,
    spaceAfter=10,
    leading=16
)

step_style = ParagraphStyle(
    'StepStyle',
    parent=styles['Normal'],
    fontSize=12,
    spaceAfter=8,
    leftIndent=20,
    leading=16
)

credentials_style = ParagraphStyle(
    'CredentialsStyle',
    parent=styles['Normal'],
    fontSize=14,
    spaceAfter=6,
    fontName='Courier-Bold',
    backColor=colors.HexColor('#F5F5F5'),
    borderPadding=10
)

story = []

# Title
story.append(Paragraph("Guía: Configurar Correo en Windows", title_style))
story.append(Spacer(1, 20))

# Introduction
story.append(Paragraph(
    "Esta guía te explica cómo agregar tu nueva cuenta de correo de Mar Azul a tu laptop Acer con Windows.",
    body_style
))
story.append(Spacer(1, 20))

# Credentials Box
story.append(Paragraph("<b>Tu Cuenta de Correo:</b>", heading_style))
story.append(Spacer(1, 10))

credentials_data = [
    ['Correo:', 'admin@condominiummarazul.com'],
    ['Contraseña:', 'suqvu0-toxvut-zuVnaf'],
]

credentials_table = Table(credentials_data, colWidths=[2*inch, 4*inch])
credentials_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8E8E8')),
    ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#F5F5F5')),
    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
    ('FONTNAME', (1, 0), (1, -1), 'Courier-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 12),
    ('PADDING', (0, 0), (-1, -1), 12),
    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(credentials_table)
story.append(Spacer(1, 30))

# Option 1: Windows Mail App
story.append(Paragraph("Opción 1: Aplicación de Correo de Windows", heading_style))
story.append(Spacer(1, 10))

steps_mail = [
    "<b>Paso 1:</b> Abre la aplicación <b>Correo</b> (Mail) desde el menú de inicio",
    "<b>Paso 2:</b> Haz clic en <b>Configuración</b> (ícono de engranaje) → <b>Administrar cuentas</b>",
    "<b>Paso 3:</b> Haz clic en <b>+ Agregar cuenta</b>",
    "<b>Paso 4:</b> Selecciona <b>Otra cuenta</b> (Other account) o <b>IMAP</b>",
    "<b>Paso 5:</b> Ingresa tu correo: <b>admin@condominiummarazul.com</b>",
    "<b>Paso 6:</b> Ingresa tu contraseña: <b>suqvu0-toxvut-zuVnaf</b>",
    "<b>Paso 7:</b> Haz clic en <b>Iniciar sesión</b> (Sign in)",
    "<b>Paso 8:</b> ¡Listo! Tu correo debería sincronizarse automáticamente",
]

for step in steps_mail:
    story.append(Paragraph(step, step_style))

story.append(Spacer(1, 30))

# Option 2: Outlook
story.append(Paragraph("Opción 2: Microsoft Outlook", heading_style))
story.append(Spacer(1, 10))

steps_outlook = [
    "<b>Paso 1:</b> Abre <b>Outlook</b>",
    "<b>Paso 2:</b> Ve a <b>Archivo</b> → <b>Agregar cuenta</b>",
    "<b>Paso 3:</b> Ingresa tu correo: <b>admin@condominiummarazul.com</b>",
    "<b>Paso 4:</b> Haz clic en <b>Conectar</b>",
    "<b>Paso 5:</b> Ingresa tu contraseña: <b>suqvu0-toxvut-zuVnaf</b>",
    "<b>Paso 6:</b> Haz clic en <b>Aceptar</b> y luego <b>Listo</b>",
]

for step in steps_outlook:
    story.append(Paragraph(step, step_style))

story.append(Spacer(1, 30))

# Server Settings (if needed)
story.append(Paragraph("Configuración Manual (si la necesitas)", heading_style))
story.append(Spacer(1, 10))

story.append(Paragraph(
    "Si el sistema te pide configuración de servidor manualmente, usa estos datos:",
    body_style
))
story.append(Spacer(1, 10))

server_data = [
    ['Tipo de cuenta:', 'IMAP'],
    ['Servidor entrante (IMAP):', 'mail.condominiummarazul.com'],
    ['Puerto IMAP:', '993 (SSL)'],
    ['Servidor saliente (SMTP):', 'mail.condominiummarazul.com'],
    ['Puerto SMTP:', '465 (SSL) o 587 (TLS)'],
]

server_table = Table(server_data, colWidths=[2.5*inch, 3.5*inch])
server_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8E8E8')),
    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 11),
    ('PADDING', (0, 0), (-1, -1), 8),
    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(server_table)

story.append(Spacer(1, 30))

# Help section
story.append(Paragraph("¿Necesitas ayuda?", heading_style))
story.append(Paragraph(
    "Si tienes problemas configurando el correo, contacta a Marion.",
    body_style
))

# Build PDF
doc.build(story)
print("PDF created: catalina-email-setup.pdf")
