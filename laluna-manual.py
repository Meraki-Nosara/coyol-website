#!/usr/bin/env python3
"""Generate La Luna Reservation System Manual PDF in Spanish"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, 
    Table, TableStyle, PageBreak, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
import os

# La Luna Colors (Terracotta palette)
TERRACOTTA = HexColor('#A65D3F')
TERRACOTTA_DARK = HexColor('#8B4D34')
LIMESTONE = HexColor('#D4C9B5')
SAND = HexColor('#C4A67C')
ALASKA_WHITE = HexColor('#F5F3EF')
SANTORINI = HexColor('#1A1F16')
KESWICK_GREEN = HexColor('#3D4F3D')

OUTPUT_PATH = os.path.expanduser('~/Desktop/LaLuna-Sistema-Reservaciones.pdf')

def create_styles():
    styles = getSampleStyleSheet()
    
    styles.add(ParagraphStyle(
        name='LaLunaTitle',
        fontName='Helvetica-Bold',
        fontSize=28,
        textColor=TERRACOTTA,
        alignment=TA_CENTER,
        spaceAfter=20,
    ))
    
    styles.add(ParagraphStyle(
        name='LaLunaSubtitle',
        fontName='Helvetica',
        fontSize=14,
        textColor=TERRACOTTA_DARK,
        alignment=TA_CENTER,
        spaceAfter=40,
    ))
    
    styles.add(ParagraphStyle(
        name='LaLunaHeading',
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=TERRACOTTA,
        spaceBefore=25,
        spaceAfter=12,
    ))
    
    styles.add(ParagraphStyle(
        name='LaLunaHeading2',
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=TERRACOTTA_DARK,
        spaceBefore=18,
        spaceAfter=8,
    ))
    
    styles.add(ParagraphStyle(
        name='LaLunaBody',
        fontName='Helvetica',
        fontSize=11,
        textColor=SANTORINI,
        alignment=TA_JUSTIFY,
        spaceAfter=10,
        leading=16,
    ))
    
    styles.add(ParagraphStyle(
        name='LaLunaBullet',
        fontName='Helvetica',
        fontSize=11,
        textColor=SANTORINI,
        leftIndent=20,
        spaceAfter=6,
        leading=14,
    ))
    
    styles.add(ParagraphStyle(
        name='LaLunaNote',
        fontName='Helvetica-Oblique',
        fontSize=10,
        textColor=KESWICK_GREEN,
        leftIndent=15,
        rightIndent=15,
        spaceBefore=10,
        spaceAfter=10,
        borderColor=KESWICK_GREEN,
        borderWidth=1,
        borderPadding=8,
    ))
    
    return styles

def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(TERRACOTTA_DARK)
    canvas.setFont('Helvetica', 9)
    canvas.drawCentredString(letter[0]/2, 0.5*inch, f"Página {doc.page}")
    
    # Header line
    canvas.setStrokeColor(SAND)
    canvas.setLineWidth(2)
    canvas.line(0.75*inch, letter[1] - 0.5*inch, letter[0] - 0.75*inch, letter[1] - 0.5*inch)
    
    # Footer line
    canvas.line(0.75*inch, 0.75*inch, letter[0] - 0.75*inch, 0.75*inch)
    canvas.restoreState()

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch,
    )
    
    styles = create_styles()
    story = []
    
    # === COVER PAGE ===
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("LA LUNA", styles['LaLunaTitle']))
    story.append(Paragraph("Restaurant & Café", styles['LaLunaSubtitle']))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("Sistema de Reservaciones", styles['LaLunaHeading']))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("Manual de Usuario", styles['LaLunaSubtitle']))
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("Playa Pelada · Nosara, Costa Rica", styles['LaLunaSubtitle']))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("Mayo 2026", styles['LaLunaBody']))
    story.append(PageBreak())
    
    # === CREDENTIALS PAGE ===
    story.append(Paragraph("Acceso al Sistema", styles['LaLunaHeading']))
    story.append(Paragraph(
        "Para ingresar al panel de administración, utilice las siguientes credenciales:",
        styles['LaLunaBody']
    ))
    story.append(Spacer(1, 20))
    
    # Credentials box
    cred_data = [
        ['ENLACE:', 'coyolnosara.com/laluna/admin'],
        ['USUARIO:', 'admin'],
        ['CONTRASEÑA:', 'lalunareservations1978'],
    ]
    cred_table = Table(cred_data, colWidths=[1.5*inch, 4*inch])
    cred_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIMESTONE),
        ('TEXTCOLOR', (0, 0), (0, -1), TERRACOTTA),
        ('TEXTCOLOR', (1, 0), (1, -1), SANTORINI),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Courier-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOX', (0, 0), (-1, -1), 2, TERRACOTTA),
        ('LINEBELOW', (0, 0), (-1, -2), 1, SAND),
    ]))
    story.append(cred_table)
    
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "⚠️ IMPORTANTE: Mantenga estas credenciales en un lugar seguro. No las comparta con personas no autorizadas.",
        styles['LaLunaNote']
    ))
    story.append(PageBreak())
    
    # === OVERVIEW ===
    story.append(Paragraph("1. Vista General", styles['LaLunaHeading']))
    story.append(Paragraph(
        "El Sistema de Reservaciones de La Luna es una plataforma completa para gestionar las "
        "reservaciones del restaurante. Permite crear, modificar y administrar reservaciones, "
        "visualizar el plano del restaurante en tiempo real, y gestionar la asignación de mesas.",
        styles['LaLunaBody']
    ))
    
    story.append(Paragraph("Características Principales:", styles['LaLunaHeading2']))
    bullets = [
        "Panel de control con vista de reservaciones del día",
        "Plano interactivo del restaurante con múltiples zonas",
        "Creación rápida de reservaciones con asignación automática de mesa",
        "Búsqueda y filtrado por nombre, hora o estado",
        "Estados de reservación: Pendiente, Sentado, Completado, Cancelado",
        "Formulario público para que clientes reserven en línea",
        "Confirmaciones automáticas por correo electrónico",
    ]
    for b in bullets:
        story.append(Paragraph(f"• {b}", styles['LaLunaBullet']))
    
    story.append(PageBreak())
    
    # === DASHBOARD ===
    story.append(Paragraph("2. Panel Principal (Dashboard)", styles['LaLunaHeading']))
    story.append(Paragraph(
        "Al ingresar al sistema, verá el panel principal dividido en dos secciones:",
        styles['LaLunaBody']
    ))
    
    story.append(Paragraph("Panel Izquierdo - Lista de Reservaciones", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "Muestra todas las reservaciones del día seleccionado. Cada tarjeta incluye:",
        styles['LaLunaBody']
    ))
    bullets = [
        "Hora de la reservación",
        "Nombre del cliente",
        "Número de personas",
        "Mesa asignada (si aplica)",
        "Estado actual (Coming/Seated)",
    ]
    for b in bullets:
        story.append(Paragraph(f"• {b}", styles['LaLunaBullet']))
    
    story.append(Paragraph("Panel Derecho - Plano del Restaurante", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "Vista visual de las mesas organizadas por zona. Las mesas muestran su estado mediante colores:",
        styles['LaLunaBody']
    ))
    
    status_data = [
        ['Color', 'Estado', 'Descripción'],
        ['Verde', 'Disponible', 'Mesa libre para asignar'],
        ['Arena/Sand', 'Reservada', 'Mesa con reservación próxima'],
        ['Terracota', 'Ocupada', 'Mesa con clientes sentados'],
    ]
    status_table = Table(status_data, colWidths=[1.2*inch, 1.5*inch, 3*inch])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TERRACOTTA),
        ('TEXTCOLOR', (0, 0), (-1, 0), ALASKA_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, SAND),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ]))
    story.append(Spacer(1, 10))
    story.append(status_table)
    
    story.append(PageBreak())
    
    # === CREATING RESERVATIONS ===
    story.append(Paragraph("3. Crear Nueva Reservación", styles['LaLunaHeading']))
    
    story.append(Paragraph("Desde el Panel de Admin:", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "1. Haga clic en el botón <b>+</b> en la esquina superior izquierda",
        styles['LaLunaBody']
    ))
    story.append(Paragraph(
        "2. Complete el formulario con los datos del cliente:",
        styles['LaLunaBody']
    ))
    bullets = [
        "Nombre completo",
        "Correo electrónico",
        "Teléfono",
        "Número de personas",
        "Hora deseada",
        "Notas especiales (opcional)",
    ]
    for b in bullets:
        story.append(Paragraph(f"   • {b}", styles['LaLunaBullet']))
    story.append(Paragraph(
        "3. El sistema asignará automáticamente una mesa disponible según la capacidad",
        styles['LaLunaBody']
    ))
    story.append(Paragraph(
        "4. Se enviará un correo de confirmación al cliente",
        styles['LaLunaBody']
    ))
    
    story.append(Paragraph("Reservación por Cliente (Formulario Público):", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "Los clientes pueden reservar directamente visitando:",
        styles['LaLunaBody']
    ))
    story.append(Spacer(1, 10))
    
    url_table = Table([['coyolnosara.com/laluna/reserve']], colWidths=[5*inch])
    url_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIMESTONE),
        ('TEXTCOLOR', (0, 0), (-1, -1), TERRACOTTA),
        ('FONTNAME', (0, 0), (-1, -1), 'Courier-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOX', (0, 0), (-1, -1), 2, TERRACOTTA),
    ]))
    story.append(url_table)
    
    story.append(PageBreak())
    
    # === MANAGING TABLES ===
    story.append(Paragraph("4. Gestión de Mesas", styles['LaLunaHeading']))
    
    story.append(Paragraph("Asignar Mesa a Reservación:", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "1. En la lista de reservaciones, haga clic en una reservación sin mesa asignada",
        styles['LaLunaBody']
    ))
    story.append(Paragraph(
        "2. En el plano, haga clic en la mesa deseada (debe estar disponible)",
        styles['LaLunaBody']
    ))
    story.append(Paragraph(
        "3. La reservación quedará vinculada a esa mesa",
        styles['LaLunaBody']
    ))
    
    story.append(Paragraph("Cambiar Estado de Mesa:", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "Haga clic en una mesa ocupada para ver las opciones:",
        styles['LaLunaBody']
    ))
    bullets = [
        "<b>Sentar:</b> Marcar al cliente como sentado",
        "<b>Liberar:</b> Marcar mesa como disponible (cliente se fue)",
        "<b>Cambiar mesa:</b> Mover reservación a otra mesa",
    ]
    for b in bullets:
        story.append(Paragraph(f"• {b}", styles['LaLunaBullet']))
    
    story.append(Paragraph("Zonas del Restaurante:", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "Use las pestañas en la parte superior del plano para cambiar entre zonas. "
        "La Luna cuenta con áreas interiores y exteriores con vista al mar.",
        styles['LaLunaBody']
    ))
    
    story.append(PageBreak())
    
    # === NAVIGATION ===
    story.append(Paragraph("5. Navegación del Sistema", styles['LaLunaHeading']))
    story.append(Paragraph(
        "La barra lateral izquierda contiene los siguientes accesos:",
        styles['LaLunaBody']
    ))
    
    nav_data = [
        ['Icono', 'Sección', 'Función'],
        ['▦', 'Dashboard', 'Panel principal con reservaciones y plano'],
        ['⬡', 'Floor Plan', 'Configuración del plano de mesas'],
        ['👥', 'Guests', 'Base de datos de clientes'],
        ['⚙', 'Settings', 'Configuración de turnos y horarios'],
    ]
    nav_table = Table(nav_data, colWidths=[0.8*inch, 1.5*inch, 3.5*inch])
    nav_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TERRACOTTA),
        ('TEXTCOLOR', (0, 0), (-1, 0), ALASKA_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, SAND),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ]))
    story.append(nav_table)
    
    story.append(Paragraph("Navegación por Fecha:", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "Use las flechas ← → junto a la fecha para ver reservaciones de otros días. "
        "El sistema siempre muestra el día actual por defecto al ingresar.",
        styles['LaLunaBody']
    ))
    
    story.append(Paragraph("Filtro por Hora:", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "Use el selector de hora para ver disponibilidad en un momento específico. "
        "Útil para planificar la distribución de mesas durante turnos ocupados.",
        styles['LaLunaBody']
    ))
    
    story.append(PageBreak())
    
    # === TIPS ===
    story.append(Paragraph("6. Consejos y Mejores Prácticas", styles['LaLunaHeading']))
    
    bullets = [
        "<b>Revise el sistema cada mañana</b> para ver las reservaciones del día",
        "<b>Confirme por teléfono</b> reservaciones grandes (6+ personas)",
        "<b>Use las notas</b> para recordar preferencias del cliente (alergias, cumpleaños, etc.)",
        "<b>Mantenga actualizado el estado</b> de las mesas en tiempo real",
        "<b>Para atardeceres:</b> Priorice mesas con vista al mar para reservaciones de 5-7pm",
    ]
    for b in bullets:
        story.append(Paragraph(f"• {b}", styles['LaLunaBullet']))
    
    story.append(Spacer(1, 30))
    story.append(Paragraph("Soporte", styles['LaLunaHeading2']))
    story.append(Paragraph(
        "Para asistencia técnica o preguntas sobre el sistema, contacte a la administración.",
        styles['LaLunaBody']
    ))
    
    # Build PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF generado: {OUTPUT_PATH}")

if __name__ == '__main__':
    build_pdf()
