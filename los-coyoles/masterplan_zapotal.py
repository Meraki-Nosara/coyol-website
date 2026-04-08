"""
LOS COYOLES MASTERPLAN - ZAPOTAL STYLE
Ultra-premium, low-density estate development

Zapotal characteristics:
- Large estate lots (2,000-8,000 m²)
- Low density (~50-70 homesites across entire property)
- Premium amenities (beach club style)
- Generous green buffers between lots
- Nature-forward design
- High price points ($500K - $2M+)
"""

import json
import os
import math
from PIL import Image, ImageDraw, ImageFont

os.chdir('/Users/Coyol/.openclaw/workspace/los-coyoles')

with open('terrain-detailed.json') as f:
    terrain = json.load(f)

print("=" * 70)
print("LOS COYOLES - ZAPOTAL-STYLE MASTERPLAN")
print("Ultra-Premium Estate Development")
print("=" * 70)

# =============================================================================
# ZAPOTAL PRODUCT STRATEGY
# =============================================================================

print(f"\n{'='*70}")
print("PRODUCT STRATEGY (Zapotal Model)")
print("=" * 70)

"""
Zapotal has ~150 homesites on 650 hectares = very low density
Los Coyoles: ~90 hectares developable → ~55-65 estate lots

Product tiers:
1. ESTATE LOTS (ocean view ridges): 4,000-8,000 m² @ $250-350/m² = $1M-$2.8M
2. HILLSIDE LOTS (park/mountain view): 2,500-4,000 m² @ $150-200/m² = $375K-$800K
3. GARDEN LOTS (amenity adjacent): 2,000-3,000 m² @ $120-150/m² = $240K-$450K

NO affordable tier - this is pure premium positioning
"""

print("""
ZAPOTAL POSITIONING:
  • Estate lots: 4,000-8,000 m² ($1M-$2.8M)
  • Hillside lots: 2,500-4,000 m² ($400K-$800K)  
  • Garden lots: 2,000-3,000 m² ($250K-$450K)
  • NO affordable tier
  • Target: 55-65 total homesites
""")

# Property bounds
min_lon, max_lon = -85.643, -85.610
min_lat, max_lat = 9.987, 10.007

# =============================================================================
# LOT LAYOUT - ZAPOTAL STYLE
# =============================================================================

lots = []
lot_id = 1

# PHASE 1 - THE SUNSET RIDGE
print("\n" + "-" * 50)
print("PHASE 1: THE SUNSET RIDGE (32 ha)")
print("-" * 50)

# Estate Lots - Premium ocean view (west-facing ridge)
# These get SUNSET views - most valuable
p1_estate = [
    {'pos': (-85.642, 10.005), 'size': 6500, 'name': 'Sunset Estate 1'},
    {'pos': (-85.641, 10.003), 'size': 5800, 'name': 'Sunset Estate 2'},
    {'pos': (-85.640, 10.001), 'size': 5500, 'name': 'Sunset Estate 3'},
    {'pos': (-85.639, 10.005), 'size': 7200, 'name': 'Sunset Estate 4'},
    {'pos': (-85.638, 10.003), 'size': 6000, 'name': 'Sunset Estate 5'},
    {'pos': (-85.637, 10.006), 'size': 8000, 'name': 'Sunset Estate 6'},  # Corner lot - largest
    {'pos': (-85.636, 10.004), 'size': 5500, 'name': 'Sunset Estate 7'},
    {'pos': (-85.635, 10.002), 'size': 5000, 'name': 'Sunset Estate 8'},
]

for lot in p1_estate:
    lots.append({
        'id': lot_id, 'phase': 1, 'type': 'estate',
        'pos': lot['pos'], 'size': lot['size'], 'name': lot['name']
    })
    lot_id += 1
print(f"  Estate Lots: {len(p1_estate)} (avg {sum(l['size'] for l in p1_estate)//len(p1_estate):,}m²)")

# Hillside Lots - Secondary views
p1_hillside = [
    {'pos': (-85.641, 9.999), 'size': 3500},
    {'pos': (-85.639, 9.998), 'size': 3200},
    {'pos': (-85.637, 10.000), 'size': 3800},
    {'pos': (-85.635, 9.999), 'size': 3000},
    {'pos': (-85.640, 10.004), 'size': 3500},  # Inner ridge
    {'pos': (-85.638, 10.001), 'size': 3200},
]

for lot in p1_hillside:
    lots.append({
        'id': lot_id, 'phase': 1, 'type': 'hillside',
        'pos': lot['pos'], 'size': lot['size']
    })
    lot_id += 1
print(f"  Hillside Lots: {len(p1_hillside)} (avg {sum(l['size'] for l in p1_hillside)//len(p1_hillside):,}m²)")

# Garden Lots - Near amenities
p1_garden = [
    {'pos': (-85.639, 9.996), 'size': 2500},
    {'pos': (-85.637, 9.996), 'size': 2800},
    {'pos': (-85.635, 9.996), 'size': 2500},
    {'pos': (-85.633, 9.997), 'size': 2200},
]

for lot in p1_garden:
    lots.append({
        'id': lot_id, 'phase': 1, 'type': 'garden',
        'pos': lot['pos'], 'size': lot['size']
    })
    lot_id += 1
print(f"  Garden Lots: {len(p1_garden)} (avg {sum(l['size'] for l in p1_garden)//len(p1_garden):,}m²)")

# PHASE 2 - THE PANORAMA
print("\n" + "-" * 50)
print("PHASE 2: THE PANORAMA (34 ha)")
print("-" * 50)

# Estate Lots - Central ridge, 360° views
p2_estate = [
    {'pos': (-85.631, 10.004), 'size': 7000, 'name': 'Panorama Estate 1'},
    {'pos': (-85.629, 10.005), 'size': 7500, 'name': 'Panorama Estate 2'},
    {'pos': (-85.627, 10.004), 'size': 6500, 'name': 'Panorama Estate 3'},
    {'pos': (-85.625, 10.003), 'size': 6000, 'name': 'Panorama Estate 4'},
    {'pos': (-85.623, 10.002), 'size': 5500, 'name': 'Panorama Estate 5'},
    {'pos': (-85.628, 10.002), 'size': 5800, 'name': 'Panorama Estate 6'},
    {'pos': (-85.626, 10.001), 'size': 5200, 'name': 'Panorama Estate 7'},
]

for lot in p2_estate:
    lots.append({
        'id': lot_id, 'phase': 2, 'type': 'estate',
        'pos': lot['pos'], 'size': lot['size'], 'name': lot['name']
    })
    lot_id += 1
print(f"  Estate Lots: {len(p2_estate)} (avg {sum(l['size'] for l in p2_estate)//len(p2_estate):,}m²)")

# Hillside Lots
p2_hillside = [
    {'pos': (-85.631, 10.001), 'size': 3500},
    {'pos': (-85.629, 10.000), 'size': 3800},
    {'pos': (-85.627, 9.999), 'size': 3200},
    {'pos': (-85.624, 10.000), 'size': 3500},
    {'pos': (-85.622, 9.999), 'size': 3000},
]

for lot in p2_hillside:
    lots.append({
        'id': lot_id, 'phase': 2, 'type': 'hillside',
        'pos': lot['pos'], 'size': lot['size']
    })
    lot_id += 1
print(f"  Hillside Lots: {len(p2_hillside)} (avg {sum(l['size'] for l in p2_hillside)//len(p2_hillside):,}m²)")

# Garden Lots
p2_garden = [
    {'pos': (-85.630, 9.996), 'size': 2800},
    {'pos': (-85.627, 9.996), 'size': 2500},
    {'pos': (-85.624, 9.996), 'size': 2500},
]

for lot in p2_garden:
    lots.append({
        'id': lot_id, 'phase': 2, 'type': 'garden',
        'pos': lot['pos'], 'size': lot['size']
    })
    lot_id += 1
print(f"  Garden Lots: {len(p2_garden)} (avg {sum(l['size'] for l in p2_garden)//len(p2_garden):,}m²)")

# PHASE 3 - THE RESERVE
print("\n" + "-" * 50)
print("PHASE 3: THE RESERVE (~25 ha)")
print("-" * 50)

# Estate Lots - Eastern ridge
p3_estate = [
    {'pos': (-85.617, 10.005), 'size': 6000, 'name': 'Reserve Estate 1'},
    {'pos': (-85.615, 10.006), 'size': 7000, 'name': 'Reserve Estate 2'},
    {'pos': (-85.613, 10.005), 'size': 6500, 'name': 'Reserve Estate 3'},
    {'pos': (-85.611, 10.003), 'size': 5500, 'name': 'Reserve Estate 4'},
    {'pos': (-85.614, 10.003), 'size': 5000, 'name': 'Reserve Estate 5'},
]

for lot in p3_estate:
    lots.append({
        'id': lot_id, 'phase': 3, 'type': 'estate',
        'pos': lot['pos'], 'size': lot['size'], 'name': lot['name']
    })
    lot_id += 1
print(f"  Estate Lots: {len(p3_estate)} (avg {sum(l['size'] for l in p3_estate)//len(p3_estate):,}m²)")

# Hillside Lots
p3_hillside = [
    {'pos': (-85.618, 10.002), 'size': 3500},
    {'pos': (-85.616, 10.001), 'size': 3200},
    {'pos': (-85.613, 10.001), 'size': 3500},
    {'pos': (-85.619, 9.999), 'size': 3000},
]

for lot in p3_hillside:
    lots.append({
        'id': lot_id, 'phase': 3, 'type': 'hillside',
        'pos': lot['pos'], 'size': lot['size']
    })
    lot_id += 1
print(f"  Hillside Lots: {len(p3_hillside)} (avg {sum(l['size'] for l in p3_hillside)//len(p3_hillside):,}m²)")

# Garden Lots
p3_garden = [
    {'pos': (-85.617, 9.997), 'size': 2800},
    {'pos': (-85.614, 9.997), 'size': 2500},
    {'pos': (-85.612, 9.998), 'size': 2200},
]

for lot in p3_garden:
    lots.append({
        'id': lot_id, 'phase': 3, 'type': 'garden',
        'pos': lot['pos'], 'size': lot['size']
    })
    lot_id += 1
print(f"  Garden Lots: {len(p3_garden)} (avg {sum(l['size'] for l in p3_garden)//len(p3_garden):,}m²)")

# =============================================================================
# SUMMARY
# =============================================================================

estate_lots = [l for l in lots if l['type'] == 'estate']
hillside_lots = [l for l in lots if l['type'] == 'hillside']
garden_lots = [l for l in lots if l['type'] == 'garden']

# Calculate values
estate_value = sum(l['size'] * 300 for l in estate_lots)  # $300/m²
hillside_value = sum(l['size'] * 175 for l in hillside_lots)  # $175/m²
garden_value = sum(l['size'] * 135 for l in garden_lots)  # $135/m²
total_value = estate_value + hillside_value + garden_value

print(f"\n{'='*70}")
print("PROJECT SUMMARY - ZAPOTAL STYLE")
print("=" * 70)

print(f"""
HOMESITES:
  Estate Lots:   {len(estate_lots):2d} lots × avg {sum(l['size'] for l in estate_lots)//len(estate_lots):,}m² = {sum(l['size'] for l in estate_lots)/10000:.1f} ha
  Hillside Lots: {len(hillside_lots):2d} lots × avg {sum(l['size'] for l in hillside_lots)//len(hillside_lots):,}m² = {sum(l['size'] for l in hillside_lots)/10000:.1f} ha
  Garden Lots:   {len(garden_lots):2d} lots × avg {sum(l['size'] for l in garden_lots)//len(garden_lots):,}m² = {sum(l['size'] for l in garden_lots)/10000:.1f} ha
  ─────────────────────────────────────────────
  TOTAL:         {len(lots):2d} homesites

PRICE RANGE:
  Estate:   ${min(l['size']*300 for l in estate_lots)/1000:.0f}K - ${max(l['size']*300 for l in estate_lots)/1000000:.1f}M
  Hillside: ${min(l['size']*175 for l in hillside_lots)/1000:.0f}K - ${max(l['size']*175 for l in hillside_lots)/1000:.0f}K
  Garden:   ${min(l['size']*135 for l in garden_lots)/1000:.0f}K - ${max(l['size']*135 for l in garden_lots)/1000:.0f}K

PROJECT VALUE:
  Estate:   ${estate_value/1000000:.1f}M ({len(estate_lots)} lots)
  Hillside: ${hillside_value/1000000:.1f}M ({len(hillside_lots)} lots)
  Garden:   ${garden_value/1000000:.1f}M ({len(garden_lots)} lots)
  ─────────────────────────────────────────────
  TOTAL:    ${total_value/1000000:.1f}M
""")

# =============================================================================
# AMENITIES - ZAPOTAL STYLE (Club/Beach Club vibe)
# =============================================================================

print(f"{'='*70}")
print("AMENITIES - THE COYOLES CLUB")
print("=" * 70)

amenities = {
    'clubhouse': {
        'pos': (-85.636, 9.9965),
        'size': (80, 45),
        'desc': 'The Coyoles Club - Restaurant, bar, infinity pool deck, event lawn'
    },
    'pool': {
        'pos': (-85.636, 9.994),
        'size': (40, 20),
        'desc': 'Infinity Edge Pool - Ocean view, heated, 25m lap lanes'
    },
    'spa': {
        'pos': (-85.634, 9.9965),
        'size': (40, 30),
        'desc': 'Wellness Center - Spa, yoga studio, fitness'
    },
    'tennis': {
        'pos': (-85.639, 9.994),
        'size': (45, 25),
        'desc': 'Racquet Club - 2 tennis, 4 pickleball'
    },
    'kids': {
        'pos': (-85.633, 9.994),
        'size': (35, 35),
        'desc': 'Family Zone - Playground, splash pad, picnic'
    },
    'farm': {
        'pos': (-85.627, 9.994),
        'size': (50, 40),
        'desc': 'Organic Farm - Gardens, farm-to-table, education'
    },
    'stables': {
        'pos': (-85.615, 9.995),
        'size': (60, 40),
        'desc': 'Equestrian Center - Stables, riding trails'
    },
    'trailhead': {
        'pos': (-85.636, 9.992),
        'size': (25, 25),
        'desc': 'Trail Center - Bikes, maps, nature guides'
    }
}

print("\nTHE COYOLES CLUB:")
for name, data in amenities.items():
    print(f"  • {name.title()}: {data['desc']}")

# =============================================================================
# GENERATE MAP
# =============================================================================

print(f"\n{'='*70}")
print("GENERATING MASTERPLAN...")
print("=" * 70)

width = 4200
height = int(width * (max_lat - min_lat) / (max_lon - min_lon) * 1.15)
img = Image.new('RGB', (width, height), '#F8F6F3')  # Warm off-white
draw = ImageDraw.Draw(img)

def px(lon, lat):
    x = int((lon - min_lon) / (max_lon - min_lon) * width * 0.88) + 80
    y = int((max_lat - lat) / (max_lat - min_lat) * height * 0.82) + 150
    return (x, y)

# Terrain gradient
print("  Drawing terrain...")
for t in terrain:
    x, y = px(t['lon'], t['lat'])
    e = t['elevation']
    # Zapotal-style muted earth tones
    if e < 115:
        color = '#8FBC8F'  # Sage green (corridor)
    elif e < 180:
        color = '#C4B7A6'  # Warm taupe (flat)
    elif e < 270:
        color = '#D4C4B0'  # Sand (hillside)
    else:
        color = '#E8DCC8'  # Cream (ridge)
    draw.ellipse([x-55, y-55, x+55, y+55], fill=color)

# Blur for smooth gradient
from PIL import ImageFilter
img = img.filter(ImageFilter.GaussianBlur(radius=25))
draw = ImageDraw.Draw(img)

# Property boundary (subtle)
outline = [(-85.643, min_lat), (-85.643, max_lat), (-85.610, max_lat), (-85.610, min_lat), (-85.643, min_lat)]
draw.line([px(p[0], p[1]) for p in outline], fill='#8B7355', width=4)

# Biological corridor
corridor = [(-85.643, 9.9925), (-85.610, 9.9935), (-85.610, 9.987), (-85.643, 9.987)]
draw.polygon([px(p[0], p[1]) for p in corridor], fill='#7CAA7C', outline='#5C8A5C', width=3)

# Quebradas
for q in [
    [(-85.643, 9.9895), (-85.628, 9.990), (-85.615, 9.991), (-85.610, 9.992)],
    [(-85.640, 9.988), (-85.628, 9.989)],
]:
    pts = [px(p[0], p[1]) for p in q]
    draw.line(pts, fill='#5B8FAD', width=5)

# Roads - Zapotal style (earth tones, organic curves)
print("  Drawing roads...")

def draw_road(points, width_outer=14, width_inner=9):
    pts = [px(p[0], p[1]) for p in points]
    draw.line(pts, fill='#6B5344', width=width_outer)
    draw.line(pts, fill='#D4C8BC', width=width_inner)

# Main entry road
draw_road([(-85.644, 9.996), (-85.636, 9.996)], 18, 12)

# Phase 1 ridge road (organic curve)
draw_road([
    (-85.636, 9.996), (-85.637, 9.999), (-85.638, 10.002),
    (-85.638, 10.004), (-85.637, 10.006), (-85.635, 10.005),
    (-85.634, 10.003), (-85.635, 10.000), (-85.636, 9.996)
])

# Spine road
draw_road([(-85.636, 9.996), (-85.627, 9.996), (-85.615, 9.996)])

# Phase 2 ridge
draw_road([
    (-85.627, 9.996), (-85.628, 9.999), (-85.629, 10.002),
    (-85.628, 10.004), (-85.626, 10.005), (-85.624, 10.003),
    (-85.623, 10.001), (-85.624, 9.998), (-85.627, 9.996)
])

# Phase 3 ridge
draw_road([
    (-85.615, 9.996), (-85.616, 9.999), (-85.616, 10.002),
    (-85.615, 10.005), (-85.613, 10.006), (-85.611, 10.004),
    (-85.612, 10.001), (-85.614, 9.999), (-85.615, 9.996)
])

# Trails
print("  Drawing trails...")
trails = [
    [(-85.636, 9.992), (-85.628, 9.9915), (-85.620, 9.992), (-85.612, 9.993)],
    [(-85.636, 9.992), (-85.636, 9.994)],
    [(-85.627, 9.994), (-85.627, 9.992)],
    [(-85.615, 9.995), (-85.615, 9.993)],
]
for trail in trails:
    pts = [px(p[0], p[1]) for p in trail]
    draw.line(pts, fill='#8B7355', width=4)

# Amenity zone
print("  Drawing amenities...")
amenity_zone = [(-85.640, 9.998), (-85.632, 9.998), (-85.632, 9.992), (-85.640, 9.992)]
draw.polygon([px(p[0], p[1]) for p in amenity_zone], fill='#EDE8E0', outline='#C4B7A6', width=3)

# Phase 2 secondary amenity
farm_zone = [(-85.629, 9.996), (-85.625, 9.996), (-85.625, 9.993), (-85.629, 9.993)]
draw.polygon([px(p[0], p[1]) for p in farm_zone], fill='#D4E8D4', outline='#A4C4A4', width=2)

# Phase 3 stables
stable_zone = [(-85.617, 9.997), (-85.613, 9.997), (-85.613, 9.993), (-85.617, 9.993)]
draw.polygon([px(p[0], p[1]) for p in stable_zone], fill='#E8DCC8', outline='#C4B090', width=2)

# Amenity buildings
amenity_colors = {
    'clubhouse': ('#8B7355', '#6B5344'),
    'pool': ('#5B8FAD', '#3B6F8D'),
    'spa': ('#C4A484', '#A48464'),
    'tennis': ('#7CAA7C', '#5C8A5C'),
    'kids': ('#E8A87C', '#C88860'),
    'farm': ('#8FBC8F', '#6F9C6F'),
    'stables': ('#B8976C', '#987650'),
    'trailhead': ('#8B7355', '#6B5344'),
}

for name, data in amenities.items():
    x, y = px(data['pos'][0], data['pos'][1])
    w, h = data['size'][0] // 2, data['size'][1] // 2
    fill, outline = amenity_colors.get(name, ('#AAA', '#888'))
    if name == 'pool':
        draw.ellipse([x-w, y-h, x+w, y+h], fill=fill, outline=outline, width=3)
    else:
        # Rounded rectangle effect
        draw.rectangle([x-w+5, y-h, x+w-5, y+h], fill=fill)
        draw.rectangle([x-w, y-h+5, x+w, y+h-5], fill=fill)
        draw.ellipse([x-w, y-h, x-w+10, y-h+10], fill=fill)
        draw.ellipse([x+w-10, y-h, x+w, y-h+10], fill=fill)
        draw.ellipse([x-w, y+h-10, x-w+10, y+h], fill=fill)
        draw.ellipse([x+w-10, y+h-10, x+w, y+h], fill=fill)

# Draw lots
print("  Drawing homesites...")

lot_colors = {
    'estate': ('#D4A574', '#B07040'),     # Warm copper
    'hillside': ('#B8C4A8', '#8CA078'),   # Sage
    'garden': ('#C4B8A8', '#9C8C7C'),     # Taupe
}

for lot in lots:
    x, y = px(lot['pos'][0], lot['pos'][1])
    
    # Larger lots = larger markers (Zapotal generous spacing)
    if lot['type'] == 'estate':
        w, h = 42, 34
    elif lot['type'] == 'hillside':
        w, h = 34, 28
    else:
        w, h = 28, 23
    
    fill, outline = lot_colors[lot['type']]
    
    # Rounded lot markers
    draw.rounded_rectangle([x-w, y-h, x+w, y+h], radius=8, fill=fill, outline=outline, width=2)
    
    # Lot number
    draw.text((x-12, y-10), str(lot['id']), fill='#4A3C2C')

# Labels
print("  Adding labels...")
try:
    ft = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 84)
    fm = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 52)
    fs = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 36)
    fi = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Italic.ttf', 30)
    fss = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 26)
    fsss = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 20)
except:
    ft = fm = fs = fi = fss = fsss = ImageFont.load_default()

# Title - Zapotal style (elegant, serif)
draw.rectangle([60, 50, 1200, 240], fill='#3C3228')
draw.text((80, 60), 'LOS COYOLES', fill='#E8DCC8', font=ft)
draw.text((80, 150), 'An Ecological Estate Community', fill='#B8A888', font=fi)

# Phase names (elegant naming)
phases = [
    (-85.638, 10.009, 'THE SUNSET RIDGE', 'Phase 1 • 32 ha', '#8B7355'),
    (-85.626, 10.0085, 'THE PANORAMA', 'Phase 2 • 34 ha', '#5B8FAD'),
    (-85.614, 10.009, 'THE RESERVE', 'Phase 3 • 25 ha', '#7CAA7C'),
]

for lon, lat, name, sub, color in phases:
    x, y = px(lon, lat)
    draw.text((x-100, y), name, fill=color, font=fm)
    draw.text((x-70, y+55), sub, fill='#6B5B4B', font=fss)

# Zone labels
zones = [
    (-85.636, 9.995, 'THE COYOLES CLUB', '#6B5344'),
    (-85.627, 9.9945, 'THE FARM', '#5C8A5C'),
    (-85.615, 9.995, 'EQUESTRIAN', '#987650'),
    (-85.625, 9.990, 'NATURE RESERVE', '#4A6A4A'),
]

for lon, lat, text, color in zones:
    x, y = px(lon, lat)
    draw.text((x-80, y), text, fill=color, font=fss)

# Ocean direction
draw.text((50, height//2-60), '← PACIFIC', fill='#5B8FAD', font=fm)
draw.text((50, height//2), 'OCEAN', fill='#5B8FAD', font=fm)

# Legend
lx, ly = width - 500, 80
draw.rectangle([lx-30, ly-30, width-60, ly+520], fill='#FFFEF8', outline='#C4B8A8', width=2)
draw.text((lx, ly), 'HOMESITES', fill='#3C3228', font=fs)

ly += 60
legend = [
    ('#D4A574', '#B07040', 'Estate Lots (4,000-8,000m²)'),
    ('#B8C4A8', '#8CA078', 'Hillside Lots (2,500-4,000m²)'),
    ('#C4B8A8', '#9C8C7C', 'Garden Lots (2,000-3,000m²)'),
]
for fill, outline, label in legend:
    draw.rounded_rectangle([lx, ly, lx+45, ly+28], radius=5, fill=fill, outline=outline, width=2)
    draw.text((lx+60, ly+4), label, fill='#4A3C2C', font=fsss)
    ly += 40

ly += 20
draw.text((lx, ly), 'AMENITIES', fill='#3C3228', font=fs)
ly += 50

amenity_legend = [
    ('#8B7355', 'The Coyoles Club'),
    ('#5B8FAD', 'Infinity Pool'),
    ('#C4A484', 'Wellness & Spa'),
    ('#7CAA7C', 'Tennis & Pickleball'),
    ('#8FBC8F', 'Organic Farm'),
    ('#B8976C', 'Equestrian Center'),
    ('#8B7355', 'Trail Center'),
]
for color, label in amenity_legend:
    draw.ellipse([lx, ly, lx+22, ly+22], fill=color)
    draw.text((lx+35, ly+2), label, fill='#4A3C2C', font=fsss)
    ly += 30

ly += 20
draw.line([lx, ly+8, lx+45, ly+8], fill='#6B5344', width=10)
draw.line([lx+5, ly+8, lx+40, ly+8], fill='#D4C8BC', width=6)
draw.text((lx+60, ly+2), 'Estate Roads', fill='#4A3C2C', font=fsss)

ly += 35
draw.line([lx, ly+8, lx+45, ly+8], fill='#8B7355', width=4)
draw.text((lx+60, ly+2), 'Nature Trails', fill='#4A3C2C', font=fsss)

# Stats box
sy = height - 220
draw.rectangle([60, sy, 1150, height-60], fill='#3C3228')
draw.text((80, sy+25), 'PROJECT SUMMARY', fill='#B8A888', font=fs)

stats_text = f'{len(lots)} Homesites  •  ${total_value/1000000:.0f}M Total Value  •  91 Hectares'
draw.text((80, sy+80), stats_text, fill='#E8DCC8', font=fss)

details = f'Estate: {len(estate_lots)} lots (${estate_value/1000000:.1f}M)  |  Hillside: {len(hillside_lots)} lots (${hillside_value/1000000:.1f}M)  |  Garden: {len(garden_lots)} lots (${garden_value/1000000:.1f}M)'
draw.text((80, sy+120), details, fill='#A89878', font=fsss)

draw.text((80, sy+155), '40% Nature Reserve  •  Clubhouse  •  Pool  •  Spa  •  Farm  •  Equestrian  •  10km Trails', fill='#888070', font=fsss)

# North arrow
ax, ay = width - 140, height - 200
draw.text((ax+12, ay-55), 'N', fill='#6B5B4B', font=fs)
draw.polygon([(ax+22, ay-40), (ax+5, ay), (ax+40, ay)], fill='#6B5B4B')

# Scale
scale_m = 300
scale_px = int(scale_m / ((max_lon - min_lon) * 111000 * 0.985) * width * 0.88)
bx, by = 80, height - 270
draw.rectangle([bx, by, bx+scale_px, by+10], fill='#6B5B4B')
draw.rectangle([bx+scale_px, by, bx+scale_px*2, by+10], fill='#F8F6F3', outline='#6B5B4B')
draw.text((bx+scale_px-20, by+18), f'{scale_m}m', fill='#6B5B4B', font=fsss)

img.save('los-coyoles-zapotal-style.png', quality=95)
print(f"\n✅ Masterplan saved: los-coyoles-zapotal-style.png")
print(f"   Resolution: {width}x{height}px")
