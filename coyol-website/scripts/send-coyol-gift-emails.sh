#!/bin/bash
# Send pending Coyol gift card emails via himalaya

SUPABASE_URL="https://mnxjzvqgrrodalcmtntf.supabase.co"
SUPABASE_KEY="sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng"

# Get pending gift cards
PENDING=$(curl -s "${SUPABASE_URL}/rest/v1/coyol_gift_cards?status=eq.pending_email&select=*" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}")

if [ "$PENDING" == "[]" ]; then
  echo "No pending Coyol gift cards."
  exit 0
fi

echo "$PENDING" | jq -c '.[]' | while read -r card; do
  ID=$(echo "$card" | jq -r '.id')
  CODE=$(echo "$card" | jq -r '.code')
  AMOUNT=$(echo "$card" | jq -r '.amount')
  RECIPIENT_NAME=$(echo "$card" | jq -r '.recipient_name')
  RECIPIENT_EMAIL=$(echo "$card" | jq -r '.recipient_email')
  SENDER_NAME=$(echo "$card" | jq -r '.sender_name')
  SENDER_EMAIL=$(echo "$card" | jq -r '.sender_email')
  MESSAGE=$(echo "$card" | jq -r '.message // ""')
  
  echo "Sending Coyol gift card $CODE ($AMOUNT) to $RECIPIENT_EMAIL..."

  # Send to recipient
  cat << EOF | himalaya message send -a coyol-restaurant
From: reservations@coyolrestaurant.com
To: ${RECIPIENT_EMAIL}
Subject: You received a \$${AMOUNT} Gift Card for Coyol Restaurant
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Georgia, serif; background: #f5f3ef; padding: 40px; margin: 0;">
<div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
  <div style="background: linear-gradient(135deg, #3D4F3D 0%, #4A5D4A 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-family: Georgia, serif;">COYOL</h1>
    <p style="color: #C4A67C; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px;">RESTAURANT - NOSARA</p>
  </div>
  <div style="padding: 40px; text-align: center;">
    <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Dear ${RECIPIENT_NAME},</p>
    <p style="color: #1a1f16; font-size: 18px; margin-bottom: 30px;">${SENDER_NAME} has sent you a gift!</p>
    <div style="background: linear-gradient(135deg, #3D4F3D 0%, #4A5D4A 100%); border-radius: 12px; padding: 30px; margin: 20px 0;">
      <p style="color: #C4A67C; font-size: 14px; letter-spacing: 2px; margin: 0;">GIFT CARD</p>
      <p style="color: white; font-size: 48px; font-weight: bold; margin: 10px 0;">\$${AMOUNT}</p>
      <p style="color: white; font-size: 20px; letter-spacing: 3px; margin: 0;">${CODE}</p>
    </div>
    $([ -n "$MESSAGE" ] && [ "$MESSAGE" != "null" ] && echo "<p style=\"color: #666; font-style: italic; margin: 20px 0;\">\"${MESSAGE}\"</p>")
    <a href="https://coyolrestaurant.com" style="display: inline-block; background: #C4A67C; color: #1a1f16; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 20px;">Book a Table</a>
    <p style="color: #888; font-size: 14px; margin-top: 30px;">Present this code when dining at Coyol Restaurant in Nosara.</p>
    <p style="color: #aaa; font-size: 10px; margin-top: 20px; line-height: 1.5;">Gift cards are non-refundable and cannot be exchanged for cash. Lost or stolen cards cannot be replaced. Gratuity not included. Valid only at Coyol Restaurant. No expiration date.</p>
  </div>
</div>
</body>
</html>
EOF

  # Send confirmation to sender
  cat << EOF | himalaya message send -a coyol-restaurant
From: reservations@coyolrestaurant.com
To: ${SENDER_EMAIL}
Subject: Your Coyol Gift Card has been delivered
Content-Type: text/html

<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; padding: 30px; background: #f5f3ef;">
<div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
  <h2 style="color: #3D4F3D; margin-top: 0;">Gift Card Delivered</h2>
  <p>Your \$${AMOUNT} Coyol Restaurant gift card has been sent to:</p>
  <p style="font-size: 18px; color: #1a1f16;"><strong>${RECIPIENT_NAME}</strong> (${RECIPIENT_EMAIL})</p>
  <p style="color: #666;">Code: <strong>${CODE}</strong></p>
  <a href="https://coyolrestaurant.com" style="display: inline-block; background: #C4A67C; color: #1a1f16; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 20px;">Book a Table</a>
  <p style="color: #888; font-size: 14px; margin-top: 20px;">Thank you for sharing the gift of great food!</p>
</div>
</body>
</html>
EOF

  # Update status to sent
  curl -s -X PATCH "${SUPABASE_URL}/rest/v1/coyol_gift_cards?id=eq.${ID}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"status": "sent"}'

  echo "Sent!"
done

echo "All Coyol gift card emails processed."
