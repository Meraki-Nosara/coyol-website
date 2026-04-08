import json
import os
from PIL import Image, ImageDraw, ImageFont

os.chdir('/Users/Coyol/.openclaw/workspace/los-coyoles')
with open('terrain-detailed.json') as f: terrain = json.load(f)

min_lon, max_lon = -85.644, -85.609
min_lat, max_lat = 9.985, 10.008
width, height = 3200, int(3200 * (max_lat - min_lat) / (max_lon - min_lon))
img = Image.new('RGB', (width, height), '#FAFAFA')
draw = ImageDraw.Draw(img)

def px(lon, lat): return (int((lon-min_lon)/(max_lon-min_lon)*width), int((max_lat-lat)/(max_lat-min_lat)*height))

# Terrain
for x in range(0, width, 20):
    for y in range(0, height, 20):
        lon = min_lon + (x/width)*(max_lon-min_lon)
        lat = max_lat - (y/height)*(max_lat-min_lat)
        c = '#A5D6A7' if lat<9.992 else '#E8F5E9' if lat<9.998 else '#FFF8E1' if lon<-85.625 else '#FFE0B2'
        draw.rectangle([x,y,x+20,y+20], fill=c)

# Outline only
draw.rectangle([px(-85.643,10.007)[0],px(-85.643,10.007)[1],px(-85.610,9.987)[0],px(-85.610,9.987)[1]], outline='#37474F', width=4)

# Corridor
draw.polygon([px(-85.643,9.992),px(-85.610,9.993),px(-85.610,9.987),px(-85.643,9.987)], fill='#81C784', outline='#2E7D32')

# Recreation
for r in [[(-85.641,9.9975),(-85.633,9.9975),(-85.633,9.9925),(-85.641,9.9925)],
          [(-85.629,9.996),(-85.623,9.996),(-85.623,9.993),(-85.629,9.993)]]:
    draw.polygon([px(p[0],p[1]) for p in r], fill='#FFF9C4', outline='#F9A825', width=2)

# Amenities
cx,cy = px(-85.639,9.995); draw.rectangle([cx-50,cy-35,cx+50,cy+35], fill='#26A69A', outline='#00695C', width=2)
cx,cy = px(-85.637,9.9935); draw.ellipse([cx-55,cy-28,cx+55,cy+28], fill='#29B6F6', outline='#0277BD', width=2)
cx,cy = px(-85.637,9.9965); draw.rectangle([cx-45,cy-28,cx+45,cy+28], fill='#795548', outline='#4E342E', width=2)
cx,cy = px(-85.634,9.995); draw.ellipse([cx-35,cy-35,cx+35,cy+35], fill='#FF8A65', outline='#D84315', width=2)
cx,cy = px(-85.626,9.9945); draw.rectangle([cx-30,cy-45,cx+30,cy+45], fill='#66BB6A', outline='#2E7D32', width=2)

# Roads
def road(pts):
    p = [px(x[0],x[1]) for x in pts]
    draw.line(p, fill='#5D4037', width=12)
    draw.line(p, fill='#E0E0E0', width=8)

road([(-85.644,9.996),(-85.637,9.9965)])
road([(-85.637,9.9965),(-85.635,10.001),(-85.637,10.005),(-85.641,10.003),(-85.637,9.9965)])
road([(-85.637,9.9965),(-85.637,9.993)])
road([(-85.635,10.002),(-85.626,10.002)])
road([(-85.632,9.999),(-85.626,10.002),(-85.620,10.001)])
road([(-85.626,10.002),(-85.626,9.993)])
road([(-85.620,10.001),(-85.614,10.004),(-85.612,10.001),(-85.620,10.001)])

# Lots
lots = []
n = 1
for p in [(-85.641,10.004),(-85.640,10.003),(-85.639,10.002),(-85.641,10.005),(-85.639,10.004),(-85.637,10.005),(-85.636,10.004),(-85.635,10.003)]: lots.append((n,p[0],p[1],1,'o')); n+=1
for p in [(-85.641,9.998),(-85.641,9.996),(-85.633,9.998),(-85.633,9.996),(-85.639,9.993),(-85.635,9.993)]: lots.append((n,p[0],p[1],1,'p')); n+=1
for p in [(-85.630,10.003),(-85.628,10.003),(-85.626,10.003),(-85.624,10.002),(-85.622,10.001),(-85.629,10.002),(-85.627,10.002),(-85.625,10.001)]: lots.append((n,p[0],p[1],2,'o')); n+=1
for p in [(-85.630,9.998),(-85.626,9.998),(-85.622,9.998),(-85.628,9.995),(-85.624,9.995)]: lots.append((n,p[0],p[1],2,'p')); n+=1
for p in [(-85.617,10.004),(-85.615,10.005),(-85.613,10.004),(-85.612,10.003),(-85.616,10.002),(-85.614,10.002)]: lots.append((n,p[0],p[1],3,'o')); n+=1
for p in [(-85.618,9.999),(-85.615,9.999),(-85.612,9.999),(-85.616,9.996),(-85.613,9.996)]: lots.append((n,p[0],p[1],3,'p')); n+=1

colors = {(1,'o'):('#FFB74D','#E65100'),(1,'p'):('#A5D6A7','#388E3C'),(2,'o'):('#64B5F6','#1565C0'),(2,'p'):('#90CAF9','#1976D2'),(3,'o'):('#FF8A65','#D84315'),(3,'p'):('#FFAB91','#E64A19')}
for num,lon,lat,ph,tp in lots:
    x,y = px(lon,lat)
    w,h = (28,22) if tp=='o' else (22,18)
    f,o = colors[(ph,tp)]
    draw.rectangle([x-w,y-h,x+w,y+h], fill=f, outline=o, width=2)
    draw.text((x-10,y-8), str(num), fill='#333')

# Labels
try:
    ft = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 64)
    fm = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 44)
    fs = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 28)
except: ft = fm = fs = ImageFont.load_default()

draw.rectangle([40,40,950,170], fill='#1A1F16')
draw.text((60,50), 'LOS COYOLES', fill='white', font=ft)
draw.text((60,115), 'Ecological Condominium', fill='#C4A67C', font=fs)

for lon,lat,name,c in [(-85.638,10.007,'ETAPA 1','#4CAF50'),(-85.626,10.006,'ETAPA 2','#2196F3'),(-85.614,10.006,'ETAPA 3','#FF9800')]:
    x,y = px(lon,lat); draw.text((x-55,y), name, fill=c, font=fm)

draw.text((50,height//2-30), '← OCEAN', fill='#1565C0', font=fm)

oc = len([l for l in lots if l[4]=='o'])
pk = len([l for l in lots if l[4]=='p'])
draw.rectangle([40,height-120,650,height-40], fill='#1A1F16')
draw.text((60,height-105), f'Total: {len(lots)} lots | Ocean: {oc} | Park: {pk}', fill='white', font=fs)

img.save('los-coyoles-clean-masterplan.png', quality=95)
print(f'Done: {len(lots)} lots')
