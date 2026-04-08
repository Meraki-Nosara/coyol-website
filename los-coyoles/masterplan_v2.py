"""
LOS COYOLES MASTERPLAN v2
Developer-driven layout based on:
1. Terrain analysis (elevation data)
2. View corridors (ocean west, mountains east)
3. Infrastructure efficiency (road costs)
4. Product mix (price point diversity)
5. Amenity placement (centralized, accessible)
6. Biological corridor (regulatory requirement)
"""

import json
import os
import math
from PIL import Image, ImageDraw, ImageFont

os.chdir('/Users/Coyol/.openclaw/workspace/los-coyoles')

with open('terrain-detailed.json') as f:
    terrain = json.load(f)

# =============================================================================
# DEVELOPER ANALYSIS
# =============================================================================
print("=" * 60)
print("LOS COYOLES - DEVELOPER MASTERPLAN")
print("=" * 60)

# Property bounds
min_lon, max_lon = -85.643, -85.610
min_lat, max_lat = 9.987, 10.007

# Total area calculation
width_m = (max_lon - min_lon) * 111000 * 0.985  # cos adjustment for latitude
height_m = (max_lat - min_lat) * 111000
total_area_ha = (width_m * height_m) / 10000

print(f"\nPROPERTY ANALYSIS:")
print(f"  Total area: ~{total_area_ha:.0f} hectares")
print(f"  Dimensions: {width_m:.0f}m x {height_m:.0f}m")

# Elevation analysis
elevations = [t['elevation'] for t in terrain]
min_elev, max_elev = min(elevations), max(elevations)
avg_elev = sum(elevations) / len(elevations)

print(f"\nTERRAIN:")
print(f"  Elevation range: {min_elev:.0f}m - {max_elev:.0f}m")
print(f"  Relief: {max_elev - min_elev:.0f}m")

# =============================================================================
# ZONE DEFINITIONS (Based on elevation & views)
# =============================================================================

# Zone 1: Biological Corridor (quebradas) - PROTECTED
# Lowest 25% of elevation = ~17m to ~115m
corridor_threshold = min_elev + (max_elev - min_elev) * 0.25

# Zone 2: Flat/Amenity Zone (mid-low elevation)
# 25-40% elevation = ~115m to ~175m
amenity_threshold = min_elev + (max_elev - min_elev) * 0.40

# Zone 3: Transition Lots (mid elevation, park views)
# 40-65% elevation = ~175m to ~270m
transition_threshold = min_elev + (max_elev - min_elev) * 0.65

# Zone 4: Premium Ocean View Lots (highest elevation)
# Top 35% = ~270m to ~404m
premium_threshold = transition_threshold

print(f"\nZONE THRESHOLDS:")
print(f"  Corridor (protected): < {corridor_threshold:.0f}m")
print(f"  Amenity zone: {corridor_threshold:.0f}m - {amenity_threshold:.0f}m")
print(f"  Park lots: {amenity_threshold:.0f}m - {transition_threshold:.0f}m")
print(f"  Ocean view lots: > {premium_threshold:.0f}m")

# Count points in each zone
corridor_pts = len([t for t in terrain if t['elevation'] < corridor_threshold])
amenity_pts = len([t for t in terrain if corridor_threshold <= t['elevation'] < amenity_threshold])
park_pts = len([t for t in terrain if amenity_threshold <= t['elevation'] < transition_threshold])
premium_pts = len([t for t in terrain if t['elevation'] >= premium_threshold])

print(f"\nTERRAIN DISTRIBUTION:")
print(f"  Corridor: {corridor_pts} pts ({corridor_pts/len(terrain)*100:.0f}%)")
print(f"  Amenity: {amenity_pts} pts ({amenity_pts/len(terrain)*100:.0f}%)")
print(f"  Park lots: {park_pts} pts ({park_pts/len(terrain)*100:.0f}%)")
print(f"  Ocean view: {premium_pts} pts ({premium_pts/len(terrain)*100:.0f}%)")

# =============================================================================
# LOT MIX STRATEGY (Developer economics)
# =============================================================================

print(f"\n" + "=" * 60)
print("PRODUCT MIX STRATEGY")
print("=" * 60)

# Target: ~100-120 lots across all phases
# Mix: 40% ocean view (premium), 35% park lots (mid), 25% affordable

# Ocean view lots: 1,500-3,000 m² @ $150-300/m² = $225K-$900K
ocean_lot_size_avg = 2000  # m²
ocean_lot_count_target = 45
ocean_total_area = ocean_lot_size_avg * ocean_lot_count_target / 10000  # ha

# Park lots: 800-1,500 m² @ $100-150/m² = $80K-$225K  
park_lot_size_avg = 1000  # m²
park_lot_count_target = 40
park_total_area = park_lot_size_avg * park_lot_count_target / 10000  # ha

# Affordable lots: 500-800 m² @ $80-120/m² = $40K-$96K
affordable_lot_size_avg = 650  # m²
affordable_lot_count_target = 25
affordable_total_area = affordable_lot_size_avg * affordable_lot_count_target / 10000  # ha

total_lots = ocean_lot_count_target + park_lot_count_target + affordable_lot_count_target
total_lot_area = ocean_total_area + park_total_area + affordable_total_area

print(f"\nPRODUCT MIX:")
print(f"  Ocean View: {ocean_lot_count_target} lots × {ocean_lot_size_avg}m² = {ocean_total_area:.1f} ha")
print(f"  Park View:  {park_lot_count_target} lots × {park_lot_size_avg}m² = {park_total_area:.1f} ha")
print(f"  Affordable: {affordable_lot_count_target} lots × {affordable_lot_size_avg}m² = {affordable_total_area:.1f} ha")
print(f"  TOTAL: {total_lots} lots = {total_lot_area:.1f} ha")

# Infrastructure allocation
roads_pct = 0.12  # 12% for roads
amenity_pct = 0.08  # 8% for amenities
corridor_pct = 0.35  # 35% biological corridor
lots_pct = 1 - roads_pct - amenity_pct - corridor_pct  # 45% for lots

developable_ha = total_area_ha * (1 - corridor_pct)
roads_ha = total_area_ha * roads_pct
amenity_ha = total_area_ha * amenity_pct

print(f"\nLAND USE:")
print(f"  Biological Corridor: {total_area_ha * corridor_pct:.1f} ha ({corridor_pct*100:.0f}%)")
print(f"  Lot Area: {total_lot_area:.1f} ha ({total_lot_area/total_area_ha*100:.0f}%)")
print(f"  Roads: {roads_ha:.1f} ha ({roads_pct*100:.0f}%)")
print(f"  Amenities: {amenity_ha:.1f} ha ({amenity_pct*100:.0f}%)")

# =============================================================================
# ROAD NETWORK DESIGN
# =============================================================================

print(f"\n" + "=" * 60)
print("ROAD NETWORK")
print("=" * 60)

"""
Road design principles:
1. ONE main spine road (minimizes infrastructure cost)
2. Loop roads for ocean view lots (maximize frontage, no dead ends)
3. Cul-de-sacs for affordable clusters (efficient, safe)
4. Connect to Mar Azul infrastructure
5. Follow contours to minimize earthwork
"""

# Main spine road: West entry → through amenity zone → connects all phases
spine_road = [
    (-85.644, 9.996),  # Entry from Mar Azul
    (-85.640, 9.996),
    (-85.636, 9.996),  # Amenity zone center
    (-85.630, 9.996),
    (-85.624, 9.996),  # Phase 2 center
    (-85.618, 9.996),
    (-85.612, 9.996),  # Phase 3 center
]

# Phase 1 ocean view loop (follows ridge at ~300m elevation)
p1_ridge_road = [
    (-85.640, 9.998),
    (-85.638, 10.001),
    (-85.636, 10.003),
    (-85.634, 10.005),
    (-85.636, 10.006),
    (-85.639, 10.005),
    (-85.641, 10.003),
    (-85.642, 10.000),
    (-85.640, 9.998),  # Complete loop
]

# Phase 2 ridge road (premium ocean views)
p2_ridge_road = [
    (-85.632, 9.999),
    (-85.629, 10.002),
    (-85.626, 10.004),
    (-85.623, 10.003),
    (-85.621, 10.001),
    (-85.619, 9.999),
]

# Phase 3 ridge road
p3_ridge_road = [
    (-85.618, 10.000),
    (-85.616, 10.002),
    (-85.614, 10.004),
    (-85.612, 10.005),
    (-85.611, 10.003),
    (-85.612, 10.001),
    (-85.615, 10.000),
]

# Connectors (spine to ridge)
connectors = [
    [(-85.636, 9.996), (-85.636, 9.998), (-85.636, 10.001)],  # P1 connector
    [(-85.626, 9.996), (-85.626, 9.999), (-85.626, 10.002)],  # P2 connector
    [(-85.615, 9.996), (-85.615, 9.998), (-85.615, 10.000)],  # P3 connector
]

# Affordable cluster cul-de-sacs (off spine, south side near amenities)
cul_de_sacs = [
    [(-85.638, 9.996), (-85.638, 9.994), (-85.640, 9.993), (-85.636, 9.993)],  # P1 affordable
    [(-85.628, 9.996), (-85.628, 9.994)],  # P2 affordable
]

print("Road hierarchy:")
print("  1. Main Spine: 8m wide, paved")
print("  2. Ridge Loops: 6m wide, paved")
print("  3. Connectors: 6m wide, paved")
print("  4. Cul-de-sacs: 5m wide, paved")

# =============================================================================
# AMENITY PLACEMENT
# =============================================================================

print(f"\n" + "=" * 60)
print("AMENITY STRATEGY")
print("=" * 60)

"""
Amenity placement principles:
1. Central location (accessible to all phases)
2. Flat terrain (minimize construction cost)
3. View amenity for non-view lots (compensates price)
4. Clustered (shared parking, efficient)
"""

# Main amenity hub (Phase 1/2 boundary, flat zone)
amenity_center = (-85.634, 9.995)

amenities = {
    'clubhouse': {
        'pos': (-85.635, 9.9965),
        'size': (60, 35),  # meters
        'desc': 'Main clubhouse with restaurant, bar, event space'
    },
    'pool': {
        'pos': (-85.635, 9.9945),
        'size': (30, 15),
        'desc': '25m lap pool + kids pool'
    },
    'pickleball': {
        'pos': (-85.638, 9.995),
        'size': (40, 40),
        'desc': '4 pickleball courts'
    },
    'playground': {
        'pos': (-85.632, 9.995),
        'size': (25, 25),
        'desc': 'Kids playground + picnic area'
    },
    'tennis': {
        'pos': (-85.626, 9.994),
        'size': (35, 18),
        'desc': '2 tennis courts (Phase 2)'
    },
    'field': {
        'pos': (-85.615, 9.995),
        'size': (50, 30),
        'desc': 'Multi-use field (Phase 3)'
    },
    'trailhead': {
        'pos': (-85.636, 9.992),
        'size': (20, 20),
        'desc': 'Trail access to biological corridor'
    }
}

print("\nAmenities:")
for name, data in amenities.items():
    print(f"  {name.title()}: {data['desc']}")

# =============================================================================
# LOT LAYOUT
# =============================================================================

print(f"\n" + "=" * 60)
print("LOT LAYOUT")
print("=" * 60)

lots = []
lot_id = 1

# PHASE 1 LOTS
print("\nPHASE 1 (32.2 ha):")

# Ocean view lots (ridge) - 2000-3000 m²
p1_ocean_positions = [
    # West ridge (best sunset views)
    (-85.642, 10.004), (-85.641, 10.003), (-85.640, 10.002), (-85.639, 10.001),
    (-85.642, 10.005), (-85.641, 10.004), (-85.640, 10.003),
    # North ridge
    (-85.638, 10.005), (-85.637, 10.006), (-85.636, 10.005), (-85.635, 10.004),
    (-85.638, 10.004), (-85.637, 10.003), (-85.636, 10.004),
    # Inner ridge
    (-85.639, 10.003), (-85.638, 10.002), (-85.637, 10.001),
]
for pos in p1_ocean_positions:
    lots.append({
        'id': lot_id, 'phase': 1, 'type': 'ocean',
        'pos': pos, 'size': 2200 + (lot_id % 5) * 200,  # 2200-3000 m²
    })
    lot_id += 1
print(f"  Ocean view: {len(p1_ocean_positions)} lots")

# Park lots (around amenity zone) - 1000-1500 m²
p1_park_positions = [
    # North of amenities
    (-85.640, 9.998), (-85.638, 9.998), (-85.636, 9.9985), (-85.634, 9.998),
    # East of amenities
    (-85.632, 9.997), (-85.632, 9.995), (-85.632, 9.993),
    # West of amenities  
    (-85.640, 9.997), (-85.640, 9.995), (-85.640, 9.993),
]
for pos in p1_park_positions:
    lots.append({
        'id': lot_id, 'phase': 1, 'type': 'park',
        'pos': pos, 'size': 1000 + (lot_id % 4) * 150,  # 1000-1450 m²
    })
    lot_id += 1
print(f"  Park view: {len(p1_park_positions)} lots")

# Affordable lots (cluster near entrance) - 600-800 m²
p1_affordable_positions = [
    (-85.641, 9.994), (-85.639, 9.994), (-85.637, 9.994), (-85.635, 9.994),
    (-85.640, 9.9925), (-85.638, 9.9925), (-85.636, 9.9925),
]
for pos in p1_affordable_positions:
    lots.append({
        'id': lot_id, 'phase': 1, 'type': 'affordable',
        'pos': pos, 'size': 600 + (lot_id % 3) * 100,  # 600-800 m²
    })
    lot_id += 1
print(f"  Affordable: {len(p1_affordable_positions)} lots")

# PHASE 2 LOTS
print("\nPHASE 2 (33.9 ha):")

# Ocean view lots (central ridge - most premium)
p2_ocean_positions = [
    # Ridge top (panoramic views)
    (-85.631, 10.004), (-85.630, 10.0045), (-85.629, 10.005),
    (-85.628, 10.0045), (-85.627, 10.004), (-85.626, 10.0045),
    (-85.625, 10.004), (-85.624, 10.0035), (-85.623, 10.003),
    # Inner ridge
    (-85.630, 10.003), (-85.628, 10.003), (-85.626, 10.003),
    (-85.624, 10.002), (-85.622, 10.0015),
    (-85.629, 10.002), (-85.627, 10.002), (-85.625, 10.001),
]
for pos in p2_ocean_positions:
    lots.append({
        'id': lot_id, 'phase': 2, 'type': 'ocean',
        'pos': pos, 'size': 2500 + (lot_id % 4) * 200,  # 2500-3100 m² (larger)
    })
    lot_id += 1
print(f"  Ocean view: {len(p2_ocean_positions)} lots")

# Park lots
p2_park_positions = [
    (-85.631, 9.999), (-85.629, 9.999), (-85.627, 9.999), (-85.625, 9.999), (-85.623, 9.999),
    (-85.630, 9.996), (-85.628, 9.996), (-85.626, 9.996), (-85.624, 9.996), (-85.622, 9.996),
]
for pos in p2_park_positions:
    lots.append({
        'id': lot_id, 'phase': 2, 'type': 'park',
        'pos': pos, 'size': 1100 + (lot_id % 4) * 100,
    })
    lot_id += 1
print(f"  Park view: {len(p2_park_positions)} lots")

# Affordable
p2_affordable_positions = [
    (-85.630, 9.993), (-85.628, 9.993), (-85.626, 9.993), (-85.624, 9.993),
]
for pos in p2_affordable_positions:
    lots.append({
        'id': lot_id, 'phase': 2, 'type': 'affordable',
        'pos': pos, 'size': 650 + (lot_id % 3) * 50,
    })
    lot_id += 1
print(f"  Affordable: {len(p2_affordable_positions)} lots")

# PHASE 3 LOTS
print("\nPHASE 3 (~25 ha):")

# Ocean view
p3_ocean_positions = [
    (-85.617, 10.005), (-85.616, 10.004), (-85.615, 10.005),
    (-85.614, 10.006), (-85.613, 10.005), (-85.612, 10.004),
    (-85.615, 10.003), (-85.614, 10.002), (-85.613, 10.003),
    (-85.617, 10.003), (-85.616, 10.002), (-85.612, 10.002),
]
for pos in p3_ocean_positions:
    lots.append({
        'id': lot_id, 'phase': 3, 'type': 'ocean',
        'pos': pos, 'size': 2000 + (lot_id % 5) * 200,
    })
    lot_id += 1
print(f"  Ocean view: {len(p3_ocean_positions)} lots")

# Park
p3_park_positions = [
    (-85.619, 9.999), (-85.617, 9.999), (-85.615, 9.999), (-85.613, 9.999), (-85.611, 9.999),
    (-85.618, 9.996), (-85.616, 9.996), (-85.614, 9.996), (-85.612, 9.996),
]
for pos in p3_park_positions:
    lots.append({
        'id': lot_id, 'phase': 3, 'type': 'park',
        'pos': pos, 'size': 1000 + (lot_id % 3) * 150,
    })
    lot_id += 1
print(f"  Park view: {len(p3_park_positions)} lots")

# Affordable
p3_affordable_positions = [
    (-85.617, 9.993), (-85.615, 9.993), (-85.613, 9.993), (-85.611, 9.993),
]
for pos in p3_affordable_positions:
    lots.append({
        'id': lot_id, 'phase': 3, 'type': 'affordable',
        'pos': pos, 'size': 600 + (lot_id % 3) * 75,
    })
    lot_id += 1
print(f"  Affordable: {len(p3_affordable_positions)} lots")

# Summary
ocean_lots = [l for l in lots if l['type'] == 'ocean']
park_lots = [l for l in lots if l['type'] == 'park']
affordable_lots = [l for l in lots if l['type'] == 'affordable']

print(f"\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print(f"\nTOTAL LOTS: {len(lots)}")
print(f"  Ocean View: {len(ocean_lots)} lots (avg {sum(l['size'] for l in ocean_lots)//len(ocean_lots)}m²)")
print(f"  Park View: {len(park_lots)} lots (avg {sum(l['size'] for l in park_lots)//len(park_lots)}m²)")
print(f"  Affordable: {len(affordable_lots)} lots (avg {sum(l['size'] for l in affordable_lots)//len(affordable_lots)}m²)")

# Price estimates
ocean_value = sum(l['size'] * 200 for l in ocean_lots)  # $200/m² avg
park_value = sum(l['size'] * 125 for l in park_lots)    # $125/m² avg
affordable_value = sum(l['size'] * 100 for l in affordable_lots)  # $100/m² avg
total_value = ocean_value + park_value + affordable_value

print(f"\nPROJECT VALUE ESTIMATE:")
print(f"  Ocean View: ${ocean_value/1000000:.1f}M")
print(f"  Park View: ${park_value/1000000:.1f}M")
print(f"  Affordable: ${affordable_value/1000000:.1f}M")
print(f"  TOTAL: ${total_value/1000000:.1f}M")

# =============================================================================
# GENERATE MAP
# =============================================================================

print(f"\n" + "=" * 60)
print("GENERATING MASTERPLAN MAP...")
print("=" * 60)

# High-res output
width = 4000
height = int(width * (max_lat - min_lat) / (max_lon - min_lon) * 1.1)
img = Image.new('RGB', (width, height), '#FAFAFA')
draw = ImageDraw.Draw(img)

def px(lon, lat):
    x = int((lon - min_lon) / (max_lon - min_lon) * width * 0.92) + 40
    y = int((max_lat - lat) / (max_lat - min_lat) * height * 0.85) + 100
    return (x, y)

# Draw terrain zones
print("  Drawing terrain zones...")
for t in terrain:
    x, y = px(t['lon'], t['lat'])
    e = t['elevation']
    if e < corridor_threshold:
        color = '#81C784'  # Corridor - green
    elif e < amenity_threshold:
        color = '#C8E6C9'  # Amenity zone - light green
    elif e < transition_threshold:
        color = '#FFF8E1'  # Park lots - cream
    else:
        color = '#FFE0B2'  # Ocean view - warm
    draw.ellipse([x-50, y-50, x+50, y+50], fill=color)

# Smooth with blur
from PIL import ImageFilter
img = img.filter(ImageFilter.GaussianBlur(radius=20))
draw = ImageDraw.Draw(img)

# Property outline
outline = [
    (-85.643, min_lat), (-85.643, max_lat), 
    (-85.610, max_lat), (-85.610, min_lat), 
    (-85.643, min_lat)
]
draw.line([px(p[0], p[1]) for p in outline], fill='#37474F', width=5)

# Biological corridor fill
corridor_poly = [
    (-85.643, 9.992), (-85.610, 9.993),
    (-85.610, 9.987), (-85.643, 9.987)
]
draw.polygon([px(p[0], p[1]) for p in corridor_poly], fill='#66BB6A', outline='#2E7D32')

# Quebrada lines
for q in [
    [(-85.643, 9.989), (-85.630, 9.990), (-85.620, 9.991), (-85.610, 9.992)],
    [(-85.640, 9.988), (-85.625, 9.9885)],
]:
    pts = [px(p[0], p[1]) for p in q]
    draw.line(pts, fill='#1976D2', width=6)
    draw.line(pts, fill='#42A5F5', width=3)

# Draw roads
print("  Drawing roads...")

def draw_road(points, main=True):
    pts = [px(p[0], p[1]) for p in points]
    w1, w2 = (16, 11) if main else (12, 8)
    draw.line(pts, fill='#5D4037', width=w1)
    draw.line(pts, fill='#E8E8E8', width=w2)

# Main spine
draw_road(spine_road, True)

# Ridge roads
draw_road(p1_ridge_road, False)
draw_road(p2_ridge_road, False)
draw_road(p3_ridge_road, False)

# Connectors
for conn in connectors:
    draw_road(conn, False)

# Draw amenity zone
print("  Drawing amenities...")
amenity_zone = [(-85.641, 9.998), (-85.631, 9.998), (-85.631, 9.992), (-85.641, 9.992)]
draw.polygon([px(p[0], p[1]) for p in amenity_zone], fill='#FFF9C4', outline='#FBC02D', width=3)

# Individual amenities
amenity_colors = {
    'clubhouse': ('#795548', '#4E342E'),
    'pool': ('#29B6F6', '#0277BD'),
    'pickleball': ('#26A69A', '#00695C'),
    'playground': ('#FF8A65', '#E64A19'),
    'tennis': ('#66BB6A', '#2E7D32'),
    'field': ('#AED581', '#689F38'),
    'trailhead': ('#8D6E63', '#5D4037'),
}

for name, data in amenities.items():
    x, y = px(data['pos'][0], data['pos'][1])
    w, h = data['size'][0] // 2, data['size'][1] // 2
    fill, outline = amenity_colors.get(name, ('#888', '#666'))
    if name == 'pool':
        draw.ellipse([x-w, y-h, x+w, y+h], fill=fill, outline=outline, width=3)
    else:
        draw.rectangle([x-w, y-h, x+w, y+h], fill=fill, outline=outline, width=2)

# Draw lots
print("  Drawing lots...")

lot_colors = {
    ('ocean', 1): ('#FFB74D', '#E65100'),
    ('ocean', 2): ('#64B5F6', '#1565C0'),
    ('ocean', 3): ('#FF8A65', '#D84315'),
    ('park', 1): ('#A5D6A7', '#388E3C'),
    ('park', 2): ('#90CAF9', '#1976D2'),
    ('park', 3): ('#FFAB91', '#BF360C'),
    ('affordable', 1): ('#C8E6C9', '#66BB6A'),
    ('affordable', 2): ('#B3E5FC', '#4FC3F7'),
    ('affordable', 3): ('#FFCCBC', '#FF8A65'),
}

for lot in lots:
    x, y = px(lot['pos'][0], lot['pos'][1])
    
    # Size based on lot type
    if lot['type'] == 'ocean':
        w, h = 32, 26
    elif lot['type'] == 'park':
        w, h = 26, 21
    else:
        w, h = 20, 16
    
    fill, outline = lot_colors.get((lot['type'], lot['phase']), ('#DDD', '#999'))
    draw.rectangle([x-w, y-h, x+w, y+h], fill=fill, outline=outline, width=2)
    
    # Lot number
    draw.text((x-12, y-9), str(lot['id']), fill='#333')

# Trails
print("  Drawing trails...")
trails = [
    [(-85.636, 9.992), (-85.630, 9.991), (-85.625, 9.9905), (-85.618, 9.992)],
]
for trail in trails:
    pts = [px(p[0], p[1]) for p in trail]
    draw.line(pts, fill='#8D6E63', width=5)
    draw.line(pts, fill='#BCAAA4', width=2)

# Labels
print("  Adding labels...")
try:
    ft = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 80)
    fm = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 52)
    fs = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 36)
    fss = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 26)
    fsss = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 20)
except:
    ft = fm = fs = fss = fsss = ImageFont.load_default()

# Title
draw.rectangle([40, 40, 1100, 200], fill='#1A1F16')
draw.text((60, 50), 'LOS COYOLES', fill='white', font=ft)
draw.text((60, 135), 'Ecological Condominium Masterplan', fill='#C4A67C', font=fs)

# Phase labels
for lon, lat, name, color, ha in [
    (-85.637, 10.008, 'ETAPA 1', '#4CAF50', '32.2 ha'),
    (-85.625, 10.0075, 'ETAPA 2', '#2196F3', '33.9 ha'),
    (-85.613, 10.008, 'ETAPA 3', '#FF9800', '~25 ha'),
]:
    x, y = px(lon, lat)
    draw.text((x-65, y), name, fill=color, font=fm)
    draw.text((x-40, y+55), ha, fill='#666', font=fss)

# Zone labels
for lon, lat, text, color in [
    (-85.636, 9.995, 'AMENITIES', '#F57F17'),
    (-85.625, 9.989, 'BIOLOGICAL CORRIDOR', '#1B5E20'),
    (-85.639, 10.003, 'OCEAN VIEWS', '#E65100'),
]:
    x, y = px(lon, lat)
    draw.text((x-80, y), text, fill=color, font=fss)

# Ocean direction
draw.text((40, height//2-50), '← PACIFIC OCEAN', fill='#1565C0', font=fm)

# Legend
lx, ly = width - 480, 60
draw.rectangle([lx-25, ly-25, width-50, ly+600], fill='white', outline='#999', width=2)
draw.text((lx, ly), 'LEGEND', fill='#333', font=fs)

ly += 60
legend_items = [
    ('#FFB74D', '#E65100', 'Ocean View Lots (2000-3000m²)'),
    ('#A5D6A7', '#388E3C', 'Park View Lots (1000-1500m²)'),
    ('#C8E6C9', '#66BB6A', 'Affordable Lots (600-800m²)'),
    ('#FFF9C4', '#FBC02D', 'Recreation/Amenities'),
    ('#66BB6A', '#2E7D32', 'Biological Corridor'),
    ('#29B6F6', '#0277BD', 'Pool'),
    ('#26A69A', '#00695C', 'Pickleball Courts'),
    ('#795548', '#4E342E', 'Clubhouse'),
    ('#66BB6A', '#2E7D32', 'Tennis Courts'),
    ('#FF8A65', '#E64A19', 'Playground'),
    ('#AED581', '#689F38', 'Multi-use Field'),
]

for fill, outline, label in legend_items:
    draw.rectangle([lx, ly, lx+40, ly+26], fill=fill, outline=outline, width=2)
    draw.text((lx+55, ly+3), label, fill='#333', font=fsss)
    ly += 36

ly += 15
draw.line([lx, ly+10, lx+40, ly+10], fill='#5D4037', width=12)
draw.line([lx+5, ly+10, lx+35, ly+10], fill='#E8E8E8', width=7)
draw.text((lx+55, ly+3), 'Roads (Spine & Loop)', fill='#333', font=fsss)

ly += 36
draw.line([lx, ly+10, lx+40, ly+10], fill='#BCAAA4', width=5)
draw.text((lx+55, ly+3), 'Hiking Trails', fill='#333', font=fsss)

ly += 36
draw.line([lx, ly+10, lx+40, ly+10], fill='#42A5F5', width=5)
draw.text((lx+55, ly+3), 'Quebradas (Streams)', fill='#333', font=fsss)

# Stats box
sy = height - 200
draw.rectangle([40, sy, 1100, height-50], fill='#1A1F16')
draw.text((60, sy+20), 'PROJECT SUMMARY', fill='#C4A67C', font=fs)
draw.text((60, sy+70), f'Total: {len(lots)} lots', fill='white', font=fss)
draw.text((260, sy+70), f'Ocean View: {len(ocean_lots)}', fill='#FFB74D', font=fss)
draw.text((500, sy+70), f'Park: {len(park_lots)}', fill='#A5D6A7', font=fss)
draw.text((680, sy+70), f'Affordable: {len(affordable_lots)}', fill='#C8E6C9', font=fss)
draw.text((60, sy+110), f'Estimated Value: ${total_value/1000000:.1f}M', fill='#64B5F6', font=fss)
draw.text((400, sy+110), f'Amenities: Clubhouse, Pool, Pickleball, Tennis, Playground, Field', fill='#888', font=fsss)
draw.text((60, sy+145), f'Conservation: ~23 ha biological corridor with trail system', fill='#81C784', font=fsss)

# North arrow
ax, ay = width - 120, height - 180
draw.text((ax+8, ay-50), 'N', fill='#333', font=fs)
draw.polygon([(ax+20, ay-35), (ax, ay), (ax+40, ay)], fill='#333')

# Scale bar
scale_m = 300
scale_px = int(scale_m / ((max_lon - min_lon) * 111000 * 0.985) * width * 0.92)
bx, by = 60, height - 250
draw.rectangle([bx, by, bx+scale_px, by+12], fill='#333')
draw.rectangle([bx+scale_px, by, bx+scale_px*2, by+12], fill='white', outline='#333')
draw.text((bx, by+18), '0', fill='#333', font=fsss)
draw.text((bx+scale_px-20, by+18), f'{scale_m}m', fill='#333', font=fsss)
draw.text((bx+scale_px*2-30, by+18), f'{scale_m*2}m', fill='#333', font=fsss)

# Save
img.save('los-coyoles-masterplan-v2.png', quality=95)
print(f"\n✅ Masterplan saved: los-coyoles-masterplan-v2.png")
print(f"   Resolution: {width}x{height}px")
