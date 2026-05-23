# Moodboard Creator Skill

Create professional interior design moodboards with a flat-lay aesthetic — items appear to be scattered on a table with natural shadows, slight rotations, and organic arrangement.

## When to Use
- Creating interior design presentations
- Material/finish selections for rooms
- Client-facing design boards
- Any visual collection needing a "styled flat-lay" look

## Required Inputs
1. **Project/Room name** — e.g., "Master Bathroom"
2. **Product images** — 6-12 images of fixtures, materials, finishes
   - IMPORTANT: Use product shots on white/transparent backgrounds when possible
   - Crop out busy backgrounds from room photos
3. **Color palette** — 4-6 colors with names (e.g., "Teal Zellige", "Aged Brass")
4. **Style tags** — 3-5 descriptive tags (e.g., "Modern", "Organic", "Spa-like")

## Process

### Step 1: Prepare Images
For each product image:
- If it has a busy background, note it needs cropping or accept as-is
- Identify what it represents (fixture, tile, material, etc.)

### Step 2: Generate the Moodboard HTML
Use the template at `templates/moodboard.html` as a base.

Customize:
- `TITLE` — Room/project name
- `IMAGES` — Array of image paths with labels
- `COLORS` — Array of {hex, name} objects  
- `TAGS` — Array of style tags

### Step 3: Screenshot to PNG
```bash
npx playwright screenshot templates/moodboard.html moodboard.png --viewport-size=1200,1600
```

Or open in browser and screenshot manually.

## Key Design Principles

### What Makes It Look Professional
1. **Soft drop shadows** — 20-40px blur, low opacity
2. **Slight rotations** — -3° to +3° randomly
3. **Varied sizes** — hero items larger, accents smaller
4. **Overlap** — items slightly touching/layered
5. **Breathing room** — cream background visible between items
6. **Textured swatches** — not flat solid colors

### What to Avoid
- Perfect grid alignment
- Same-size boxes
- No shadows (looks like PowerPoint)
- Flat color circles
- Busy backgrounds on product images

## Example Output Structure

```
moodboard-project/
├── images/
│   ├── 01-shower-fixture.jpg
│   ├── 02-tub-filler.jpg
│   ├── 03-vanity-faucet.jpg
│   └── ...
├── moodboard.html
└── moodboard.png
```

## Template Variables

In the HTML template, replace:
- `{{TITLE}}` — Project name
- `{{SUBTITLE}}` — Optional tagline
- `{{TAGS}}` — Style descriptors
- Image slots 1-10 with actual images
- Color swatches with hex values and names
