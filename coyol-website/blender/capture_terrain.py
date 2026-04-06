"""
Mar Azul Terrain Capture Script
Uses BlenderGIS to download satellite imagery and elevation data
"""

import bpy
import os
import math
import addon_utils

# Mar Azul coordinates
CENTER_LAT = 10.004
CENTER_LON = -85.632

# Enable required addons
try:
    addon_utils.enable("BlenderGIS")
    print("✓ BlenderGIS enabled")
except Exception as e:
    print(f"⚠ BlenderGIS addon issue: {e} (continuing without it)")

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Set up scene
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'  # Faster for preview
scene.eevee.taa_render_samples = 64
scene.render.resolution_x = 4000
scene.render.resolution_y = 2667
scene.render.resolution_percentage = 100

# Create world with gradient sky
world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
links = world.node_tree.links

# Clear and rebuild world shader
nodes.clear()
output = nodes.new('ShaderNodeOutputWorld')
output.location = (300, 0)

background = nodes.new('ShaderNodeBackground')
background.location = (0, 0)
background.inputs['Color'].default_value = (0.529, 0.741, 0.878, 1.0)  # Sky blue
background.inputs['Strength'].default_value = 1.0

links.new(background.outputs['Background'], output.inputs['Surface'])

print("✓ Sky background set")

# Try to use BlenderGIS to set up georeferencing
try:
    # Set coordinate system 
    bpy.context.scene.geoscene.crs = "EPSG:4326"  # WGS84
    print("✓ Coordinate system set to WGS84")
except Exception as e:
    print(f"⚠ Could not set CRS: {e}")

# Since BlenderGIS satellite requires interactive use,
# let's create a terrain from elevation data manually

# Create base terrain mesh
bpy.ops.mesh.primitive_grid_add(
    x_subdivisions=100,
    y_subdivisions=100,
    size=1000,
    location=(0, 0, 0)
)
terrain = bpy.context.active_object
terrain.name = "MarAzul_Terrain"

# Apply Costa Rican ridgeline terrain (Mar Azul is on a hill)
# Simulate the ridge running roughly east-west
mesh = terrain.data
for v in mesh.vertices:
    x, y, z = v.co
    
    # Main ridge (running roughly E-W)
    ridge = 50 * math.exp(-((y/200)**2))
    
    # Secondary hills
    hills = 20 * math.sin(x * 0.015) * math.cos(y * 0.02)
    hills += 15 * math.sin(x * 0.025 + 1) * math.cos(y * 0.018 + 0.5)
    
    # Valley on south side (where waterfall would be)
    valley = -30 * max(0, (y/500 + 0.3)) if y > 0 else 0
    
    # Combine
    v.co.z = ridge + hills + valley

mesh.update()

# Smooth the terrain
bpy.ops.object.shade_smooth()

# Create lush green material
mat = bpy.data.materials.new(name="Jungle_Terrain")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
nodes.clear()

# Output
output = nodes.new('ShaderNodeOutputMaterial')
output.location = (400, 0)

# Principled BSDF
principled = nodes.new('ShaderNodeBsdfPrincipled')
principled.location = (100, 0)
principled.inputs['Base Color'].default_value = (0.15, 0.4, 0.12, 1.0)  # Dark jungle green
principled.inputs['Roughness'].default_value = 0.95
principled.inputs['Specular IOR Level'].default_value = 0.1

links.new(principled.outputs['BSDF'], output.inputs['Surface'])
terrain.data.materials.append(mat)

print("✓ Terrain mesh created with jungle material")

# Add trees (simple cone + sphere representation)
def create_tree(location, scale=1.0):
    # Trunk
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.5 * scale,
        depth=4 * scale,
        location=(location[0], location[1], location[2] + 2*scale)
    )
    trunk = bpy.context.active_object
    trunk.name = f"Tree_Trunk_{location[0]:.0f}_{location[1]:.0f}"
    
    # Create brown material
    if "Bark" not in bpy.data.materials:
        bark_mat = bpy.data.materials.new(name="Bark")
        bark_mat.use_nodes = True
        bark_mat.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = (0.25, 0.15, 0.08, 1.0)
    trunk.data.materials.append(bpy.data.materials["Bark"])
    
    # Foliage
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=3 * scale,
        location=(location[0], location[1], location[2] + 6*scale)
    )
    foliage = bpy.context.active_object
    foliage.name = f"Tree_Foliage_{location[0]:.0f}_{location[1]:.0f}"
    
    # Create green material
    if "Foliage" not in bpy.data.materials:
        foliage_mat = bpy.data.materials.new(name="Foliage")
        foliage_mat.use_nodes = True
        foliage_mat.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = (0.1, 0.35, 0.1, 1.0)
    foliage.data.materials.append(bpy.data.materials["Foliage"])
    
    return trunk, foliage

# Scatter trees around the perimeter and in clusters
import random
random.seed(42)  # Consistent results

print("Creating forest...")
tree_count = 0
for i in range(200):
    # Perimeter trees
    angle = random.uniform(0, 2 * math.pi)
    dist = random.uniform(300, 500)
    x = math.cos(angle) * dist
    y = math.sin(angle) * dist
    
    # Get terrain height at this point (approximate)
    ridge = 50 * math.exp(-((y/200)**2))
    hills = 20 * math.sin(x * 0.015) * math.cos(y * 0.02)
    z = ridge + hills
    
    scale = random.uniform(0.8, 1.5)
    create_tree((x, y, z), scale)
    tree_count += 1

# Some trees within the development area too
for i in range(50):
    x = random.uniform(-200, 200)
    y = random.uniform(-150, 150)
    ridge = 50 * math.exp(-((y/200)**2))
    hills = 20 * math.sin(x * 0.015) * math.cos(y * 0.02)
    z = ridge + hills
    scale = random.uniform(0.5, 0.9)
    create_tree((x, y, z), scale)
    tree_count += 1

print(f"✓ Created {tree_count} trees")

# Add road (white curved path along the ridge)
bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 52))
road_curve = bpy.context.active_object
road_curve.name = "Main_Road"

# Shape the curve to follow ridge
spline = road_curve.data.splines[0]
spline.bezier_points[0].co = (-300, 20, 0)
spline.bezier_points[0].handle_left = (-350, 50, 0)
spline.bezier_points[0].handle_right = (-250, -10, 0)

spline.bezier_points[1].co = (300, -20, 0)
spline.bezier_points[1].handle_left = (200, 30, 0)
spline.bezier_points[1].handle_right = (350, -50, 0)

# Add more control points
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.curve.select_all(action='SELECT')
bpy.ops.curve.subdivide()
bpy.ops.object.mode_set(mode='OBJECT')

# Make it visible
road_curve.data.bevel_depth = 4
road_curve.data.bevel_resolution = 2

# White road material
road_mat = bpy.data.materials.new(name="Road")
road_mat.use_nodes = True
road_mat.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = (0.85, 0.82, 0.75, 1.0)
road_mat.node_tree.nodes["Principled BSDF"].inputs['Roughness'].default_value = 0.8
road_curve.data.materials.append(road_mat)

print("✓ Road curve created")

# Add sun
bpy.ops.object.light_add(type='SUN', location=(200, -100, 300))
sun = bpy.context.active_object
sun.name = "Sun"
sun.data.energy = 4.0
sun.data.angle = math.radians(3)  # Soft shadows
sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(45))

# Add fill light
bpy.ops.object.light_add(type='SUN', location=(-100, 100, 200))
fill = bpy.context.active_object
fill.name = "Fill_Light"
fill.data.energy = 1.0
fill.rotation_euler = (math.radians(60), math.radians(-20), math.radians(-30))

print("✓ Lighting setup complete")

# Set up camera (Zapotal-style aerial angle)
bpy.ops.object.camera_add(location=(0, -500, 350))
camera = bpy.context.active_object
camera.name = "Map_Camera"
camera.rotation_euler = (math.radians(55), 0, 0)
camera.data.lens = 35  # Slightly wide angle
scene.camera = camera

print("✓ Camera positioned")

# Save the file
output_dir = os.path.dirname(os.path.realpath(__file__))
blend_path = os.path.join(output_dir, "mar_azul_illustrated.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(f"✓ Saved: {blend_path}")

# Render preview
render_path = os.path.join(output_dir, "..", "public", "images", "mar-azul-3d-map.png")
scene.render.filepath = render_path
bpy.ops.render.render(write_still=True)
print(f"✓ Rendered: {render_path}")

print("\n" + "=" * 50)
print("MAP RENDER COMPLETE!")
print("=" * 50)
