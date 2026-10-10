// Architectural Digest Style Turnkey Template
export function generateTurnkeyTemplate(data: any): string {
  const { lead, lot, model, firstName, construction, total, hoaFull, hoaConstruction, fmt } = data;
  const deposit = Math.round(total * 0.10);
  const balance = total - deposit;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${model.name} | Mar Azul, Nosara</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap');
    
    :root {
      --sand: #E8E2D6;
      --cream: #FAF8F5;
      --charcoal: #2C2C2C;
      --gold: #C4A67C;
      --forest: #3D4F3D;
      --dark-bg: #1a1f16;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: linear-gradient(135deg, #1a1f16 0%, #2a3020 100%);
      color: #f5f3ef;
      font-size: 15px;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }
    
    /* HERO SECTION - Full bleed */
    .hero {
      position: relative;
      height: 85vh;
      min-height: 600px;
      overflow: hidden;
    }
    
    .hero img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .slideshow {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 1s ease-in-out;
    }
    
    .slide.active {
      opacity: 1;
    }
    
    .hero-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 80px 60px;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
    }
    
    .hero-badge {
      display: inline-block;
      padding: 8px 20px;
      background: var(--gold);
      color: white;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    
    .hero-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 72px;
      font-weight: 400;
      color: white;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    
    .hero-subtitle {
      font-size: 16px;
      color: rgba(255,255,255,0.8);
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    
    /* CONTENT CONTAINER */
    .content {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 40px;
    }
    
    /* HEADER BAR */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 25px 60px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
    }
    
    .logo { height: 28px; opacity: 0.9; }
    
    .header-contact {
      font-size: 12px;
      color: white;
      letter-spacing: 2px;
    }
    
    /* INTRO SECTION */
    .intro {
      padding: 100px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }
    
    .intro-text h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 42px;
      font-weight: 400;
      line-height: 1.2;
      margin-bottom: 30px;
    }
    
    .intro-text p {
      font-size: 16px;
      color: #555;
      line-height: 1.9;
      margin-bottom: 20px;
    }
    
    .intro-price {
      margin-top: 40px;
      padding-top: 40px;
      border-top: 1px solid var(--sand);
    }
    
    .price-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 10px;
    }
    
    .price-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 52px;
      font-weight: 400;
      color: #f5f3ef;
    }
    
    .intro-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
    }
    
    .stat-card {
      background: rgba(0,0,0,0.3); border: 1px solid rgba(196, 166, 124, 0.4);
      padding: 35px;
      text-align: center;
    }
    
    .stat-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 38px;
      font-weight: 400;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #888;
    }
    
    /* FULL WIDTH IMAGE */
    .full-image {
      width: 100vw;
      margin-left: calc(-50vw + 50%);
      height: 500px;
      overflow: hidden;
    }
    
    .full-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    /* FLOORPLAN SECTION */
    .floorplan-section {
      padding: 100px 0;
      background: rgba(0,0,0,0.3); border: 1px solid rgba(196, 166, 124, 0.4);
      margin: 80px 0;
    }
    
    .floorplan-header {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .section-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 15px;
    }
    
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 38px;
      font-weight: 400;
    }
    
    .floorplan-image {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 40px;
    }
    
    .floorplan-image img {
      width: 100%;
      height: auto;
    }
    
    .specs-bar {
      display: flex;
      justify-content: center;
      gap: 60px;
      margin-top: 50px;
      padding-top: 50px;
      border-top: 1px solid var(--sand);
    }
    
    .spec {
      text-align: center;
    }
    
    .spec-num {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 400;
    }
    
    .spec-unit {
      font-size: 14px;
      color: #888;
    }
    
    .spec-name {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #888;
      margin-top: 5px;
    }
    
    /* GALLERY */
    .gallery {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 0 0 80px 0;
    }
    
    .gallery img {
      width: 100%;
      height: 350px;
      object-fit: cover;
    }
    
    /* INVESTMENT SECTION */
    .investment {
      background: #1a1f16;
      color: white;
      padding: 100px 0;
    }
    
    .investment .section-label {
      color: var(--gold);
    }
    
    .investment .section-title {
      color: white;
      margin-bottom: 60px;
    }
    
    .investment-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .invest-card {
      text-align: center;
      padding: 40px 30px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    
    .invest-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 15px;
    }
    
    .invest-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 400;
      margin-bottom: 10px;
    }
    
    .invest-note {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
    }
    
    /* JOURNEY SECTION */
    .journey {
      padding: 100px 0;
    }
    
    .journey-header {
      text-align: center;
      margin-bottom: 70px;
    }
    
    .timeline {
      max-width: 700px;
      margin: 0 auto;
    }
    
    .step {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 40px;
      padding: 40px 0;
      border-bottom: 1px solid var(--sand);
    }
    
    .step:last-child { border-bottom: none; }
    
    .step-num {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 64px;
      font-weight: 400;
      color: var(--sand);
      line-height: 1;
    }
    
    .step-content h3 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      font-weight: 400;
      margin-bottom: 5px;
    }
    
    .step-timing {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 15px;
      display: block;
    }
    
    .step-content p {
      color: #555;
      font-size: 15px;
    }
    
    .highlight {
      color: #f5f3ef;
      font-weight: 500;
    }
    
    /* INCLUDED SECTION */
    .included {
      background: rgba(196, 166, 124, 0.08);
      padding: 100px 0;
    }
    
    .included-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 80px;
      max-width: 900px;
      margin: 60px auto 0;
    }
    
    .included-col h4 {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 25px;
      color: #C4A67C;
    }
    
    .included-col ul {
      list-style: none;
      column-count: 2;
      column-gap: 40px;
    }
    
    .included-col.single ul {
      column-count: 1;
    }
    
    .included-col li {
      padding: 10px 0;
      font-size: 14px;
      color: #ffffff;
      border-bottom: 1px solid rgba(255,255,255,0.15);
    }
    
    .not-included h4 { color: #bbb; }
    .not-included li { color: #bbb; }
    
    /* HOA SECTION */
    .hoa {
      padding: 80px 0;
      background: rgba(0,0,0,0.3); border: 1px solid rgba(196, 166, 124, 0.4);
    }
    
    .hoa-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      max-width: 800px;
      margin: 50px auto 0;
    }
    
    .hoa-fee {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      border-bottom: 1px solid var(--sand);
      font-size: 15px;
    }
    
    .hoa-amount {
      font-weight: 500;
      color: var(--gold);
    }
    
    .hoa-note {
      font-size: 12px;
      color: #888;
      font-style: italic;
      margin-top: 15px;
    }
    
    .hoa-list {
      list-style: none;
    }
    
    .hoa-list li {
      padding: 8px 0;
      font-size: 14px;
      color: #555;
    }
    
    .hoa-list li::before {
      content: '✓';
      color: var(--forest);
      margin-right: 12px;
      font-weight: bold;
    }
    
    /* FOOTER */
    .footer {
      background: #1a1f16;
      color: white;
      padding: 80px 0;
      text-align: center;
    }
    
    .footer-cta {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 36px;
      font-weight: 400;
      font-style: italic;
      margin-bottom: 30px;
    }
    
    .footer-contact {
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 5px;
    }
    
    .footer-email {
      font-size: 18px;
      color: var(--gold);
      text-decoration: none;
      letter-spacing: 1px;
    }
    
    .footer-whatsapp {
      margin-top: 15px;
    }
    
    .footer-whatsapp a {
      color: #25D366;
      text-decoration: none;
      font-weight: 500;
    }
    
    .disclaimer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      line-height: 1.8;
    }
    
    /* RESPONSIVE */
    @media (max-width: 768px) {
      .hero { height: 60vh; min-height: 400px; }
      .hero-title { font-size: 42px; }
      .hero-overlay { padding: 40px 30px; }
      .header-bar { padding: 20px 30px; }
      .content { padding: 0 25px; }
      .intro { grid-template-columns: 1fr; gap: 50px; padding: 60px 0; }
      .intro-text h2 { font-size: 32px; }
      .price-value { font-size: 38px; }
      .intro-stats { grid-template-columns: 1fr 1fr; gap: 15px; }
      .stat-card { padding: 25px; }
      .stat-value { font-size: 28px; }
      .full-image { height: 300px; }
      .floorplan-section { padding: 60px 0; }
      .section-title { font-size: 28px; }
      .specs-bar { flex-wrap: wrap; gap: 30px; }
      .gallery { grid-template-columns: 1fr; }
      .gallery img { height: 250px; }
      .investment { padding: 60px 0; }
      .investment-grid { grid-template-columns: 1fr; gap: 20px; }
      .journey { padding: 60px 0; }
      .step { grid-template-columns: 60px 1fr; gap: 25px; }
      .step-num { font-size: 42px; }
      .included { padding: 60px 0; }
      .included-grid { grid-template-columns: 1fr; gap: 40px; }
      .included-col ul { column-count: 1; }
      .hoa-grid { grid-template-columns: 1fr; }
      .footer-cta { font-size: 28px; }
    }
  </style>
</head>
<body>

  <!-- HERO SLIDESHOW -->
  <section class="hero">
    <div class="header-bar">
      <div class="header-contact">NOSARA, COSTA RICA</div>
    </div>
    <div class="slideshow">
      ${model.name === 'Casa Elle' ? `
      <img src="https://coyolnosara.com/images/homes/elle/hero-exterior.jpg" alt="${model.name}" class="slide active">
      <img src="https://coyolnosara.com/images/homes/elle/pool-exterior.jpg" alt="Pool" class="slide">
      <img src="https://coyolnosara.com/images/homes/elle/living-room.jpg" alt="Living Room" class="slide">
      <img src="https://coyolnosara.com/images/homes/elle/master-bedroom.jpg" alt="Master Bedroom" class="slide">
      <img src="https://coyolnosara.com/images/homes/elle/kitchen.jpg" alt="Kitchen" class="slide">
      ` : `
      <img src="${model.render_url || 'https://coyolnosara.com/images/homes/default-hero.jpg'}" alt="${model.name}" class="slide active">
      `}
    </div>
    <div class="hero-overlay">
      <div class="hero-badge">Move-In Ready</div>
      <h1 class="hero-title">${model.name}</h1>
      <p class="hero-subtitle">Lot ${lot.lot_number} · Mar Azul · ${model.bedrooms || 4} Bedrooms · ${model.bathrooms || 4.5} Baths</p>
    </div>
  </section>

  <!-- INTRO -->
  <section class="intro content">
    <div class="intro-text">
      <h2>A Home, Complete</h2>
      <p>${model.name} stands finished on a gentle slope within Mar Azul, ${Math.round(model.interior_sqm)} square metres of considered space where one might settle without fuss or further arrangement.</p>
      <p>The work is done. What remains is simply to arrive.</p>
      <div class="intro-price">
        <div class="price-label">Total Investment</div>
        <div class="price-value">${fmt(total)}</div>
      </div>
    </div>
    <div class="intro-stats">
      <div class="stat-card">
        <div class="stat-value">${Math.round(model.interior_sqm)}</div>
        <div class="stat-label">SQM Interior</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(model.pool_sqm)}</div>
        <div class="stat-label">SQM Pool</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${model.bedrooms || 4}</div>
        <div class="stat-label">Bedrooms</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${lot.area?.toLocaleString() || '—'}</div>
        <div class="stat-label">SQM Lot</div>
      </div>
    </div>
  </section>

  <!-- GALLERY -->
  <section class="content">
    <div class="gallery">
      ${model.name === 'Casa Elle' ? `
      <img src="https://coyolnosara.com/images/homes/elle/living-room.jpg" alt="Living Room">
      <img src="https://coyolnosara.com/images/homes/elle/bathroom.jpg" alt="Bathroom">
      <img src="https://coyolnosara.com/images/homes/elle/kitchen.jpg" alt="Kitchen">
      <img src="https://coyolnosara.com/images/homes/elle/pool-exterior.jpg" alt="Pool">
      ` : `
      <img src="${model.render_url || 'https://coyolnosara.com/images/homes/default-hero.jpg'}" alt="${model.name}">
      `}
    </div>
  </section>

  <!-- FLOORPLAN -->
  <section class="floorplan-section">
    <div class="floorplan-header">
      <div class="section-label">Architecture</div>
      <h2 class="section-title">Floor Plan</h2>
    </div>
    <div class="floorplan-image">
      <img src="${model.floorplan_url || model.render_url || 'https://coyolnosara.com/images/homes/default-floorplan.jpg'}" alt="${model.name} Floor Plan">
    </div>
    <div class="specs-bar">
      <div class="spec">
        <div class="spec-num">${Math.round(model.interior_sqm)} <span class="spec-unit">m²</span></div>
        <div class="spec-name">Interior</div>
      </div>
      <div class="spec">
        <div class="spec-num">${Math.round(model.covered_terrace_sqm)} <span class="spec-unit">m²</span></div>
        <div class="spec-name">Covered Terrace</div>
      </div>
      <div class="spec">
        <div class="spec-num">${Math.round(model.open_terrace_sqm)} <span class="spec-unit">m²</span></div>
        <div class="spec-name">Open Terrace</div>
      </div>
      <div class="spec">
        <div class="spec-num">${Math.round(model.pool_sqm)} <span class="spec-unit">m²</span></div>
        <div class="spec-name">Pool</div>
      </div>
    </div>
  </section>

  <!-- INVESTMENT -->
  <section class="investment">
    <div class="content" style="text-align: center;">
      <div class="section-label">Investment</div>
      <h2 class="section-title">Simple Acquisition</h2>
      <div class="investment-grid">
        <div class="invest-card">
          <div class="invest-label">Total Price</div>
          <div class="invest-value">${fmt(total)}</div>
          <div class="invest-note">Lot + Finished Home</div>
        </div>
        <div class="invest-card">
          <div class="invest-label">Reservation (10%)</div>
          <div class="invest-value">${fmt(deposit)}</div>
          <div class="invest-note">Held in Escrow</div>
        </div>
        <div class="invest-card">
          <div class="invest-label">Balance at Closing</div>
          <div class="invest-value">${fmt(balance)}</div>
          <div class="invest-note">Within 30-45 Days</div>
        </div>
      </div>
    </div>
  </section>

  <!-- JOURNEY -->
  <section class="journey content">
    <div class="journey-header">
      <div class="section-label">Process</div>
      <h2 class="section-title">Your Path to Ownership</h2>
    </div>
    <div class="timeline">
      <div class="step">
        <div class="step-num">01</div>
        <div class="step-content">
          <h3>Reserve</h3>
          <span class="step-timing">Today</span>
          <p>Secure ${model.name} with a <span class="highlight">${fmt(deposit)} reservation deposit</span>. Your funds are held in escrow while we prepare closing documents.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">02</div>
        <div class="step-content">
          <h3>Due Diligence</h3>
          <span class="step-timing">2–4 Weeks</span>
          <p>Our legal partner <span class="highlight">ICS</span> handles company formation, title review, and closing preparation. Visit anytime for a private showing.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">03</div>
        <div class="step-content">
          <h3>Close</h3>
          <span class="step-timing">30–45 Days</span>
          <p>Transfer the remaining <span class="highlight">${fmt(balance)}</span> at closing. Title transfers to your Costa Rican corporation. Receive your keys.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">04</div>
        <div class="step-content">
          <h3>Move In</h3>
          <span class="step-timing">Immediately</span>
          <p>Your home is <span class="highlight">fully finished and furnished</span>. Unpack, settle in, and begin living the Nosara lifestyle.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- INCLUDED -->
  <section class="included">
    <div class="content" style="text-align: center;">
      <div class="section-label">Turnkey</div>
      <h2 class="section-title">What's Included</h2>
    </div>
    <div class="included-grid content">
      <div class="included-col">
        <h4>Included in Price</h4>
        <ul>
          <li>Finished house with premium materials</li>
          <li>Custom closets & built-ins</li>
          <li>Designer bathrooms</li>
          <li>Gourmet kitchen with appliances</li>
          <li>Kitchen cutlery, plates & utensils</li>
          <li>Laundry room with washer & dryer</li>
          <li>Central A/C throughout</li>
          <li>Ceiling fans indoor & outdoor</li>
          <li>Feature lighting & wall sconces</li>
          <li>Infinity pool with premium finishes</li>
          <li>Covered & open terraces</li>
          <li>Professional landscaping</li>
          <li>Exterior & pathway lighting</li>
          <li>Privacy gate</li>
          <li>Interior design</li>
          <li>Complete furniture package</li>
          <li>Garden & pool furniture</li>
        </ul>
      </div>
      <div class="included-col single not-included">
        <h4>Not Included</h4>
        <ul>
          <li>Solar power backup</li>
          <li>Personal items & artwork</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- HOA -->
  <section class="hoa">
    <div class="content" style="text-align: center;">
      <div class="section-label">Community</div>
      <h2 class="section-title">Mar Azul HOA</h2>
    </div>
    <div class="hoa-grid content">
      <div>
        <h4 style="font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; color: #888;">Monthly Fee</h4>
        <div class="hoa-fee">
          <span>HOA Dues</span>
          <span class="hoa-amount">~${fmt(hoaFull)}/month</span>
        </div>
        <p class="hoa-note">Based on ${lot.area?.toLocaleString()} m² lot at $0.30/m²/month</p>
      </div>
      <div>
        <h4 style="font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; color: #888;">Includes</h4>
        <ul class="hoa-list">
          <li>Water</li>
          <li>Garbage Collection</li>
          <li>24/7 Security</li>
          <li>Gated Access</li>
          <li>Road Maintenance</li>
          <li>Tennis Court</li>
          <li>Common Grounds</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <p class="footer-cta">Ready to make it yours?</p>
    <p class="footer-contact">Ruth Tal · Coyol Nosara Real Estate</p>
    <a href="mailto:info@coyolnosara.com" class="footer-email">info@coyolnosara.com</a>
    <p class="footer-whatsapp"><a href="https://wa.me/13435747238">WhatsApp +1 (343) 574-7238</a></p>
    <p class="disclaimer">
      Prepared exclusively for ${lead.full_name}<br>
      Prices valid for 30 days · © 2026 Coyol Group
    </p>
  </footer>

  <script>
    // Hero Slideshow
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    
    function nextSlide() {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }
    
    setInterval(nextSlide, 4000);
  </script>
</body>
</html>`;
}
