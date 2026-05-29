#!/bin/bash
# Send pending gift card emails via himalaya

SUPABASE_URL="https://mnxjzvqgrrodalcmtntf.supabase.co"
SUPABASE_KEY="sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng"

# Get pending gift cards
PENDING=$(curl -s "${SUPABASE_URL}/rest/v1/laluna_gift_cards?status=eq.pending_email&select=*" \
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
  
  # Determine tier
  if [ "$AMOUNT" -ge 200 ]; then
    TIER="Platinum"
    TIER_COLOR="#3D4F3D"
  elif [ "$AMOUNT" -ge 150 ]; then
    TIER="Gold"
    TIER_COLOR="#C4A67C"
  elif [ "$AMOUNT" -ge 100 ]; then
    TIER="Silver"
    TIER_COLOR="#8E9196"
  else
    TIER="Classic"
    TIER_COLOR="#A65D3F"
  fi
  
  # Create recipient email
  cat << EOF > /tmp/gift-recipient-${CODE}.mml
From: La Luna Restaurant <reservations@lalunanosara.com>
To: ${RECIPIENT_EMAIL}
Subject: You have received a La Luna Gift Card from ${SENDER_NAME}
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
              <h1 style="color: #C4A67C; font-size: 28px; margin: 0; font-weight: normal; font-style: italic;">La Luna</h1>
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Nosara, Costa Rica</p>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" style="background: ${TIER_COLOR}; border-radius: 16px;">
                <tr>
                  <td style="padding: 40px; text-align: center;">
                    <p style="color: #F5F3EF; opacity: 0.8; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 20px 0;">${TIER} Gift Card</p>
                    <p style="color: #F5F3EF; font-size: 48px; font-weight: bold; margin: 0;">\$${AMOUNT}</p>
                    <p style="color: #F5F3EF; opacity: 0.9; font-size: 14px; margin: 20px 0 0 0; letter-spacing: 2px;">${CODE}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 0;">
              <p style="color: #F5F3EF; font-size: 18px; margin: 0 0 10px 0;">Dear ${RECIPIENT_NAME},</p>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                ${SENDER_NAME} has gifted you a dining experience at La Luna Restaurant.
              </p>
EOF

  if [ -n "$MESSAGE" ] && [ "$MESSAGE" != "null" ]; then
    cat << EOF >> /tmp/gift-recipient-${CODE}.mml
              <p style="color: #C4A67C; font-style: italic; font-size: 16px; margin: 20px 0; padding: 15px; border-left: 3px solid #C4A67C;">
                "${MESSAGE}"
              </p>
EOF
  fi

  cat << EOF >> /tmp/gift-recipient-${CODE}.mml
            </td>
          </tr>
          <tr>
            <td style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px;">
              <h3 style="color: #C4A67C; font-size: 16px; margin: 0 0 15px 0; font-weight: normal;">How to Redeem</h3>
              <ol style="color: #F5F3EF; opacity: 0.9; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Visit La Luna Restaurant in Guiones, Nosara</li>
                <li>Show this email or mention code: <strong>${CODE}</strong></li>
                <li>Enjoy your meal</li>
              </ol>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="https://lalunanosara.com" style="display: inline-block; background-color: #C4A67C; color: #1A1F16; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Book a Table</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #F5F3EF; opacity: 0.5; font-size: 12px; margin: 0;">
                La Luna Restaurant<br>
                Guiones, Nosara, Costa Rica<br>
                +506 8855-9146
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
  echo "Sending gift card email to ${RECIPIENT_EMAIL}..."
  cat "/tmp/gift-recipient-${CODE}.mml" | himalaya message send -a laluna-restaurant
  
  # Create sender confirmation
  cat << EOF > /tmp/gift-sender-${CODE}.mml
From: La Luna Restaurant <reservations@lalunanosara.com>
To: ${SENDER_EMAIL}
Subject: Your La Luna Gift Card Purchase - ${CODE}
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
              <h1 style="color: #C4A67C; font-size: 28px; margin: 0; font-weight: normal; font-style: italic;">La Luna</h1>
              <p style="color: #F5F3EF; opacity: 0.7; margin: 5px 0 0 0; font-size: 14px;">Gift Card Confirmation</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 30px;">
              <h2 style="color: #F5F3EF; font-size: 22px; margin: 0 0 15px 0; font-weight: normal;">Thank you for your purchase</h2>
              <p style="color: #F5F3EF; opacity: 0.9; font-size: 16px; line-height: 1.6; margin: 0;">
                Your La Luna gift card has been sent to ${RECIPIENT_NAME} at ${RECIPIENT_EMAIL}.
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
              <a href="https://lalunanosara.com" style="display: inline-block; background-color: #C4A67C; color: #1A1F16; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">Book a Table</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #F5F3EF; opacity: 0.5; font-size: 12px; margin: 0;">
                La Luna Restaurant<br>
                Guiones, Nosara, Costa Rica
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
  echo "Sending confirmation to ${SENDER_EMAIL}..."
  cat "/tmp/gift-sender-${CODE}.mml" | himalaya message send -a laluna-restaurant
  
  # Update status in Supabase
  curl -s -X PATCH "${SUPABASE_URL}/rest/v1/laluna_gift_cards?code=eq.${CODE}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"status": "sent", "sent_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  
  echo "Done with ${CODE}"
done

echo "All gift card emails processed."
