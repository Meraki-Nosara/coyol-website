# OpenClaw + Meraki Control — Recovery Guide

If your Mac crashes, gets stolen, or needs to be wiped, follow these steps to restore everything.

---

## What's Backed Up

Daily backups go to **Google Drive → Meraki-Control** and include:
- All Meraki sales/expenses data
- Dashboard code and configuration
- OpenClaw settings and memory
- Conversation history

---

## Recovery Steps

### 1. Set Up a New Mac (if needed)

Install basics:
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@22
```

### 2. Install OpenClaw

```bash
npm install -g openclaw
```

### 3. Download Backup from Google Drive

1. Sign into Google Drive (marionnosara@gmail.com)
2. Find folder: **Meraki-Control**
3. Download the entire folder

### 4. Restore Files

```bash
# Create OpenClaw directory
mkdir -p ~/.openclaw

# Copy backup contents (adjust path to your Downloads)
cp -r ~/Downloads/Meraki-Control/* ~/.openclaw/
```

### 5. Start OpenClaw Gateway

```bash
openclaw gateway start
```

### 6. Verify Everything Works

```bash
# Check gateway is running
openclaw gateway status

# Check workspace
ls ~/.openclaw/workspace/
```

---

## Key Accounts & Credentials

| Service | Account | Notes |
|---------|---------|-------|
| GitHub | Meraki-Nosara | Dashboard repo |
| DigitalOcean | Marion's account | Hosts dashboard |
| Google Drive | marionnosara@gmail.com | Backups |
| Gmail (Himalaya) | marionnosara@gmail.com | Email access |
| AgentMail | marion@agentmail.to | API key in TOOLS.md |

---

## Dashboard Deployment

The dashboard auto-deploys from GitHub to DigitalOcean:
- **Repo**: github.com/Meraki-Nosara/meraki-control
- **URL**: https://meraki.livingnosara.com
- **Login**: Angelina / masro

If you need to redeploy manually:
```bash
cd ~/.openclaw/workspace/meraki-control
git push origin main
```

---

## Email Forwarding

These Gmail accounts forward to marionnosara@gmail.com:
- merakifamilylimitada@gmail.com (facturas)
- merakinosara@gmail.com (bank fees)

If forwarding stops, re-confirm in Gmail Settings → Forwarding.

---

## Daily Backup Schedule

Automatic backup runs at **3:00 AM** daily.

To run manually:
```bash
~/.openclaw/scripts/backup-to-gdrive.sh
```

You'll get a macOS notification when complete.

---

## Support

- OpenClaw docs: https://docs.openclaw.ai
- OpenClaw Discord: https://discord.com/invite/clawd
- GitHub issues: https://github.com/openclaw/openclaw

---

*Last updated: April 6, 2026*
