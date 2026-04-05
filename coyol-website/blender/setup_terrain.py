"""
Blender GIS Setup Script for Coyol Real Estate
Run this in Blender to set up the terrain and lot boundaries

Usage: 
1. Open Blender
2. Go to Scripting tab
3. Open this file
4. Run script
"""

import bpy
import json
import os
from pathlib import Path

# Project paths
PROJECT_DIR = Path.home() / ".openclaw/workspace/coyol-website"
DATA_DIR = PROJECT_DIR / "public/data"

# Mar Azul coordinates (center)
MAR_AZUL_CENTER = (-85.637, 10.003)
MAR_AZUL_BOUNDS = {
    'west': -85.642,
    'east': -85.632,
    'south': 9.997,
    'north': 10.008
}

def clear_scene():
    """Remove default cube and lights"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    print("Scene cleared")

def setup_geoscene():
    """Configure BlenderGIS geoscene for Nosara, Costa Rica"""
    # Check if BlenderGIS is available
    try:
        from core.proj.srs import SRS
        print("BlenderGIS found!")
    except ImportError:
        print("ERROR: BlenderGIS addon not enabled!")
        print("Go to Edit > Preferences > Add-ons and enable 'BlenderGIS'")
        return False
    return True

def create_lot_from_coords(name, coordinates, height=0.5, color=(0.13, 0.77, 0.37, 0.7)):
    """Create a 3D lot polygon from coordinates"""
    # Convert lat/lng to local coordinates (offset from center)
    center_lng, center_lat = MAR_AZUL_CENTER
    scale = 111000  # meters per degree (approximate)
    
    verts = []
    for lng, lat in coordinates[:-1]:  # Skip closing point
        x = (lng - center_lng) * scale * 0.85  # cos(10°) adjustment
        y = (lat - center_lat) * scale
        verts.append((x, y, 0))
        verts.append((x, y, height))
    
    # Create faces
    n = len(coordinates) - 1
    faces = []
    
    # Top face
    top_face = [i * 2 + 1 for i in range(n)]
    faces.append(top_face)
    
    # Bottom face
    bottom_face = [i * 2 for i in range(n)]
    faces.append(bottom_face[::-1])
    
    # Side faces
    for i in range(n):
        next_i = (i + 1) % n
        faces.append([i*2, next_i*2, next_i*2+1, i*2+1])
    
    # Create mesh
    mesh = bpy.data.meshes.new(name + "_mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    
    # Create object
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    
    # Create material
    mat = bpy.data.materials.new(name + "_mat")
    mat.use_nodes = True
    mat.blend_method = 'BLEND'
    
    # Set color
    principled = mat.node_tree.nodes["Principled BSDF"]
    principled.inputs["Base Color"].default_value = color
    principled.inputs["Alpha"].default_value = color[3]
    
    obj.data.materials.append(mat)
    
    return obj

def load_lots():
    """Load lots from JSON and create 3D objects"""
    json_path = DATA_DIR / "mar-azul-structured.json"
    
    if not json_path.exists():
        print(f"ERROR: {json_path} not found!")
        return
    
    with open(json_path) as f:
        data = json.load(f)
    
    print(f"Loading {len(data['lots'])} lots...")
    
    # Create collection for lots
    lots_collection = bpy.data.collections.new("Mar_Azul_Lots")
    bpy.context.scene.collection.children.link(lots_collection)
    
    # Status colors
    colors = {
        'available': (0.13, 0.77, 0.37, 0.7),  # Green
        'reserved': (0.92, 0.70, 0.03, 0.7),   # Yellow
        'sold': (0.94, 0.27, 0.27, 0.7)        # Red
    }
    
    for lot in data['lots']:
        color = colors.get(lot['status'], colors['available'])
        obj = create_lot_from_coords(
            lot['id'],
            lot['coordinates'],
            height=2.0,
            color=color
        )
        
        # Link to lots collection (already in scene collection via objects.link above)
        lots_collection.objects.link(obj)
        
        # Store metadata
        obj['lot_number'] = lot['lotNumber']
        obj['area_m2'] = lot['areaM2']
        obj['status'] = lot['status']
        obj['development'] = lot['development']
    
    print(f"Created {len(data['lots'])} lot objects")

def add_ground_plane():
    """Add a ground plane for reference"""
    bpy.ops.mesh.primitive_plane_add(size=1000, location=(0, 0, -0.1))
    plane = bpy.context.active_object
    plane.name = "Ground"
    
    # Green material
    mat = bpy.data.materials.new("Ground_mat")
    mat.use_nodes = True
    principled = mat.node_tree.nodes["Principled BSDF"]
    principled.inputs["Base Color"].default_value = (0.2, 0.4, 0.2, 1.0)
    plane.data.materials.append(mat)

def setup_camera():
    """Set up camera for aerial view"""
    bpy.ops.object.camera_add(location=(0, -300, 400))
    cam = bpy.context.active_object
    cam.rotation_euler = (0.8, 0, 0)  # Tilt down
    bpy.context.scene.camera = cam

def setup_lighting():
    """Add sun light"""
    bpy.ops.object.light_add(type='SUN', location=(100, 100, 200))
    sun = bpy.context.active_object
    sun.data.energy = 3

def main():
    print("\n" + "="*50)
    print("COYOL REAL ESTATE - Blender Setup")
    print("="*50 + "\n")
    
    clear_scene()
    add_ground_plane()
    load_lots()
    setup_camera()
    setup_lighting()
    
    # Save the file
    output_path = PROJECT_DIR / "blender" / "coyol_mar_azul.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(output_path))
    print(f"\n✅ Saved to: {output_path}")
    
    print("\n✅ Setup complete!")
    print("Next steps:")
    print("1. Open coyol_mar_azul.blend in Blender")
    print("2. Enable BlenderGIS addon (Edit > Preferences > Add-ons)")
    print("3. Use GIS > Web geodata > Basemap to add satellite imagery")
    print("4. Use GIS > Web geodata > Get elevation (SRTM) for terrain")
    print("5. Add trees with Geometry Nodes or Scatter addon")

if __name__ == "__main__":
    main()
