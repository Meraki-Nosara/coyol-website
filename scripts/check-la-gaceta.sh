#!/bin/bash
# La Gaceta Daily Monitor
# Checks for mentions of Marion's properties and legal cases

DATE=$(date +%Y/%m/%d)
DATE_FORMATTED=$(date +%d_%m_%Y)
PDF_URL="https://www.imprentanacional.go.cr/pub/${DATE}/COMP_${DATE_FORMATTED}.pdf"
OUTPUT_DIR="$HOME/.openclaw/workspace/memory/la-gaceta"
PDF_FILE="${OUTPUT_DIR}/gaceta-$(date +%Y-%m-%d).pdf"
TEXT_FILE="${OUTPUT_DIR}/gaceta-$(date +%Y-%m-%d).txt"

# Keywords to search for (case-insensitive)
KEYWORDS="SFERA|Mar Azul|Maryon Peri|Marion Peri|La Luna Nosara|ZMT Nosara|Zona Marítimo Terrestre Nosara|137600021710|26-000076-1632"

mkdir -p "$OUTPUT_DIR"

echo "=== La Gaceta Monitor - $(date +%Y-%m-%d) ==="

# Download PDF
curl -s -o "$PDF_FILE" "$PDF_URL"

if [ ! -f "$PDF_FILE" ] || [ ! -s "$PDF_FILE" ]; then
  echo "❌ No La Gaceta available for today yet"
  exit 1
fi

echo "✓ Downloaded today's edition"

# Extract text
pdftotext "$PDF_FILE" "$TEXT_FILE" 2>/dev/null

if [ ! -f "$TEXT_FILE" ]; then
  echo "❌ Failed to extract text"
  exit 1
fi

# Search for keywords
echo ""
echo "=== KEYWORD SEARCH ==="

MATCHES=$(grep -iE "$KEYWORDS" "$TEXT_FILE" 2>/dev/null)

if [ -n "$MATCHES" ]; then
  echo "🔴 ALERT: Found mentions!"
  echo ""
  echo "$MATCHES" | head -30
  echo ""
  echo "---"
  echo "Full PDF: $PDF_FILE"
  exit 2  # Exit code 2 = found matches, alert Marion
else
  echo "✅ No relevant mentions today"
  exit 0
fi
