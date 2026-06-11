from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import datetime

def generate_report(data, filename="plant_report.pdf"):
    """
    Generates a professional, beautifully styled agricultural analysis report.
    """
    # Create the document with standard letter size and 0.75-inch margins
    pdf = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom colors matching the platform branding
    PRIMARY_COLOR = colors.HexColor("#15803d")   # Forest green
    SECONDARY_COLOR = colors.HexColor("#0f172a") # Slate black
    LIGHT_BG = colors.HexColor("#f8fafc")        # Slate light
    TEXT_COLOR = colors.HexColor("#334155")      # Muted text
    
    # Custom styles
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY_COLOR,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'ReportSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=15
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=SECONDARY_COLOR,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=TEXT_COLOR
    )
    
    body_bold = ParagraphStyle(
        'ReportBodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    bullet_style = ParagraphStyle(
        'ReportBullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    content = []
    
    # 1. Header Banner
    header_data = [
        [
            Paragraph("🌱 VERDAI", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=18, textColor=colors.white)),
            Paragraph(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}<br/>ID: AID-{datetime.now().strftime('%m%d%H%M')}", ParagraphStyle('H2', fontName='Helvetica', fontSize=9, textColor=colors.white, alignment=2))
        ]
    ]
    header_table = Table(header_data, colWidths=[250, 254])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), PRIMARY_COLOR),
        ('PADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 14),
    ]))
    content.append(header_table)
    content.append(Spacer(1, 15))
    
    # 2. Main Title
    content.append(Paragraph("Agricultural Health Diagnosis Report", title_style))
    content.append(Paragraph("AI-Powered Plant Disease Detection & Crop Intelligence Advisory", subtitle_style))
    content.append(Spacer(1, 10))
    
    # 3. Quick Summary Cards Table
    disease_display = data.get("Disease", "N/A").replace("___", " - ").replace("_", " ")
    confidence_display = data.get("Confidence", "N/A")
    severity_display = data.get("Severity", "Moderate")
    risk_display = data.get("Risk", "Medium")
    
    # Risk and Severity colors
    sev_color = "#dc2626" if severity_display.lower() == "severe" else "#ea580c" if severity_display.lower() == "moderate" else "#15803d"
    risk_color = "#dc2626" if risk_display.lower() == "high" else "#ea580c" if risk_display.lower() == "medium" else "#15803d"
    
    card_data = [
        [
            Paragraph("<b>Target Diagnosis</b>", body_style),
            Paragraph(f"<b>{disease_display}</b>", ParagraphStyle('DiseaseText', parent=body_style, textColor=PRIMARY_COLOR, fontSize=11))
        ],
        [
            Paragraph("Detection Confidence", body_style),
            Paragraph(f"<b>{confidence_display}</b>", body_style)
        ],
        [
            Paragraph("Severity Assessment", body_style),
            Paragraph(f"<font color='{sev_color}'><b>{severity_display}</b></font>", body_style)
        ],
        [
            Paragraph("Fungal Spread Risk", body_style),
            Paragraph(f"<font color='{risk_color}'><b>{risk_display}</b></font>", body_style)
        ]
    ]
    
    summary_table = Table(card_data, colWidths=[200, 304])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    content.append(summary_table)
    content.append(Spacer(1, 15))
    
    # 4. Diagnostic & Agronomic Details
    content.append(Paragraph("Diagnostic Overview & Causes", section_heading))
    cause_text = data.get("Cause", "Environmental triggers combined with fungal pathogens present in crop residues.")
    content.append(Paragraph(cause_text, body_style))
    content.append(Spacer(1, 12))
    
    # 5. Treatment Plan
    content.append(Paragraph("Recommended Treatment & Advisory", section_heading))
    treatment_display = data.get("Treatment", "Clean up infected leaves, improve ventilation, and apply copper fungicide.")
    
    treatment_steps = [t.strip() for t in treatment_display.split(".") if t.strip()]
    if not treatment_steps:
        treatment_steps = ["Apply agronomic sprays.", "Monitor crop health weekly."]
        
    treatment_bullet_data = []
    for step in treatment_steps:
        treatment_bullet_data.append([
            Paragraph("•", body_bold),
            Paragraph(step + ".", body_style)
        ])
        
    treatment_table = Table(treatment_bullet_data, colWidths=[15, 489])
    treatment_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    content.append(treatment_table)
    content.append(Spacer(1, 12))
    
    # 6. Climate & Irrigation Advisory
    content.append(Paragraph("Weather & Irrigation Advisory", section_heading))
    temp_val = data.get("Temperature", "28°C")
    humidity_val = data.get("Humidity", "75%")
    irrigation_display = data.get("Irrigation", "Maintain moderate soil moisture. Avoid overhead spraying to reduce leaf wetness.")
    
    weather_info = f"Current temperature is <b>{temp_val}</b> with humidity level of <b>{humidity_val}</b>. Under these conditions: "
    content.append(Paragraph(weather_info, body_style))
    content.append(Spacer(1, 6))
    content.append(Paragraph(f"<b>Irrigation Guideline</b>: {irrigation_display}", body_style))
    content.append(Spacer(1, 15))
    
    # 7. Disclaimer Footer
    content.append(Spacer(1, 25))
    disclaimer_text = (
        "<i>Disclaimer: This report is generated by the VerdAI intelligence engine utilizing computer vision models. "
        "Recommendations are advisors only. For critical crop management, please consult local extension agents or agricultural path experts.</i>"
    )
    content.append(Paragraph(disclaimer_text, ParagraphStyle('DisclaimerText', parent=body_style, fontSize=8, textColor=colors.HexColor("#94a3b8"), alignment=1)))
    
    pdf.build(content)