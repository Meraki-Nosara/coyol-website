#!/bin/bash
# Daily Reservation Reminder Emails
# Runs at 8am Costa Rica time via crontab

cd ~/.openclaw/workspace/scripts
npx ts-node send-daily-reminders.ts >> /tmp/daily-reminders.log 2>&1
