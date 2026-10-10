import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { generateTurnkeyTemplate as generateTurnkeyTemplateNew } from './turnkey-template';

const PRICING = {
  interior: 3200,
  covered: 1800,
  open: 800,
  pool: 2250,
  design: 100000,
  landscaping: 188000,
  appliances: 72000,
  stoneUpgrade: 50000  // Stone exterior walls upgrade for Casa Quetzal Stone
};

// Light Editorial Template (AD/Elle Magazine Style)
function generateLightTemplate(data: any): string {
  const { lead, lot, model, firstName, construction, total, lotBalance, reservationDeposit, milestonePayment, lastMilestone, hoaFull, hoaConstruction, fmt } = data;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${firstName} — ${model.name} at Mar Azul</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Montserrat', sans-serif;
      background: #FAFAF8;
      color: #1a1a1a;
      min-height: 100vh;
      font-size: 14px;
      line-height: 1.7;
    }
    
    .container { max-width: 900px; margin: 0 auto; padding: 60px 40px; }
    
    .header { text-align: center; margin-bottom: 60px; }
    .logo-text { font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 6px; color: #888; text-transform: uppercase; margin-bottom: 8px; }
    .logo-img { height: 60px; width: auto; margin-bottom: 12px; }
    .tagline { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 14px; font-style: italic; color: #666; letter-spacing: 2px; }
    
    .hero { margin-bottom: 50px; position: relative; }
    .hero img { width: 100%; height: auto; display: block; border-radius: 4px; }
    
    .intro-text { font-size: 16px; line-height: 1.8; color: #444; max-width: 700px; margin: 0 auto 50px; text-align: center; }
    .intro-text::first-letter { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 72px; font-weight: 300; float: left; line-height: 0.8; margin-right: 12px; margin-top: 8px; color: #1a1a1a; }
    
    .section-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 300; text-align: center; margin-bottom: 40px; letter-spacing: 2px; }
    
    .divider { display: flex; align-items: center; margin: 50px 0; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #ddd; }
    .divider span { padding: 0 30px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 13px; font-style: italic; color: #888; letter-spacing: 3px; }
    
    .investment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 60px; }
    .investment-card { text-align: center; padding: 40px 20px; border: 1px solid #e8e8e8; background: white; }
    .investment-label { font-size: 10px; font-weight: 600; letter-spacing: 3px; color: #888; text-transform: uppercase; margin-bottom: 15px; }
    .investment-value { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 300; color: #1a1a1a; margin-bottom: 10px; }
    .investment-note { font-size: 11px; color: #888; }
    
    .specs-row { display: flex; justify-content: center; gap: 60px; padding: 30px 0; border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8; margin-bottom: 50px; }
    .spec-item { text-align: center; }
    .spec-value { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 300; color: #1a1a1a; }
    .spec-unit { font-size: 14px; color: #888; }
    .spec-label { font-size: 10px; font-weight: 600; letter-spacing: 2px; color: #888; text-transform: uppercase; margin-top: 5px; }
    
    .timeline-item { display: grid; grid-template-columns: 80px 1fr; gap: 40px; padding: 30px 0; border-bottom: 1px solid #e8e8e8; }
    .timeline-item:last-child { border-bottom: none; }
    .timeline-number { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 48px; font-weight: 300; color: #ddd; line-height: 1; }
    .timeline-content h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 400; margin-bottom: 8px; }
    .timeline-timing { display: inline-block; font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 12px; }
    .timeline-content p { font-size: 14px; color: #666; line-height: 1.7; }
    .timeline-highlight { background: #f8f6f0; padding: 2px 8px; font-weight: 500; }
    
    .milestones-table { width: 100%; margin-top: 20px; border-collapse: collapse; font-size: 13px; }
    .milestones-table th { text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #888; padding: 12px 0; border-bottom: 2px solid #1a1a1a; }
    .milestones-table td { padding: 12px 0; border-bottom: 1px solid #e8e8e8; }
    .milestones-table td:last-child { text-align: right; font-weight: 500; }
    
    .hoa-section { background: #f8f6f0; padding: 50px; margin: 60px 0; }
    .hoa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; }
    .hoa-column h4 { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
    .hoa-fee-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0ddd5; font-size: 14px; }
    .hoa-fee-value { font-weight: 500; }
    .hoa-column ul { list-style: none; }
    .hoa-column li { padding: 8px 0; font-size: 13px; color: #444; }
    .hoa-column li::before { content: '—'; margin-right: 10px; color: #ccc; }
    
    .footer { text-align: center; padding-top: 40px; border-top: 1px solid #e8e8e8; }
    .footer-cta { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 300; font-style: italic; margin-bottom: 20px; }
    .footer-contact { font-size: 13px; color: #666; margin-bottom: 8px; }
    .footer-email { font-size: 15px; color: #1a1a1a; text-decoration: none; font-weight: 500; letter-spacing: 1px; }
    .footer-whatsapp { margin-top: 12px; font-size: 14px; }
    .footer-whatsapp a { color: #25D366; text-decoration: none; font-weight: 500; }
    .disclaimer { margin-top: 40px; font-size: 10px; color: #aaa; line-height: 1.6; }
    
    @media (max-width: 600px) {
      .container { padding: 30px 20px; }
      .investment-grid { grid-template-columns: 1fr; gap: 15px; }
      .investment-value { font-size: 28px; }
      .specs-row { flex-wrap: wrap; gap: 30px; }
      .timeline-item { grid-template-columns: 50px 1fr; gap: 20px; }
      .timeline-number { font-size: 32px; }
      .hoa-grid { grid-template-columns: 1fr; gap: 30px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <img src="https://coyolnosara.com/images/logo-black.png" alt="Coyol Group" class="logo-img">
      <div class="tagline">Nosara, Costa Rica</div>
    </header>
    
    <div class="hero">
      <img src="${model.render_url || 'https://coyolnosara.com/images/homes/cacao/exterior-front.jpg'}" alt="${model.name}">
    </div>
    
    <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 48px; font-weight: 300; text-align: center; margin-bottom: 8px; letter-spacing: 3px;">${model.name}</h1>
    <p style="text-align: center; font-size: 14px; color: #888; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 40px;">Lot ${lot.lot_number} · Mar Azul</p>
    
    <p class="intro-text">Nestled within the private Mar Azul community, ${model.name} offers ${model.bedrooms || 3} bedrooms, ${model.bathrooms || 3} bathrooms, and seamless indoor-outdoor living—designed for the Nosara lifestyle. This exclusive proposal outlines your path to ownership.</p>
    
    <h2 class="section-title">The Investment</h2>
    <div class="investment-grid">
      <div class="investment-card">
        <div class="investment-label">Lot ${lot.lot_number}</div>
        <div class="investment-value">${fmt(lot.price)}</div>
        <div class="investment-note">${lot.area?.toLocaleString()} m² · Ready to build</div>
      </div>
      <div class="investment-card">
        <div class="investment-label">Construction</div>
        <div class="investment-value">${fmt(construction)}</div>
        <div class="investment-note">6 milestone payments</div>
      </div>
      <div class="investment-card">
        <div class="investment-label">Total</div>
        <div class="investment-value">${fmt(total)}</div>
        <div class="investment-note">Turnkey home</div>
      </div>
    </div>
    
    <div class="divider"><span>Architecture</span></div>
    
    <div class="specs-row">
      <div class="spec-item">
        <div class="spec-value">${model.interior_sqm} <span class="spec-unit">m²</span></div>
        <div class="spec-label">Interior</div>
      </div>
      <div class="spec-item">
        <div class="spec-value">${model.covered_terrace_sqm} <span class="spec-unit">m²</span></div>
        <div class="spec-label">Covered</div>
      </div>
      <div class="spec-item">
        <div class="spec-value">${model.open_terrace_sqm} <span class="spec-unit">m²</span></div>
        <div class="spec-label">Terraces</div>
      </div>
      <div class="spec-item">
        <div class="spec-value">${model.pool_sqm} <span class="spec-unit">m²</span></div>
        <div class="spec-label">Pool</div>
      </div>
    </div>
    
    <div class="divider"><span>Your Journey</span></div>
    
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-number">01</div>
        <div class="timeline-content">
          <h3>Reserve Your Lot</h3>
          <span class="timeline-timing">Day 1</span>
          <p>Secure Lot ${lot.lot_number} with a <span class="timeline-highlight">${fmt(reservationDeposit)} reservation deposit</span>. Applied toward your purchase.</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-number">02</div>
        <div class="timeline-content">
          <h3>Complete Purchase</h3>
          <span class="timeline-timing">Within 30 days</span>
          <p>Pay remaining <span class="timeline-highlight">${fmt(lotBalance)}</span> to take ownership. Our legal partner ICS assists with company formation and title transfer.</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-number">03</div>
        <div class="timeline-content">
          <h3>Design & Contract</h3>
          <span class="timeline-timing">Week 2-4</span>
          <p>Finalize details with our architect. Select finishes. Sign fixed-price construction contract.</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-number">04</div>
        <div class="timeline-content">
          <h3>Permits</h3>
          <span class="timeline-timing">1-3 months</span>
          <p>We handle the permit process with the municipality. Once approved, construction begins.</p>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-number">05</div>
        <div class="timeline-content">
          <h3>Construction</h3>
          <span class="timeline-timing">12-18 months</span>
          <p>Six milestone payments as your home takes shape:</p>
          <table class="milestones-table">
            <thead><tr><th>Milestone</th><th>%</th><th>Amount</th></tr></thead>
            <tbody>
              <tr><td>Contract Signing</td><td>16.6%</td><td>${fmt(milestonePayment)}</td></tr>
              <tr><td>Foundation</td><td>16.6%</td><td>${fmt(milestonePayment)}</td></tr>
              <tr><td>Structure</td><td>16.6%</td><td>${fmt(milestonePayment)}</td></tr>
              <tr><td>Roof & Enclosure</td><td>16.6%</td><td>${fmt(milestonePayment)}</td></tr>
              <tr><td>Finishes</td><td>16.6%</td><td>${fmt(milestonePayment)}</td></tr>
              <tr><td>Handover</td><td>16.8%</td><td>${fmt(lastMilestone)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-number">06</div>
        <div class="timeline-content">
          <h3>Welcome Home</h3>
          <span class="timeline-timing">Move-in day</span>
          <p>Final walkthrough, keys, and welcome to the Mar Azul community.</p>
        </div>
      </div>
    </div>
    
    <section class="hoa-section">
      <h2 class="section-title">Community & HOA</h2>
      <div class="hoa-grid">
        <div class="hoa-column">
          <h4>Monthly Fees</h4>
          <div class="hoa-fee-row"><span>During construction (75%)</span><span class="hoa-fee-value">~${fmt(hoaConstruction)}</span></div>
          <div class="hoa-fee-row"><span>Once moved in</span><span class="hoa-fee-value">~${fmt(hoaFull)}</span></div>
          <p style="font-size: 11px; color: #888; margin-top: 15px; font-style: italic;">*Based on ${lot.area?.toLocaleString()} m² at $0.30/m²/month</p>
        </div>
        <div class="hoa-column">
          <h4>Includes</h4>
          <ul>
            <li>Water</li>
            <li>Garbage collection</li>
            <li>24/7 Security</li>
            <li>Gated access</li>
            <li>Road maintenance</li>
            <li>Tennis court</li>
            <li>Common grounds</li>
          </ul>
        </div>
      </div>
    </section>
    
    <footer class="footer">
      <p class="footer-cta">Ready to begin?</p>
      <p class="footer-contact">Ruth Tal · Coyol Nosara Real Estate</p>
      <a href="mailto:info@coyolnosara.com" class="footer-email">info@coyolnosara.com</a>
      <p class="footer-whatsapp"><a href="https://wa.me/13235747238">WhatsApp: +1 323 574 7238</a></p>
      <p class="disclaimer">Prepared exclusively for ${lead.full_name}. Prices valid for 30 days.<br>Construction by Nosara Construction S.A. Timeline estimates based on typical progression.<br>© 2026 Coyol Group</p>
    </footer>
  </div>
</body>
</html>`;
}

// Turnkey Template - Move-in Ready Home (single payment, no construction phases)
function generateTurnkeyTemplate(data: any): string {
  const { lead, lot, model, firstName, construction, total, hoaFull, hoaConstruction, fmt } = data;
  const deposit = Math.round(total * 0.10); // 10% deposit (Costa Rica standard)
  const balance = total - deposit;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${firstName} — ${model.name} at Mar Azul | Move-In Ready</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Montserrat', sans-serif;
      background: #FAFAF8;
      color: #1a1a1a;
      min-height: 100vh;
      font-size: 14px;
      line-height: 1.7;
    }
    
    .container { max-width: 800px; margin: 0 auto; }
    
    .header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(196, 166, 124, 0.3);
    }
    
    .logo-img {
      width: 100px;
      height: auto;
      margin-bottom: 10px;
      filter: invert(1) brightness(0.85) sepia(0.3) hue-rotate(10deg) saturate(0.8);
    }
    
    .logo {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 500;
      letter-spacing: 4px;
      color: #C4A67C;
      margin-bottom: 5px;
    }
    
    .tagline {
      font-size: 12px;
      letter-spacing: 3px;
      color: #888;
      text-transform: uppercase;
    }
    
    .turnkey-badge {
      display: inline-block;
      background: linear-gradient(135deg, #C4A67C 0%, #a08050 100%);
      color: #1a1f16;
      padding: 8px 24px;
      border-radius: 30px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 15px;
    }
    
    .hero {
      margin-bottom: 25px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      position: relative;
    }
    
    .hero img { width: 100%; height: auto; display: block; }
    
    .hero-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      padding: 30px;
      text-align: center;
    }
    
    .move-in-ready {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      color: #C4A67C;
      margin-bottom: 5px;
    }
    
    .property-title { text-align: center; margin-bottom: 25px; }
    
    .property-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 36px;
      color: #C4A67C;
      margin-bottom: 5px;
    }
    
    .property-lot {
      font-size: 14px;
      color: #999;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .investment-summary {
      background: rgba(196, 166, 124, 0.1);
      border: 1px solid rgba(196, 166, 124, 0.4);
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
    }
    
    .investment-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      color: #C4A67C;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .total-price {
      text-align: center;
      padding: 30px;
      background: rgba(0,0,0,0.3);
      border-radius: 10px;
      margin-bottom: 20px;
    }
    
    .total-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #888;
      margin-bottom: 10px;
    }
    
    .total-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 48px;
      font-weight: 400;
      color: #C4A67C;
    }
    
    .total-note {
      font-size: 12px;
      color: #888;
      margin-top: 10px;
    }
    
    .price-breakdown {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 20px;
    }
    
    .breakdown-item {
      padding: 15px;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      text-align: center;
    }
    
    .breakdown-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 5px;
    }
    
    .breakdown-value {
      font-size: 20px;
      font-weight: 300;
      color: #f5f3ef;
    }
    
    .floorplan-section { margin-bottom: 25px; }
    
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      color: #C4A67C;
      text-align: center;
      margin-bottom: 15px;
    }
    
    .floorplan {
      background: linear-gradient(135deg, #f5f3ef 0%, #e8e2d6 100%);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
      border: 1px solid rgba(196, 166, 124, 0.3);
      padding: 15px;
    }
    
    .floorplan img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 6px;
    }
    
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 15px;
      text-align: center;
    }
    
    .spec-item {
      background: rgba(196, 166, 124, 0.15);
      padding: 12px 8px;
      border-radius: 6px;
    }
    
    .spec-value {
      font-size: 22px;
      font-weight: 300;
      color: #C4A67C;
    }
    
    .spec-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-top: 3px;
    }
    
    .timeline {
      margin: 30px 0;
    }
    
    .step {
      display: grid;
      grid-template-columns: 50px 1fr;
      gap: 15px;
      padding: 20px 0;
      border-bottom: 1px solid rgba(196, 166, 124, 0.2);
    }
    
    .step:last-child { border-bottom: none; }
    
    .step-number {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #C4A67C 0%, #a08050 100%);
      color: #1a1f16;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
    }
    
    .step-header { margin-bottom: 8px; }
    
    .step-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      color: #f5f3ef;
      margin-bottom: 3px;
    }
    
    .step-timing {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #C4A67C;
    }
    
    .step-content {
      color: #bbb;
      font-size: 13px;
      line-height: 1.7;
    }
    
    .step-highlight {
      color: #C4A67C;
      font-weight: 500;
    }
    
    .included-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
    }
    
    .included-title {
      color: #C4A67C;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    
    .included-list {
      list-style: none;
    }
    
    .included-list li {
      padding: 6px 0;
      font-size: 12px;
      color: #bbb;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .included-list li::before {
      content: '✓';
      color: #C4A67C;
      margin-right: 8px;
    }
    
    .not-included-title {
      color: #888;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    
    .not-included-list {
      list-style: none;
    }
    
    .not-included-list li {
      padding: 6px 0;
      font-size: 12px;
      color: #666;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    
    .not-included-list li::before {
      content: '—';
      color: #555;
      margin-right: 8px;
    }
    
    .hoa-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
    }
    
    .hoa-fees { margin-bottom: 10px; }
    
    .hoa-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      font-size: 13px;
    }
    
    .hoa-value {
      color: #C4A67C;
      font-weight: 500;
    }
    
    .hoa-note {
      font-size: 10px;
      color: #666;
      font-style: italic;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid rgba(196, 166, 124, 0.3);
    }
    
    .contact-prompt {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      color: #C4A67C;
      margin-bottom: 15px;
    }
    
    .contact-info {
      font-size: 14px;
      color: #bbb;
      margin-bottom: 5px;
    }
    
    .contact-email {
      color: #C4A67C;
      text-decoration: none;
      font-size: 16px;
      letter-spacing: 1px;
    }
    
    .contact-whatsapp {
      margin-top: 10px;
    }
    
    .contact-whatsapp a {
      color: #25D366;
      text-decoration: none;
      font-weight: 500;
    }
    
    .disclaimer {
      margin-top: 30px;
      font-size: 10px;
      color: #555;
      line-height: 1.6;
    }
    
    @media (max-width: 600px) {
      .container { padding: 20px; }
      .total-value { font-size: 36px; }
      .price-breakdown { grid-template-columns: 1fr; }
      .specs-grid { grid-template-columns: repeat(2, 1fr); }
      .included-grid, .hoa-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <div class="header">
      <img src="https://coyolnosara.com/images/logo-black.png" alt="Coyol Group" class="logo-img">
      <div class="logo">COYOL GROUP</div>
      <div class="tagline">Nosara, Costa Rica</div>
      <div class="turnkey-badge">Move-In Ready</div>
    </div>
    
    <div class="hero">
      <img src="${model.render_url || 'https://coyolnosara.com/images/homes/elle/hero-card.jpg'}" alt="${model.name}">
    </div>
    
    <div class="property-title">
      <h1 class="property-name">${model.name}</h1>
      <p class="property-lot">Lot ${lot.lot_number} · Mar Azul · ${model.bedrooms || 4} Bed · ${model.bathrooms || 4} Bath</p>
    </div>
    
    <div class="investment-summary">
      <h2 class="investment-title">Your Investment</h2>
      <div class="total-price">
        <div class="total-label">Total Price</div>
        <div class="total-value">${fmt(total)}</div>
        <div class="total-note">Lot + Finished Home · Ready to Move In</div>
      </div>
      <div class="price-breakdown">
        <div class="breakdown-item">
          <div class="breakdown-label">Reservation Deposit (10%)</div>
          <div class="breakdown-value">${fmt(deposit)}</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label">Balance at Closing (90%)</div>
          <div class="breakdown-value">${fmt(balance)}</div>
        </div>
      </div>
    </div>
    
    <div class="floorplan-section">
      <h2 class="section-title">Floor Plan</h2>
      <div class="floorplan">
        <img src="${model.floorplan_url || 'https://coyolnosara.com/images/homes/elle/floorplan.jpg'}" alt="${model.name} Floor Plan">
      </div>
      <div class="specs-grid">
        <div class="spec-item">
          <div class="spec-value">${Math.round(model.interior_sqm)}</div>
          <div class="spec-label">sqm Indoor</div>
        </div>
        <div class="spec-item">
          <div class="spec-value">${Math.round(model.covered_terrace_sqm)}</div>
          <div class="spec-label">sqm Covered</div>
        </div>
        <div class="spec-item">
          <div class="spec-value">${Math.round(model.open_terrace_sqm)}</div>
          <div class="spec-label">sqm Terraces</div>
        </div>
        <div class="spec-item">
          <div class="spec-value">${Math.round(model.pool_sqm)}</div>
          <div class="spec-label">sqm Pool</div>
        </div>
      </div>
    </div>
    
    <div class="investment-summary">
      <h2 class="investment-title">What's Included</h2>
      <div class="included-grid">
        <div>
          <div class="included-title">Included in Price</div>
          <ul class="included-list">
            <li>Finished house with high-end finishes</li>
            <li>Closets & built-ins (where noted on floor plans)</li>
            <li>Bathrooms fully finished</li>
            <li>Kitchen with cabinetry, countertops & appliances</li>
            <li>Kitchen cutlery, plates & utensils</li>
            <li>Equipped laundry room with washer & dryer</li>
            <li>A/C throughout</li>
            <li>Ceiling fans indoor & outdoor</li>
            <li>Feature lighting & wall sconces</li>
            <li>Pool with finishes</li>
            <li>Covered & open terraces</li>
            <li>Basic landscaping with irrigation</li>
            <li>Exterior lighting</li>
            <li>Custom built-ins</li>
            <li>Front privacy gate</li>
            <li>Interior design services</li>
            <li>Furniture (beds, tables, chairs, sofas)</li>
            <li>Garden & pool furniture</li>
          </ul>
        </div>
        <div>
          <div class="not-included-title">Not Included</div>
          <ul class="not-included-list">
            <li>Solar power backup system</li>
            <li>Personal items & decor</li>
          </ul>
        </div>
      </div>
    </div>
    
    <h2 class="section-title">Simple Purchase Process</h2>
    
    <div class="timeline">
      <div class="step">
        <div class="step-number">1</div>
        <div>
          <div class="step-header">
            <h3 class="step-title">Reserve</h3>
            <span class="step-timing">Today</span>
          </div>
          <div class="step-content">
            Secure this home with a <span class="step-highlight">${fmt(deposit)} reservation deposit (10%)</span>. Takes it off market while we prepare closing documents. Deposit held in escrow.
          </div>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div>
          <div class="step-header">
            <h3 class="step-title">Due Diligence & Legal</h3>
            <span class="step-timing">2-4 Weeks</span>
          </div>
          <div class="step-content">
            Our legal partner <span class="step-highlight">ICS</span> assists with company formation (if needed), title review, and closing preparation. You can visit the property anytime.
          </div>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div>
          <div class="step-header">
            <h3 class="step-title">Close & Get Keys</h3>
            <span class="step-timing">30-45 Days</span>
          </div>
          <div class="step-content">
            Pay remaining <span class="step-highlight">${fmt(balance)}</span> at closing. Title transfers, you receive keys, and you're officially a Mar Azul homeowner.
          </div>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">4</div>
        <div>
          <div class="step-header">
            <h3 class="step-title">Move In</h3>
            <span class="step-timing">Immediately</span>
          </div>
          <div class="step-content">
            Your home is <span class="step-highlight">ready to enjoy</span>. Add your furniture, personal touches, and start living the Nosara lifestyle.
          </div>
        </div>
      </div>
    </div>
    
    <div class="investment-summary" style="margin-top: 25px;">
      <h2 class="investment-title">HOA & Community</h2>
      <div class="hoa-grid">
        <div>
          <div class="included-title">Monthly HOA Fee</div>
          <div class="hoa-fees">
            <div class="hoa-row">
              <span>Monthly fee</span>
              <span class="hoa-value">~${fmt(hoaFull)}/month</span>
            </div>
          </div>
          <div class="hoa-note">*Based on ${lot.area?.toLocaleString()} m² lot at $0.30/m²/month</div>
        </div>
        <div>
          <div class="included-title">HOA Includes</div>
          <ul class="included-list">
            <li>Water</li>
            <li>Garbage collection</li>
            <li>24/7 Security</li>
            <li>Gated access</li>
            <li>Road maintenance</li>
            <li>Tennis court</li>
            <li>Common grounds</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p class="contact-prompt">Ready to make it yours?</p>
      <p class="contact-info">Ruth Tal · Coyol Nosara Real Estate</p>
      <a href="mailto:info@coyolnosara.com" class="contact-email">info@coyolnosara.com</a>
      <p class="contact-whatsapp"><a href="https://wa.me/13435747238">WhatsApp: +1 (343) 574-7238</a></p>
      
      <p class="disclaimer">
        Prepared exclusively for ${lead.full_name}. Prices valid for 30 days.<br>
        © 2026 Coyol Group.
      </p>
    </div>
    
  </div>
</body>
</html>`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { leadId, lotNumber, modelName, template = 'dark', isTurnkey = false } = await request.json();
    const TURNKEY_MARKUP = 1.25;

    // Fetch lead
    const { data: lead } = await supabase
      .from('mar_azul_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    // Fetch lot
    const { data: lot } = await supabase
      .from('mar_azul_lots')
      .select('*')
      .eq('lot_number', lotNumber)
      .single();

    // Fetch model
    const { data: model } = await supabase
      .from('house_models')
      .select('*')
      .eq('name', modelName)
      .single();

    if (!lead || !lot || !model) {
      return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
    }

    // Calculate construction cost
    let construction = 
      (model.interior_sqm * PRICING.interior) +
      (model.covered_terrace_sqm * PRICING.covered) +
      (model.open_terrace_sqm * PRICING.open) +
      (model.pool_sqm * PRICING.pool) +
      PRICING.design + PRICING.landscaping + PRICING.appliances;
    
    // Add stone upgrade for Casa Quetzal Stone
    if (model.name && model.name.toLowerCase().includes('stone')) {
      construction += PRICING.stoneUpgrade;
    }
    
    // Apply 25% turnkey markup if selected
    if (isTurnkey) {
      construction = Math.round(construction * TURNKEY_MARKUP);
    }

    const total = lot.price + construction;
    const milestonePayment = Math.round(construction / 6);
    const lastMilestone = construction - (milestonePayment * 5); // Slightly different for rounding
    const firstName = lead.full_name.split(' ')[0];
    const reservationDeposit = 10000;
    const lotBalance = lot.price - reservationDeposit;

    // Format currency
    const fmt = (n: number) => '$' + n.toLocaleString('en-US');
    
    // HOA calculation
    const hoaFull = Math.round(lot.area * 0.30);
    const hoaConstruction = Math.round(hoaFull * 0.75);

    // Make image URLs absolute for emails/PDFs
    const baseUrl = 'https://coyolnosara.com';
    if (model.render_url && model.render_url.startsWith('/')) {
      model.render_url = baseUrl + model.render_url;
    }
    if (model.floorplan_url && model.floorplan_url.startsWith('/')) {
      model.floorplan_url = baseUrl + model.floorplan_url;
    }

    // Generate HTML based on template
    let html: string;
    
    if (isTurnkey) {
      // Turnkey Template - Elle Magazine Style
      html = generateTurnkeyTemplateNew({ lead, lot, model, firstName, construction, total, hoaFull, hoaConstruction, fmt });
    } else if (template === 'light') {
      // Light Editorial Template (AD/Elle style)
      html = generateLightTemplate({ lead, lot, model, firstName, construction, total, lotBalance, reservationDeposit, milestonePayment, lastMilestone, hoaFull, hoaConstruction, fmt });
    } else {
      // Dark Executive Template (default)
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${firstName} — ${model.name} at Mar Azul</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #1a1f16 0%, #2a3020 100%);
      color: #f5f3ef;
      min-height: 100vh;
      padding: 30px;
      font-size: 13px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(196, 166, 124, 0.3);
    }
    
    .logo-img {
      width: 100px;
      height: auto;
      margin-bottom: 10px;
      filter: invert(1) brightness(0.85) sepia(0.3) hue-rotate(10deg) saturate(0.8);
    }
    
    .logo {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 500;
      letter-spacing: 4px;
      color: #C4A67C;
      margin-bottom: 5px;
    }
    
    .tagline {
      font-size: 12px;
      letter-spacing: 3px;
      color: #888;
      text-transform: uppercase;
    }
    
    .hero {
      margin-bottom: 25px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    }
    
    .hero img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .property-title {
      text-align: center;
      margin-bottom: 25px;
    }
    
    .property-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 36px;
      color: #C4A67C;
      margin-bottom: 5px;
    }
    
    .property-lot {
      font-size: 14px;
      color: #999;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .investment-summary {
      background: rgba(196, 166, 124, 0.1);
      border: 1px solid rgba(196, 166, 124, 0.4);
      border-radius: 12px;
      padding: 20px 25px;
      margin-bottom: 25px;
    }
    
    .investment-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      color: #C4A67C;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .investment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
      text-align: center;
    }
    
    .investment-item {
      padding: 12px;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
    }
    
    .investment-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 5px;
    }
    
    .investment-value {
      font-size: 22px;
      font-weight: 300;
      color: #C4A67C;
    }
    
    .investment-note {
      font-size: 10px;
      color: #666;
      margin-top: 3px;
    }
    
    .floorplan-section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      color: #C4A67C;
      text-align: center;
      margin-bottom: 15px;
    }
    
    .floorplan {
      background: linear-gradient(135deg, #f5f3ef 0%, #e8e2d6 100%);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
      border: 1px solid rgba(196, 166, 124, 0.3);
      padding: 15px;
    }
    
    .floorplan img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 6px;
      filter: sepia(0.08) contrast(1.05);
    }
    
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 15px;
    }
    
    .spec-item {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    
    .spec-value {
      font-size: 20px;
      font-weight: 300;
      color: #C4A67C;
      margin-bottom: 3px;
    }
    
    .spec-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
    }
    
    .timeline {
      position: relative;
      padding-left: 35px;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, #C4A67C, rgba(196, 166, 124, 0.2));
    }
    
    .step {
      position: relative;
      margin-bottom: 18px;
      padding: 15px 18px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
    }
    
    .step-number {
      position: absolute;
      left: -35px;
      top: 15px;
      width: 24px;
      height: 24px;
      background: #3D4F3D;
      border: 2px solid #C4A67C;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: #C4A67C;
    }
    
    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    
    .step-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16px;
      color: #f5f3ef;
    }
    
    .step-timing {
      font-size: 9px;
      color: #C4A67C;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(196, 166, 124, 0.15);
      padding: 3px 8px;
      border-radius: 15px;
    }
    
    .step-content {
      color: #aaa;
      font-size: 12px;
    }
    
    .step-highlight {
      display: inline-block;
      background: rgba(196, 166, 124, 0.2);
      color: #C4A67C;
      padding: 1px 6px;
      border-radius: 3px;
      font-weight: 500;
    }
    
    .milestones-table {
      width: 100%;
      margin-top: 10px;
      border-collapse: collapse;
      font-size: 11px;
    }
    
    .milestones-table th {
      text-align: left;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      padding: 6px 8px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .milestones-table td {
      padding: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .milestones-table td:first-child {
      color: #f5f3ef;
    }
    
    .milestones-table td:nth-child(2) {
      color: #C4A67C;
      text-align: center;
    }
    
    .milestones-table td:nth-child(3) {
      color: #C4A67C;
      text-align: right;
      font-weight: 500;
    }
    
    .portal-box {
      background: rgba(61, 79, 61, 0.3);
      border: 1px solid rgba(61, 79, 61, 0.5);
      border-radius: 8px;
      padding: 12px;
      margin-top: 10px;
    }
    
    .portal-title {
      color: #C4A67C;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 12px;
    }
    
    .portal-features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
    }
    
    .portal-feature {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #bbb;
    }
    
    .portal-feature::before {
      content: '✓';
      color: #C4A67C;
      font-weight: bold;
      font-size: 10px;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      text-align: center;
    }
    
    .contact-prompt {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      color: #f5f3ef;
      margin-bottom: 10px;
    }
    
    .contact-info {
      color: #888;
      font-size: 12px;
      margin-bottom: 5px;
    }
    
    .contact-email {
      color: #C4A67C;
      text-decoration: none;
      font-size: 14px;
    }
    
    .contact-whatsapp {
      margin-top: 10px;
      font-size: 13px;
    }
    
    .contact-whatsapp a {
      color: #25D366;
      text-decoration: none;
    }
    
    .disclaimer {
      margin-top: 20px;
      font-size: 9px;
      color: #555;
      line-height: 1.4;
    }
    
    .included-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      font-size: 12px;
    }
    
    .included-title {
      color: #C4A67C;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .not-included-title {
      color: #888;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .included-list {
      color: #bbb;
      margin-left: 15px;
      line-height: 1.8;
    }
    
    .not-included-list {
      color: #666;
      margin-left: 15px;
      line-height: 1.8;
    }
    
    .hoa-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      font-size: 12px;
    }
    
    .hoa-fees {
      color: #bbb;
      line-height: 1.8;
    }
    
    .hoa-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    
    .hoa-value {
      color: #C4A67C;
    }
    
    .hoa-note {
      color: #666;
      font-size: 10px;
      margin-top: 8px;
      font-style: italic;
    }
    
    /* Mobile Responsive */
    @media (max-width: 600px) {
      body {
        padding: 15px;
      }
      
      .investment-grid {
        grid-template-columns: 1fr;
        gap: 10px;
      }
      
      .investment-item {
        padding: 15px;
      }
      
      .investment-value {
        font-size: 28px;
      }
      
      .property-name {
        font-size: 28px;
      }
      
      .specs-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      
      .spec-value {
        font-size: 20px;
      }
      
      .included-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .timeline {
        padding-left: 35px;
      }
      
      .step-number {
        width: 24px;
        height: 24px;
        font-size: 11px;
        left: -35px;
      }
      
      .step {
        padding: 15px;
      }
      
      .milestone-item {
        flex-direction: column;
        gap: 5px;
        text-align: left;
      }
      
      .milestone-amount {
        margin-left: 0;
      }
      
      .hoa-grid {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .gallery-grid {
        grid-template-columns: 1fr;
      }
      
      .section-title {
        font-size: 20px;
      }
    }
    
    @media print {
      body {
        background: white;
        color: #1a1f16;
        padding: 15px;
      }
      .logo, .investment-value, .spec-value, .step-highlight, .contact-email, .section-title, .property-name, .portal-title {
        color: #3D4F3D;
      }
      .step-title, .contact-prompt {
        color: #1a1f16;
      }
      .step, .spec-item {
        border: 1px solid #ddd;
        background: #fafafa;
      }
      .investment-summary {
        border: 1px solid #C4A67C;
        background: #fdf9f3;
      }
      .investment-item {
        background: white;
        border: 1px solid #eee;
      }
      .step-number {
        background: white;
        border-color: #3D4F3D;
        color: #3D4F3D;
      }
      .portal-box {
        background: #f5f5f0;
        border-color: #3D4F3D;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Header -->
    <div class="header">
      <img src="https://coyolnosara.com/images/logo-black.png" alt="Coyol Group" class="logo-img">
      <div class="logo">COYOL GROUP</div>
      <div class="tagline">Nosara, Costa Rica</div>
    </div>
    
    <!-- Hero Render -->
    <div class="hero">
      <img src="${model.render_url || 'https://coyolnosara.com/images/homes/cacao/render1.jpg'}" alt="${model.name}">
    </div>
    
    <!-- Property Title -->
    <div class="property-title">
      <h1 class="property-name">${model.name}</h1>
      <p class="property-lot">Lot ${lot.lot_number} · Mar Azul</p>
    </div>
    
    <!-- Investment Summary -->
    <div class="investment-summary">
      <h2 class="investment-title">Your Investment</h2>
      <div class="investment-grid">
        <div class="investment-item">
          <div class="investment-label">Lot ${lot.lot_number}</div>
          <div class="investment-value">${fmt(lot.price)}</div>
          <div class="investment-note">${lot.area?.toLocaleString() || '—'} m² · Ready to build</div>
        </div>
        <div class="investment-item">
          <div class="investment-label">Construction</div>
          <div class="investment-value">${fmt(construction)}</div>
          <div class="investment-note">6 milestone payments</div>
        </div>
        <div class="investment-item">
          <div class="investment-label">Total</div>
          <div class="investment-value">${fmt(total)}</div>
          <div class="investment-note">Turnkey home</div>
        </div>
      </div>
    </div>
    
    <!-- Floor Plan -->
    <div class="floorplan-section">
      <h2 class="section-title">Floor Plan</h2>
      <div class="floorplan">
        <img src="${model.floorplan_url || 'https://coyolnosara.com/images/homes/cacao/floorplan.jpg'}" alt="${model.name} Floor Plan">
      </div>
      <div class="specs-grid">
        <div class="spec-item">
          <div class="spec-value">${Math.round(model.interior_sqm)}</div>
          <div class="spec-label">sqm Indoor</div>
        </div>
        <div class="spec-item">
          <div class="spec-value">${Math.round(model.covered_terrace_sqm)}</div>
          <div class="spec-label">sqm Covered</div>
        </div>
        <div class="spec-item">
          <div class="spec-value">${Math.round(model.open_terrace_sqm)}</div>
          <div class="spec-label">sqm Terraces</div>
        </div>
        <div class="spec-item">
          <div class="spec-value">${Math.round(model.pool_sqm)}</div>
          <div class="spec-label">sqm Pool</div>
        </div>
      </div>
    </div>
    
    <!-- What's Included -->
    <div class="investment-summary" style="margin-bottom: 25px;">
      <h2 class="investment-title">What's Included</h2>
      <div class="included-grid">
        <div>
          <div class="included-title">✓ Included</div>
          <ul class="included-list">
            <li>Finished house with high-end finishes</li>
            <li>Closets & built-ins (where noted on floor plans)</li>
            <li>Bathrooms fully finished</li>
            <li>Kitchen with cabinetry, countertops & appliances</li>
            <li>Equipped laundry room with washer & dryer</li>
            <li>A/C throughout</li>
            <li>Ceiling fans indoor & outdoor</li>
            <li>Overhead interior lighting (pot lights)</li>
            <li>Rough-ins for feature lighting & wall sconces</li>
            <li>Pool with finishes</li>
            <li>Covered & open terraces</li>
            <li>Basic landscaping with irrigation system</li>
            <li>Exterior lighting (garden & pathway lights)</li>
            <li>Custom upholstered built-ins (where noted on floor plans)</li>
            <li>Front privacy gate</li>
            <li>Fire pit</li>
            <li>Outdoor garden rinse-off shower</li>
          </ul>
        </div>
        <div>
          <div class="not-included-title">✗ Not Included</div>
          <ul class="not-included-list">
            <li>Feature lighting & wall sconces</li>
            <li>Covered carport</li>
            <li>Interior design services</li>
            <li>Kitchen cutlery, plates & utensils</li>
            <li>Furniture (beds, tables, chairs, sofas)</li>
            <li>Garden furniture</li>
            <li>Pool furniture</li>
            <li>Solar power backup system</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Journey Title -->
    <h2 class="section-title" style="margin-bottom: 20px;">Your Journey Home</h2>
    
    <!-- Timeline -->
    <div class="timeline">
      
      <!-- Step 1 -->
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-header">
          <h3 class="step-title">Reserve Your Lot</h3>
          <span class="step-timing">Day 1</span>
        </div>
        <div class="step-content">
          Secure Lot ${lot.lot_number} with a <span class="step-highlight">${fmt(reservationDeposit)} reservation deposit</span>. Applied toward your purchase.
        </div>
      </div>
      
      <!-- Step 2 -->
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-header">
          <h3 class="step-title">Complete Lot Purchase</h3>
          <span class="step-timing">Within 30 days</span>
        </div>
        <div class="step-content">
          Pay remaining <span class="step-highlight">${fmt(lotBalance)}</span> to take ownership. Our recommended legal partner <span class="step-highlight">ICS</span> can assist with forming a Costa Rican company, due diligence, and title transfer.
        </div>
      </div>
      
      <!-- Step 3 -->
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-header">
          <h3 class="step-title">Finalize Design & Sign Contract</h3>
          <span class="step-timing">Week 2-4</span>
        </div>
        <div class="step-content">
          Work with our team on final details. Choose your finishes from our range of options. Sign fixed-price construction contract.
        </div>
      </div>
      
      <!-- Step 4 -->
      <div class="step">
        <div class="step-number">4</div>
        <div class="step-header">
          <h3 class="step-title">Construction Permit</h3>
          <span class="step-timing">1-3 months</span>
        </div>
        <div class="step-content">
          We handle the permit process with the municipality. Once approved, construction begins.
        </div>
      </div>
      
      <!-- Step 5 -->
      <div class="step">
        <div class="step-number">5</div>
        <div class="step-header">
          <h3 class="step-title">Construction</h3>
          <span class="step-timing">12-18 months</span>
        </div>
        <div class="step-content">
          <span class="step-highlight">6 milestone payments</span> as your home takes shape:
          
          <table class="milestones-table">
            <thead>
              <tr>
                <th>Milestone</th>
                <th>%</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1. Contract Signing</td>
                <td>16.6%</td>
                <td>${fmt(milestonePayment)}</td>
              </tr>
              <tr>
                <td>2. Foundation</td>
                <td>16.6%</td>
                <td>${fmt(milestonePayment)}</td>
              </tr>
              <tr>
                <td>3. Structure</td>
                <td>16.6%</td>
                <td>${fmt(milestonePayment)}</td>
              </tr>
              <tr>
                <td>4. Roof & Enclosure</td>
                <td>16.6%</td>
                <td>${fmt(milestonePayment)}</td>
              </tr>
              <tr>
                <td>5. Finishes</td>
                <td>16.6%</td>
                <td>${fmt(milestonePayment)}</td>
              </tr>
              <tr>
                <td>6. Handover</td>
                <td>16.8%</td>
                <td>${fmt(lastMilestone)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Step 6 -->
      <div class="step">
        <div class="step-number">6</div>
        <div class="step-header">
          <h3 class="step-title">Track Your Progress</h3>
          <span class="step-timing">Ongoing</span>
        </div>
        <div class="step-content">
          <div class="portal-box">
            <div class="portal-title">Coyol Control — Your Client Portal</div>
            <div class="portal-features">
              <div class="portal-feature">Construction photos</div>
              <div class="portal-feature">Milestone tracking</div>
              <div class="portal-feature">Documents</div>
              <div class="portal-feature">Direct messaging</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Step 7 -->
      <div class="step">
        <div class="step-number">7</div>
        <div class="step-header">
          <h3 class="step-title">Welcome Home</h3>
          <span class="step-timing">Move-in day</span>
        </div>
        <div class="step-content">
          Final walkthrough, keys, and welcome to the Mar Azul community.
        </div>
      </div>
      
    </div>
    
    <!-- HOA Section -->
    <div class="investment-summary" style="margin-top: 25px;">
      <h2 class="investment-title">HOA & Community</h2>
      <div class="hoa-grid">
        <div>
          <div class="included-title">Monthly HOA Fees</div>
          <div class="hoa-fees">
            <div class="hoa-row">
              <span>During construction (75%)</span>
              <span class="hoa-value">~${fmt(hoaConstruction)}/month</span>
            </div>
            <div class="hoa-row">
              <span>Once moved in</span>
              <span class="hoa-value">~${fmt(hoaFull)}/month</span>
            </div>
          </div>
          <div class="hoa-note">*Based on ${lot.area?.toLocaleString()} m² lot at $0.30/m²/month</div>
        </div>
        <div>
          <div class="included-title">HOA Includes</div>
          <ul class="included-list">
            <li>Water</li>
            <li>Garbage collection</li>
            <li>Security (night guard + daytime presence)</li>
            <li>Gated access</li>
            <li>Road maintenance</li>
            <li>Tennis court</li>
            <li>Common grounds maintenance</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="contact-prompt">Ready to begin?</p>
      <p class="contact-info">Ruth Tal · Coyol Nosara Real Estate</p>
      <a href="mailto:info@coyolnosara.com" class="contact-email">info@coyolnosara.com</a>
      <p class="contact-whatsapp"><a href="https://wa.me/13235747238">WhatsApp: +1 323 574 7238</a></p>
      
      <p class="disclaimer">
        Prepared exclusively for ${lead.full_name}. Prices valid for 30 days. Construction by Nosara Construction S.A.
        Timeline estimates based on typical progression. © 2026 Coyol Group.
      </p>
    </div>
    
  </div>
</body>
</html>`;
    } // End of dark template conditional

    // Generate slug and timestamp for unique filename
    const timestamp = Date.now();
    const slug = `${firstName.toLowerCase()}-${model.name.toLowerCase().replace(/\s+/g, '-')}-lot${lot.lot_number}-${timestamp}`;
    const publicUrl = `https://coyolnosara.com/proposals/${slug}`;

    // Save offer record to Supabase
    const { data: offerRecord, error: saveError } = await supabase
      .from('generated_offers')
      .insert({
        client_name: lead.full_name,
        client_email: lead.email,
        lead_id: leadId,
        lot_number: lot.lot_number,
        lot_price: lot.price,
        model_name: model.name,
        construction_cost: construction,
        total_price: total,
        public_url: publicUrl,
        slug: slug,
        html_content: html
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving offer:', saveError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      html,
      slug,
      publicUrl,
      offerId: offerRecord?.id,
      summary: {
        name: lead.full_name,
        model: model.name,
        lot: lot.lot_number,
        lotPrice: lot.price,
        construction,
        total
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating offer:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate offer' }), { status: 500 });
  }
};
