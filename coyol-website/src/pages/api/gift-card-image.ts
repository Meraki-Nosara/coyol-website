import type { APIRoute } from 'astro';

// This endpoint generates a gift card image URL
// Supports both La Luna and Coyol restaurants

export const GET: APIRoute = async ({ url }) => {
  const code = url.searchParams.get('code') || 'LL-XXXX-XXXX';
  const amount = url.searchParams.get('amount') || '100';
  const recipientName = url.searchParams.get('name') || 'Guest';
  const restaurant = url.searchParams.get('type') || (code.startsWith('CYL') ? 'coyol' : 'laluna');
  
  const tier = getTier(parseInt(amount), restaurant);
  
  // Generate SVG gift card
  const svg = restaurant === 'coyol' 
    ? generateCoyolGiftCardSVG(code, amount, recipientName, tier)
    : generateLaLunaGiftCardSVG(code, amount, recipientName, tier);
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
};

function getTier(amount: number, restaurant: string): { name: string; gradient: string; textColor: string } {
  if (restaurant === 'coyol') {
    // Coyol uses Keswick Green palette
    if (amount >= 200) {
      return { 
        name: 'PLATINUM', 
        gradient: 'url(#coyol-platinum)',
        textColor: '#C4A67C'
      };
    } else if (amount >= 150) {
      return { 
        name: 'GOLD', 
        gradient: 'url(#coyol-gold)',
        textColor: '#1A1F16'
      };
    } else if (amount >= 100) {
      return { 
        name: 'SILVER', 
        gradient: 'url(#coyol-silver)',
        textColor: '#1A1F16'
      };
    } else {
      return { 
        name: 'CLASSIC', 
        gradient: 'url(#coyol-classic)',
        textColor: '#F5F3EF'
      };
    }
  } else {
    // La Luna uses terracotta palette
    if (amount >= 200) {
      return { 
        name: 'PLATINUM', 
        gradient: 'url(#platinum)',
        textColor: '#C4A67C'
      };
    } else if (amount >= 150) {
      return { 
        name: 'GOLD', 
        gradient: 'url(#gold)',
        textColor: '#1A1F16'
      };
    } else if (amount >= 100) {
      return { 
        name: 'SILVER', 
        gradient: 'url(#silver)',
        textColor: '#1A1F16'
      };
    } else {
      return { 
        name: 'CLASSIC', 
        gradient: 'url(#classic)',
        textColor: '#F5F3EF'
      };
    }
  }
}

function generateCoyolGiftCardSVG(code: string, amount: string, name: string, tier: { name: string; gradient: string; textColor: string }): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="380" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="coyol-classic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3D4F3D"/>
      <stop offset="100%" style="stop-color:#2A3A2A"/>
    </linearGradient>
    <linearGradient id="coyol-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A5D4A"/>
      <stop offset="30%" style="stop-color:#5D735D"/>
      <stop offset="70%" style="stop-color:#3D4F3D"/>
      <stop offset="100%" style="stop-color:#4A5D4A"/>
    </linearGradient>
    <linearGradient id="coyol-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#C4A67C"/>
      <stop offset="30%" style="stop-color:#D4B896"/>
      <stop offset="70%" style="stop-color:#A68A5B"/>
      <stop offset="100%" style="stop-color:#E5CFA9"/>
    </linearGradient>
    <linearGradient id="coyol-platinum" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A1F16"/>
      <stop offset="30%" style="stop-color:#2A3025"/>
      <stop offset="70%" style="stop-color:#1A1F16"/>
      <stop offset="100%" style="stop-color:#3D4F3D"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <!-- Card Background -->
  <rect x="20" y="20" width="560" height="340" rx="24" fill="${tier.gradient}" filter="url(#shadow)"/>
  
  <!-- Decorative circle pattern -->
  <circle cx="500" cy="280" r="120" fill="rgba(255,255,255,0.03)"/>
  <circle cx="520" cy="300" r="80" fill="rgba(255,255,255,0.02)"/>
  
  <!-- Coyol Logo Area -->
  <text x="50" y="70" font-family="Arial, sans-serif" font-size="28" font-weight="400" fill="${tier.textColor}" letter-spacing="6">COYOL</text>
  <text x="50" y="95" font-family="Arial, sans-serif" font-size="12" fill="${tier.textColor}" opacity="0.7">Nosara, Costa Rica</text>
  
  <!-- Tier Badge -->
  <text x="550" y="70" font-family="Arial, sans-serif" font-size="11" fill="${tier.textColor}" opacity="0.8" text-anchor="end" letter-spacing="3">${tier.name}</text>
  
  <!-- Amount -->
  <text x="300" y="200" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="${tier.textColor}" text-anchor="middle">$${amount}</text>
  <text x="300" y="235" font-family="Arial, sans-serif" font-size="14" fill="${tier.textColor}" opacity="0.8" text-anchor="middle">GIFT CARD</text>
  
  <!-- Recipient Name -->
  <text x="50" y="290" font-family="Arial, sans-serif" font-size="11" fill="${tier.textColor}" opacity="0.6" letter-spacing="2">FOR</text>
  <text x="50" y="315" font-family="Georgia, serif" font-size="20" fill="${tier.textColor}">${name}</text>
  
  <!-- Code -->
  <text x="550" y="315" font-family="monospace" font-size="16" fill="${tier.textColor}" opacity="0.9" text-anchor="end" letter-spacing="2">${code}</text>
  
  <!-- Palm leaf icon (simplified) -->
  <path d="M515,150 Q530,165 520,185 Q535,175 545,160 Q540,175 530,190 Q545,185 555,175" 
        stroke="${tier.textColor}" stroke-width="2" fill="none" opacity="0.15"/>
</svg>`;
}

function generateLaLunaGiftCardSVG(code: string, amount: string, name: string, tier: { name: string; gradient: string; textColor: string }): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="380" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="classic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#A65D3F"/>
      <stop offset="100%" style="stop-color:#8B4532"/>
    </linearGradient>
    <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8E9196"/>
      <stop offset="30%" style="stop-color:#B8BCC2"/>
      <stop offset="70%" style="stop-color:#6B7075"/>
      <stop offset="100%" style="stop-color:#A8ACB2"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#C4A67C"/>
      <stop offset="30%" style="stop-color:#D4B896"/>
      <stop offset="70%" style="stop-color:#A68A5B"/>
      <stop offset="100%" style="stop-color:#E5CFA9"/>
    </linearGradient>
    <linearGradient id="platinum" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A1F16"/>
      <stop offset="30%" style="stop-color:#3D4F3D"/>
      <stop offset="70%" style="stop-color:#1A1F16"/>
      <stop offset="100%" style="stop-color:#4A5D4A"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <!-- Card Background -->
  <rect x="20" y="20" width="560" height="340" rx="24" fill="${tier.gradient}" filter="url(#shadow)"/>
  
  <!-- Decorative circle pattern -->
  <circle cx="500" cy="280" r="120" fill="rgba(255,255,255,0.03)"/>
  <circle cx="520" cy="300" r="80" fill="rgba(255,255,255,0.02)"/>
  
  <!-- La Luna Logo Area -->
  <text x="50" y="70" font-family="Georgia, serif" font-size="28" font-style="italic" fill="${tier.textColor}">La Luna</text>
  <text x="50" y="95" font-family="Arial, sans-serif" font-size="12" fill="${tier.textColor}" opacity="0.7">Nosara, Costa Rica</text>
  
  <!-- Tier Badge -->
  <text x="550" y="70" font-family="Arial, sans-serif" font-size="11" fill="${tier.textColor}" opacity="0.8" text-anchor="end" letter-spacing="3">${tier.name}</text>
  
  <!-- Amount -->
  <text x="300" y="200" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="${tier.textColor}" text-anchor="middle">$${amount}</text>
  <text x="300" y="235" font-family="Arial, sans-serif" font-size="14" fill="${tier.textColor}" opacity="0.8" text-anchor="middle">GIFT CARD</text>
  
  <!-- Recipient Name -->
  <text x="50" y="290" font-family="Arial, sans-serif" font-size="11" fill="${tier.textColor}" opacity="0.6" letter-spacing="2">FOR</text>
  <text x="50" y="315" font-family="Georgia, serif" font-size="20" fill="${tier.textColor}">${name}</text>
  
  <!-- Code -->
  <text x="550" y="315" font-family="monospace" font-size="16" fill="${tier.textColor}" opacity="0.9" text-anchor="end" letter-spacing="2">${code}</text>
  
  <!-- Moon icon (simplified) -->
  <circle cx="530" cy="170" r="25" fill="${tier.textColor}" opacity="0.1"/>
  <path d="M520,145 Q545,170 520,195 Q535,170 520,145" fill="${tier.textColor}" opacity="0.15"/>
</svg>`;
}
