#!/bin/bash
# Send gift card emails via Gmail SMTP (500/day limit)

TEMPLATE="/Users/Coyol/.openclaw/workspace/coyol-website/emails/gift-card-announcement-v23-FINAL.html"
UNSENT="/Users/Coyol/.openclaw/workspace/scripts/unsent-emails.json"
SENT="/Users/Coyol/.openclaw/workspace/scripts/already-sent.txt"
DAILY_LIMIT=500
DELAY=3  # seconds between emails

# Get today's count
TODAY=$(date +%Y-%m-%d)
SENT_TODAY_FILE="/Users/Coyol/.openclaw/workspace/scripts/sent-today-${TODAY}.txt"
touch "$SENT_TODAY_FILE"
SENT_TODAY=$(wc -l < "$SENT_TODAY_FILE" | tr -d ' ')

echo "=== Gift Card Email Campaign (Gmail) ==="
echo "Date: $TODAY"
echo "Sent today: $SENT_TODAY / $DAILY_LIMIT"

if [ "$SENT_TODAY" -ge "$DAILY_LIMIT" ]; then
    echo "Daily limit reached. Try again tomorrow."
    exit 0
fi

REMAINING=$((DAILY_LIMIT - SENT_TODAY))
echo "Will send: $REMAINING emails"
echo ""

# Send emails one by one
python3 << 'PYEOF'
import json
import subprocess
import time
import os

TEMPLATE = "/Users/Coyol/.openclaw/workspace/coyol-website/emails/gift-card-announcement-v23-FINAL.html"
UNSENT = "/Users/Coyol/.openclaw/workspace/scripts/unsent-emails.json"
SENT = "/Users/Coyol/.openclaw/workspace/scripts/already-sent.txt"
TODAY = time.strftime("%Y-%m-%d")
SENT_TODAY_FILE = f"/Users/Coyol/.openclaw/workspace/scripts/sent-today-{TODAY}.txt"
DAILY_LIMIT = 500
DELAY = 3

# Load template
with open(TEMPLATE) as f:
    html = f.read()

# Load unsent
with open(UNSENT) as f:
    unsent = json.load(f)

# Load already sent
sent_set = set()
if os.path.exists(SENT):
    with open(SENT) as f:
        sent_set = set(line.strip().lower() for line in f)

# Load sent today
sent_today = 0
if os.path.exists(SENT_TODAY_FILE):
    with open(SENT_TODAY_FILE) as f:
        sent_today = len([l for l in f if l.strip()])

remaining = DAILY_LIMIT - sent_today
to_send = [e for e in unsent if e.lower() not in sent_set][:remaining]

print(f"Sending {len(to_send)} emails...")

count = 0
for email in to_send:
    count += 1
    print(f"[{count}/{len(to_send)}] {email}...", end=" ", flush=True)
    
    msg = f"""From: Coyol Restaurant <reservations@coyolrestaurant.com>
To: {email}
Subject: A Gift for Someone Special — e-Gift Cards Now Available
Content-Type: text/html; charset=utf-8

{html}"""
    
    try:
        proc = subprocess.run(
            ["himalaya", "message", "send", "-a", "coyol-restaurant"],
            input=msg,
            capture_output=True,
            text=True,
            timeout=30
        )
        if proc.returncode == 0:
            print("✓")
            with open(SENT, "a") as f:
                f.write(email.lower() + "\n")
            with open(SENT_TODAY_FILE, "a") as f:
                f.write(email + "\n")
        else:
            print(f"✗ {proc.stderr[:50]}")
    except Exception as e:
        print(f"✗ {e}")
    
    time.sleep(DELAY)

# Update unsent
with open(SENT) as f:
    sent_set = set(line.strip().lower() for line in f)
remaining_unsent = [e for e in unsent if e.lower() not in sent_set]
with open(UNSENT, "w") as f:
    json.dump(remaining_unsent, f)

print(f"\nDone! {len(remaining_unsent)} emails remaining in queue.")
PYEOF
