# Shading, lighting and render code

Written against Blender 4.2 - 5.x. When a name is rejected, check it with
`bpy_api_lookup` or `describe_node_type` instead of guessing variants.

## A material that renders

```python
import bpy

def principled_material(name, color, roughness=0.5, metallic=0.0, **inputs):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    values = {"Base Color": (*color, 1.0), "Roughness": roughness, "Metallic": metallic, **inputs}
    for key, value in values.items():
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = value
        else:
            print("no such input:", key)
    mat.diffuse_color = (*color, 1.0)          # viewport (solid mode) only
    return mat

def assign(obj, mat):
    if mat.name not in obj.data.materials:
        obj.data.materials.append(mat)
    return list(obj.data.materials).index(mat)

wood = principled_material("Oak_Wood", (0.45, 0.28, 0.13), roughness=0.55)
steel = principled_material("Brushed_Steel", (0.62, 0.62, 0.64), roughness=0.3, metallic=1.0)
glass = principled_material("Glass", (0.95, 0.98, 1.0), roughness=0.0,
                            **{"Transmission Weight": 1.0, "IOR": 1.45})
lamp = principled_material("Glow", (1.0, 0.85, 0.6),
                           **{"Emission Color": (1.0, 0.85, 0.6, 1.0), "Emission Strength": 8.0})
assign(bpy.data.objects["Chair_Seat"], wood)
```

Colors are linear RGB, 0-1. To convert an sRGB hex value (what a color picker on the web
shows), each channel is `((c / 255 + 0.055) / 1.055) ** 2.4` for values above about 10,
otherwise `c / 255 / 12.92`.

## Different materials on one mesh

```python
obj = bpy.data.objects["Mug"]
body = assign(obj, principled_material("Ceramic", (0.9, 0.9, 0.88), roughness=0.25))
inner = assign(obj, principled_material("Coffee", (0.08, 0.04, 0.02), roughness=0.1))
for poly in obj.data.polygons:
    poly.material_index = inner if poly.normal.z > 0.9 and poly.center.z < 0.09 else body
```

## Procedural texture (no image files)

```python
nt = mat.node_tree
bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
coord = nt.nodes.new('ShaderNodeTexCoord')
noise = nt.nodes.new('ShaderNodeTexNoise')
noise.inputs["Scale"].default_value = 12.0
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.30, 0.17, 0.08, 1.0)
ramp.color_ramp.elements[1].color = (0.55, 0.36, 0.18, 1.0)
bump = nt.nodes.new('ShaderNodeBump')
bump.inputs["Strength"].default_value = 0.15
nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
```

"Object" coordinates need no UV map. Image textures need UVs: for simple shapes,
`bpy.ops.uv.smart_project()` in edit mode, or use "Generated" coordinates.

## World

```python
scene = bpy.context.scene
world = scene.world or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs["Color"].default_value = (0.05, 0.06, 0.08, 1.0)
bg.inputs["Strength"].default_value = 0.4
```

With an HDRI file already on disk: add a `ShaderNodeTexEnvironment`, set
`node.image = bpy.data.images.load(path)` and link its Color output to the Background's
Color input.

## Three lights and a ground

```python
import bpy, math
from mathutils import Vector

def area_light(name, location, power, size, target=(0, 0, 0.5)):
    data = bpy.data.lights.get(name) or bpy.data.lights.new(name, 'AREA')
    data.energy = power
    data.size = size
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, data)
        bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    direction = Vector(target) - Vector(location)
    obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    return obj

area_light("Key", (2.0, -2.0, 2.5), 400, 1.5)
area_light("Fill", (-2.5, -1.5, 1.5), 120, 2.0)
area_light("Rim", (0.0, 2.5, 2.0), 250, 1.0)
```

Scale positions and power with the subject: these suit something about 1 m across.
Power grows with the square of the distance.

## Camera aimed at a target

```python
cam_data = bpy.data.cameras.new("Camera_Main")
cam_data.lens = 70
cam = bpy.data.objects.new("Camera_Main", cam_data)
bpy.context.scene.collection.objects.link(cam)
cam.location = (2.2, -2.6, 1.6)

target = bpy.data.objects.new("Camera_Target", None)
bpy.context.scene.collection.objects.link(target)
target.location = (0.0, 0.0, 0.45)
track = cam.constraints.new('TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
bpy.context.scene.camera = cam
```

## Engine and quality

```python
scene = bpy.context.scene
print("engine now:", scene.render.engine)

def use_eevee(scene):
    for ident in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
        try:
            scene.render.engine = ident
            break
        except TypeError:
            continue
    if hasattr(scene.eevee, "use_raytracing"):
        scene.eevee.use_raytracing = True        # reflections and refractions
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 64

def use_cycles(scene, samples=128):
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
```

In EEVEE, a transparent material also needs, on the material, `use_raytrace_refraction =
True` (4.2+) for real refraction.

## Render to a file

```python
import bpy, os, time
scene = bpy.context.scene
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 50            # test; 100 for the final
scene.render.image_settings.file_format = 'PNG'
folder = os.path.dirname(bpy.data.filepath) or bpy.app.tempdir
scene.render.filepath = os.path.join(folder, "render_test.png")
start = time.time()
bpy.ops.render.render(write_still=True)
print("rendered", scene.render.filepath, f"{time.time() - start:.1f}s",
      os.path.getsize(scene.render.filepath), "bytes")
```

A file of a few kilobytes at this resolution is almost certainly a black or empty image:
check lights, world and camera before telling the user it worked.

Transparent background: `scene.render.film_transparent = True` (PNG with alpha).
Flat graphic colors: `scene.view_settings.view_transform = 'Standard'`.

## Viewport shading for screenshots

To see materials in a viewport screenshot, switch the 3D viewport to material preview:

```python
area = next(a for a in bpy.context.screen.areas if a.type == 'VIEW_3D')
area.spaces.active.shading.type = 'MATERIAL'      # 'SOLID', 'MATERIAL', 'RENDERED'
```

Tell the user you changed the viewport mode, or set it back when you finish.
