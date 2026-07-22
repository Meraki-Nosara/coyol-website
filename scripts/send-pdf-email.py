import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

# Gmail SMTP for coyolcontrol
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER = "coyolcontrol@gmail.com"

# App password for coyolcontrol
password = "nyhbxmmdotuiwtvj"

# Create message
msg = MIMEMultipart()
msg['From'] = SENDER
msg['To'] = "marion@nosaraconstruction.com"
msg['Subject'] = "Amanda — Casa Cacao at Lot 18 (Personalized PDF)"

body = """Hi Marion,

Here's Amanda's personalized PDF for Ruth's meeting tomorrow.

Includes:
- Casa Cacao render as hero image
- Floor plan with specs (215 sqm indoor, 63 sqm covered terraces, etc.)
- Lot 18: $420,000
- Construction: $1,530,000  
- Total: $1,950,000
- 6 milestone payments breakdown ($255K each)
- Full buyer journey steps
- Coyol Control portal features

Ready to send to Ruth!
"""

msg.attach(MIMEText(body, 'plain'))

# Attach PDF
pdf_path = os.path.expanduser("~/.openclaw/workspace/projects/mar-azul/amanda-casa-cacao.pdf")
with open(pdf_path, 'rb') as f:
    attach = MIMEApplication(f.read(), _subtype='pdf')
    attach.add_header('Content-Disposition', 'attachment', filename='Amanda-Casa-Cacao-Lot18.pdf')
    msg.attach(attach)

# Send
try:
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(SENDER, password)
    server.sendmail(SENDER, "marion@nosaraconstruction.com", msg.as_string())
    server.quit()
    print("Email sent successfully!")
except Exception as e:
    print(f"Error: {e}")
