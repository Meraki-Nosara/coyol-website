#!/bin/bash
# Send pending Coyol gift card emails via himalaya

SUPABASE_URL="https://mnxjzvqgrrodalcmtntf.supabase.co"
SUPABASE_KEY="sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng"

# Get pending gift cards
PENDING=$(curl -s "${SUPABASE_URL}/rest/v1/coyol_gift_cards?status=eq.pending_email&select=*" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}")

echo "$PENDING" | jq -c '.[]' | while read -r card; do
  CODE=$(echo "$card" | jq -r '.code')
  AMOUNT=$(echo "$card" | jq -r '.amount')
  RECIPIENT_NAME=$(echo "$card" | jq -r '.recipient_name')
  RECIPIENT_EMAIL=$(echo "$card" | jq -r '.recipient_email')
  SENDER_NAME=$(echo "$card" | jq -r '.sender_name')
  SENDER_EMAIL=$(echo "$card" | jq -r '.sender_email')
  MESSAGE=$(echo "$card" | jq -r '.message // ""')

  echo "Sending Coyol gift card $CODE (\$$AMOUNT) to $RECIPIENT_EMAIL..."
  
  # Create recipient email
  cat << EOF > /tmp/coyol-gift-recipient-${CODE}.mml
From: Coyol Restaurant <reservations@coyolrestaurant.com>
To: ${RECIPIENT_EMAIL}
Subject: You have received a Coyol Gift Card from ${SENDER_NAME}
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #1A1F16; font-family: Georgia, serif;">
  <table width="100%" style="background-color: #1A1F16; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" style="max-width: 500px;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: #C4A67C; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 4px;">COYOL</h1>
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Nosara, Costa Rica</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="background: linear-gradient(135deg, #3D4F3D 0%, #4A5D4A 100%); border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
                <p style="color: #C4A67C; font-size: 14px; letter-spacing: 2px; margin: 0;">GIFT CARD</p>
                <p style="color: white; font-size: 56px; font-weight: bold; margin: 10px 0;">\$${AMOUNT}</p>
                <p style="color: white; font-size: 20px; letter-spacing: 3px; margin: 0;">${CODE}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 0;">
              <p style="color: #F5F3EF; font-size: 18px; margin: 0 0 10px 0;">Dear ${RECIPIENT_NAME},</p>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                ${SENDER_NAME} has gifted you a dining experience at Coyol Restaurant.
              </p>
EOF

  if [ -n "$MESSAGE" ] && [ "$MESSAGE" != "null" ]; then
    cat << EOF >> /tmp/coyol-gift-recipient-${CODE}.mml
              <p style="color: #C4A67C; font-style: italic; font-size: 16px; margin: 20px 0; padding: 15px; border-left: 3px solid #C4A67C;">
                "${MESSAGE}"
              </p>
EOF
  fi

  cat << EOF >> /tmp/coyol-gift-recipient-${CODE}.mml
            </td>
          </tr>
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px;">
              <h3 style="color: #C4A67C; font-size: 16px; margin: 0 0 15px 0; font-weight: normal;">How to Redeem</h3>
              <ol style="color: #F5F3EF; opacity: 0.9; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Visit Coyol Restaurant in Guiones, Nosara</li>
                <li>Show this email or mention code: <strong>${CODE}</strong></li>
                <li>Enjoy your meal</li>
              </ol>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="https://coyolnosara.com" style="display: inline-block; background-color: #C4A67C; color: #1A1F16; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Book a Table</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #F5F3EF; opacity: 0.5; font-size: 12px; margin: 0;">
                Coyol Restaurant<br>
                Guiones, Nosara, Costa Rica<br>
                +506 2682-1382
              </p>
              <p style="color: #F5F3EF; opacity: 0.35; font-size: 10px; margin: 15px 0 0 0; line-height: 1.5;">
                Gift cards are non-refundable and cannot be exchanged for cash.<br>
                Lost or stolen cards cannot be replaced. Gratuity not included.<br>
                Valid only at Coyol Restaurant. No expiration date.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
EOF

  # Send recipient email
  cat "/tmp/coyol-gift-recipient-${CODE}.mml" | himalaya message send -a coyol-restaurant
  
  # Create sender confirmation
  cat << EOF > /tmp/coyol-gift-sender-${CODE}.mml
From: Coyol Restaurant <reservations@coyolrestaurant.com>
To: ${SENDER_EMAIL}
Subject: Your Coyol Gift Card Purchase - ${CODE}
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #1A1F16; font-family: Georgia, serif;">
  <table width="100%" style="background-color: #1A1F16; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" style="max-width: 500px;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: #C4A67C; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 4px;">COYOL</h1>
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Gift Card Confirmation</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 30px;">
              <h2 style="color: #F5F3EF; font-size: 22px; margin: 0 0 15px 0; font-weight: normal;">Thank you for your purchase</h2>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                Your Coyol gift card has been sent to ${RECIPIENT_NAME} at ${RECIPIENT_EMAIL}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px;">
              <table width="100%" style="font-size: 14px; color: #F5F3EF;">
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Gift Card Code</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${CODE}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Amount</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">\$${AMOUNT}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7;">Recipient</td>
                  <td style="padding: 8px 0; text-align: right;">${RECIPIENT_NAME}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="https://coyolnosara.com" style="display: inline-block; background-color: #C4A67C; color: #1A1F16; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Book a Table</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #F5F3EF; opacity: 0.5; font-size: 12px; margin: 0;">
                Coyol Restaurant<br>
                Guiones, Nosara, Costa Rica
              </p>
              <p style="color: #F5F3EF; opacity: 0.35; font-size: 10px; margin: 15px 0 0 0; line-height: 1.5;">
                Gift cards are non-refundable and cannot be exchanged for cash.<br>
                Lost or stolen cards cannot be replaced. Gratuity not included.<br>
                Valid only at Coyol Restaurant. No expiration date.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
EOF

  # Send sender confirmation
  cat "/tmp/coyol-gift-sender-${CODE}.mml" | himalaya message send -a coyol-restaurant
  
  # Update status in Supabase
  curl -s -X PATCH "${SUPABASE_URL}/rest/v1/coyol_gift_cards?code=eq.${CODE}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"status": "sent", "sent_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  
  echo "Done with ${CODE}"
done

echo "All Coyol gift card emails processed."
