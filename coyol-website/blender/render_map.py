"""
Mar Azul 3D Map Render Script
Uses BlenderGIS to import terrain from Google Maps and render an illustrated-style map
"""

import bpy
import os
import math

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Mar Azul coordinates
LAT = 10.004
LON = -85.632
ZOOM = 16  # Good detail level for a development

print("=" * 50)
print("MAR AZUL 3D MAP GENERATOR")
print("=" * 50)
print(f"Target: {LAT}, {LON}")
print(f"Zoom level: {ZOOM}")

# Check if BlenderGIS is available
addon_name = "BlenderGIS"
try:
    # Enable BlenderGIS addon
    bpy.ops.preferences.addon_enable(module="BlenderGIS")
    print("✓ BlenderGIS addon enabled")
except:
    print("⚠ BlenderGIS may already be enabled or needs manual setup")

# Set up the scene for nice rendering
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.cycles.samples = 128
scene.render.resolution_x = 4000
scene.render.resolution_y = 2667
scene.render.resolution_percentage = 100
scene.render.film_transparent = False

# Set background color (sky blue gradient)
world = bpy.data.worlds.get("World")
if world is None:
    world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs[0].default_value = (0.6, 0.75, 0.9, 1.0)  # Light blue sky
    bg.inputs[1].default_value = 1.0

print("\n--- Scene Setup Complete ---")
print(f"Render resolution: {scene.render.resolution_x}x{scene.render.resolution_y}")
print(f"Engine: {scene.render.engine}")

# Create a simple terrain placeholder (BlenderGIS will replace this)
# For now, create a plane with subdivisions to show the concept
bpy.ops.mesh.primitive_plane_add(size=1000, location=(0, 0, 0))
terrain = bpy.context.active_object
terrain.name = "MarAzul_Terrain"

# Add subdivision for terrain detail
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.subdivide(number_cuts=50)
bpy.ops.object.mode_set(mode='OBJECT')

# Add some noise to simulate hills
import random
mesh = terrain.data
for vertex in mesh.vertices:
    # Create rolling hills effect
    x, y, z = vertex.co
    height = math.sin(x * 0.02) * 20 + math.cos(y * 0.015) * 15
    height += random.uniform(-2, 2)  # Slight randomness
    vertex.co.z = height

# Create terrain material (lush green)
mat = bpy.data.materials.new(name="Terrain_Material")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links

# Clear default nodes
nodes.clear()

# Create shader nodes for illustrated look
output = nodes.new('ShaderNodeOutputMaterial')
principled = nodes.new('ShaderNodeBsdfPrincipled')
principled.inputs['Base Color'].default_value = (0.2, 0.45, 0.15, 1.0)  # Forest green
principled.inputs['Roughness'].default_value = 0.9
links.new(principled.outputs['BSDF'], output.inputs['Surface'])

terrain.data.materials.append(mat)

print("✓ Terrain placeholder created")

# Add sun light
bpy.ops.object.light_add(type='SUN', location=(100, -50, 200))
sun = bpy.context.active_object
sun.name = "Sun"
sun.data.energy = 3.0
sun.data.angle = 0.1  # Soft shadows
sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(30))

print("✓ Lighting setup complete")

# Set up camera for aerial view (like Zapotal map angle)
bpy.ops.object.camera_add(location=(0, -600, 400))
camera = bpy.context.active_object
camera.name = "MapCamera"
camera.rotation_euler = (math.radians(55), 0, 0)  # Tilted aerial view
scene.camera = camera

# Adjust camera to orthographic for map-like feel (optional)
# camera.data.type = 'ORTHO'
# camera.data.ortho_scale = 800

print("✓ Camera positioned for aerial map view")

# Save the blend file
output_dir = os.path.dirname(os.path.realpath(__file__))
blend_path = os.path.join(output_dir, "mar_azul_map.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(f"✓ Saved: {blend_path}")

print("\n" + "=" * 50)
print("NEXT STEPS:")
print("=" * 50)
print("""
1. Open Blender GUI: blender blender/mar_azul_map.blend

2. Use BlenderGIS to import real terrain:
   - Press N to open sidebar
   - Go to GIS tab
   - Click 'Basemaps' > Select Google Satellite
   - Press G to grab imagery at current location
   - Or use 'Get OSM' for OpenStreetMap data

3. To import from Google Maps:
   - GIS tab > 'Import' > 'Georeferenced raster'
   - Or use Web > Basemaps > Google

4. For stylized look:
   - Switch to EEVEE for faster preview
   - Add Freestyle lines for illustrated edges
   - Adjust materials for painterly feel

5. Render:
   - Press F12 to render
   - Save image to: coyol-website/public/images/mar-azul-3d-map.jpg
""")

print("\n✓ Script complete! Open the .blend file to continue.")
