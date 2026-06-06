import subprocess
import time
import json
import os

TEMPLATE_PATH = "/Users/Coyol/.openclaw/workspace/coyol-website/emails/gift-card-announcement-v23-FINAL.html"
UNSENT_PATH = "/Users/Coyol/.openclaw/workspace/scripts/unsent-emails.json"
SENT_PATH = "/Users/Coyol/.openclaw/workspace/scripts/already-sent.txt"
TODAY = time.strftime("%Y-%m-%d")
SENT_TODAY_PATH = f"/Users/Coyol/.openclaw/workspace/scripts/sent-today-{TODAY}.txt"
LOG_PATH = "/Users/Coyol/.openclaw/workspace/scripts/campaign-log.txt"

BATCH_SIZE = 400
DELAY = 20  # seconds between emails

# Load template
with open(TEMPLATE_PATH) as f:
    html = f.read()

# Load unsent
with open(UNSENT_PATH) as f:
    unsent = json.load(f)

# Load already sent
sent_set = set()
if os.path.exists(SENT_PATH):
    with open(SENT_PATH) as f:
        sent_set = set(line.strip().lower() for line in f if line.strip())

# Filter and limit
to_send = [e for e in unsent if e.lower() not in sent_set][:BATCH_SIZE]

print(f"Starting campaign: {len(to_send)} emails")
print(f"Delay: {DELAY} seconds between emails")
print(f"Estimated time: {len(to_send) * DELAY / 60:.0f} minutes")
print("")

count = 0
success = 0
failed = 0

for email in to_send:
    count += 1
    print(f"[{count}/{len(to_send)}] {email}...", end=" ", flush=True)
    
    msg = f"""From: Coyol Group <coyolcontrol@gmail.com>
To: {email}
Subject: A Gift for Someone Special — e-Gift Cards Now Available
Content-Type: text/html; charset=utf-8

{html}"""
    
    try:
        proc = subprocess.run(
            ["himalaya", "message", "send", "-a", "coyol"],
            input=msg,
            capture_output=True,
            text=True,
            timeout=60
        )
        if proc.returncode == 0 or "successfully" in proc.stdout.lower():
            print("✓")
            success += 1
            with open(SENT_PATH, "a") as f:
                f.write(email.lower() + "\n")
            with open(SENT_TODAY_PATH, "a") as f:
                f.write(email + "\n")
        else:
            print(f"✗")
            failed += 1
    except Exception as e:
        print(f"✗ {str(e)[:30]}")
        failed += 1
    
    # Log progress
    with open(LOG_PATH, "a") as f:
        f.write(f"{time.strftime('%H:%M:%S')} [{count}] {email}\n")
    
    if count < len(to_send):
        time.sleep(DELAY)

print(f"\n=== DONE ===")
print(f"Sent: {success}")
print(f"Failed: {failed}")
