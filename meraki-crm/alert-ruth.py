#!/usr/bin/env python3
"""
Alert Ruth when hot leads come in
Sends via Telegram (or WhatsApp via OpenClaw)
"""

import subprocess
import json
import sys

# Ruth's contact info
RUTH_PHONE = "+50688741745"
RUTH_TELEGRAM = None  # Add if she has Telegram

def send_telegram_alert(message):
    """Send alert via OpenClaw Telegram"""
    # This would use OpenClaw's messaging if configured
    pass

def send_imessage_alert(message):
    """Send alert via iMessage (macOS)"""
    script = f'''
    tell application "Messages"
        set targetService to 1st account whose service type = iMessage
        set targetBuddy to participant "{RUTH_PHONE}" of targetService
        send "{message}" to targetBuddy
    end tell
    '''
    subprocess.run(['osascript', '-e', script], capture_output=True)

def format_hot_lead_alert(guest):
    """Format a hot lead alert message"""
    message = f"""🔥 HOT LEAD - Mar Azul

Name: {guest.get('name', 'Unknown')}
Email: {guest.get('email', 'N/A')}
Phone: {guest.get('phone', 'N/A')}
City: {guest.get('city', 'Unknown')}
Score: {guest.get('lead_score', 0)}
Source: {guest.get('source', 'Unknown').title()} Restaurant

Action: Contact within 24h
"""
    return message

def alert_ruth(guest):
    """Send hot lead alert to Ruth"""
    message = format_hot_lead_alert(guest)
    
    print(f"Alerting Ruth about: {guest.get('name', 'Unknown')}")
    
    # Try iMessage first (macOS)
    try:
        send_imessage_alert(message)
        print("  Sent via iMessage")
    except Exception as e:
        print(f"  iMessage failed: {e}")
    
    # Log the alert
    log_alert(guest, message)

def log_alert(guest, message):
    """Log alert for tracking"""
    import os
    from datetime import datetime
    
    log_dir = os.path.expanduser("~/.openclaw/workspace/meraki-crm/logs")
    os.makedirs(log_dir, exist_ok=True)
    
    log_file = os.path.join(log_dir, f"alerts-{datetime.now().strftime('%Y-%m')}.jsonl")
    
    entry = {
        'timestamp': datetime.now().isoformat(),
        'guest_email': guest.get('email'),
        'guest_name': guest.get('name'),
        'score': guest.get('lead_score'),
        'city': guest.get('city'),
        'source': guest.get('source'),
    }
    
    with open(log_file, 'a') as f:
        f.write(json.dumps(entry) + '\n')

if __name__ == "__main__":
    # Test with sample lead
    test_guest = {
        'name': 'John Smith',
        'email': 'john@example.com',
        'phone': '+1-212-555-1234',
        'city': 'New York',
        'lead_score': 55,
        'source': 'laluna',
    }
    
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        alert_ruth(test_guest)
    else:
        print("Usage: python3 alert-ruth.py --test")
        print("Or import and call alert_ruth(guest_dict)")
