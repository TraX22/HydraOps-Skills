# bpy patterns for modeling

Written against Blender 4.2 - 5.x. Names do change between versions: when a call fails
with an attribute or keyword error, check it with `bpy_api_lookup` instead of trying
variants blindly.

## Start of a task

```python
import bpy
print(bpy.app.version_string, "| units:", bpy.context.scene.unit_settings.system,
      "| objects:", len(bpy.data.objects))
```

## A collection for the model, and a helper to reuse objects by name

```python
import bpy

def get_collection(name):
    col = bpy.data.collections.get(name)
    if col is None:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    return col

def new_object(name, mesh, collection):
    """Create the object, or replace the mesh of the one that already has this name."""
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, mesh)
        collection.objects.link(obj)
    else:
        old = obj.data
        obj.data = mesh
        if old.users == 0:
            bpy.data.meshes.remove(old)
    return obj
```

Do not count on helpers surviving between calls: include the ones you use in every
`execute_blender_code` call.

## Primitives without operators (bmesh)

```python
import bpy, bmesh
from mathutils import Matrix

def make_mesh(name, build):
    bm = bmesh.new()
    build(bm)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    return mesh

box = make_mesh("Seat", lambda bm: bmesh.ops.create_cube(bm, size=1.0))
cyl = make_mesh("Leg", lambda bm: bmesh.ops.create_cone(
    bm, cap_ends=True, segments=24, radius1=0.02, radius2=0.02, depth=0.45))
ball = make_mesh("Knob", lambda bm: bmesh.ops.create_uvsphere(
    bm, u_segments=24, v_segments=12, radius=0.03))
```

- `create_cube(size=1.0)` gives a 1 m cube centered on the origin: set
  `obj.scale = (width, depth, height)` for a box of those dimensions.
- `create_cone` with equal radii is a cylinder; its axis is Z and it is centered, so a
  0.45 m leg standing on the floor goes at `z = 0.225`.

Operators also work and are fine for quick primitives:
`bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.5))` creates, selects and
activates the object; rename it right away via `bpy.context.active_object`, and move it
to your collection.

## Transforms

```python
import math
obj.location = (0.0, 0.0, 0.45)
obj.rotation_euler = (0.0, 0.0, math.radians(90))
obj.scale = (0.45, 0.45, 0.04)
bpy.context.view_layer.update()          # dimensions are stale until this
print(obj.name, [round(d, 3) for d in obj.dimensions])
```

Apply scale (needed before Bevel/Solidify look right, and before export):

```python
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
```

## Modifiers

```python
bev = obj.modifiers.new("Bevel", 'BEVEL')
bev.width = 0.005
bev.segments = 3
bev.limit_method = 'ANGLE'

sub = obj.modifiers.new("Subdivision", 'SUBSURF')
sub.levels = 2
sub.render_levels = 2

arr = obj.modifiers.new("Array", 'ARRAY')
arr.count = 8
arr.use_relative_offset = False
arr.use_constant_offset = True
arr.constant_offset_displace = (0.25, 0.0, 0.0)

mir = obj.modifiers.new("Mirror", 'MIRROR')
mir.use_axis = (True, False, False)

sol = obj.modifiers.new("Solidify", 'SOLIDIFY')
sol.thickness = 0.003

boo = obj.modifiers.new("Cut", 'BOOLEAN')
boo.operation = 'DIFFERENCE'
boo.object = cutter            # then: cutter.hide_render = True; cutter.display_type = 'WIRE'
```

Order matters: Mirror and Array before Bevel, Bevel before Subdivision.

Apply a modifier only when you need the real geometry:

```python
bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier="Bevel")
```

## Smooth shading

```python
for poly in obj.data.polygons:
    poly.use_smooth = True
```

For hard-surface objects that need smooth curved faces and sharp edges, add the "Smooth
by Angle" behavior: with the object active and selected,
`bpy.ops.object.shade_auto_smooth(angle=math.radians(30))` (Blender 4.1 and newer; the
old `mesh.use_auto_smooth` property no longer exists).

## Repeating a part cheaply

Link the same mesh to several objects (one edit changes all of them):

```python
for i, (x, y) in enumerate([(-0.2, -0.2), (0.2, -0.2), (-0.2, 0.2), (0.2, 0.2)]):
    leg = bpy.data.objects.new(f"Chair_Leg_{i}", leg_mesh)
    leg.location = (x, y, 0.225)
    col.objects.link(leg)
```

## Curves: pipes, cables, rails

```python
curve = bpy.data.curves.new("Rail", 'CURVE')
curve.dimensions = '3D'
curve.bevel_depth = 0.01          # radius of the tube
curve.bevel_resolution = 4
spline = curve.splines.new('POLY')            # 'BEZIER' for smooth handles
points = [(0, 0, 0), (0, 0, 1), (1, 0, 1)]
spline.points.add(len(points) - 1)
for p, co in zip(spline.points, points):
    p.co = (*co, 1.0)                          # x, y, z, w
obj = bpy.data.objects.new("Rail", curve)
col.objects.link(obj)
```

## Turned objects: profile + Screw

Build a mesh of connected edges for the profile in the XZ plane (x = radius, z =
height), then:

```python
scr = obj.modifiers.new("Screw", 'SCREW')
scr.axis = 'Z'
scr.steps = 48
scr.render_steps = 48
scr.use_merge_vertices = True
```

## Text

```python
txt = bpy.data.curves.new("Label", 'FONT')
txt.body = "HYDRA"
txt.extrude = 0.002
txt.align_x = 'CENTER'
obj = bpy.data.objects.new("Label", txt)
col.objects.link(obj)
```

## Parenting and grouping

```python
root = bpy.data.objects.new("Chair", None)     # an empty as the handle of the model
col.objects.link(root)
for part in parts:
    part.parent = root
```

Set the parent before positioning children, or keep the child's world position with
`part.matrix_parent_inverse = root.matrix_world.inverted()`.

## Operators that need a context

If an operator raises "context is incorrect", run it with an override for a 3D viewport:

```python
area = next(a for a in bpy.context.screen.areas if a.type == 'VIEW_3D')
region = next(r for r in area.regions if r.type == 'WINDOW')
with bpy.context.temp_override(area=area, region=region):
    bpy.ops.view3d.view_all()
```

## Framing the viewport before a screenshot

```python
area = next(a for a in bpy.context.screen.areas if a.type == 'VIEW_3D')
region = next(r for r in area.regions if r.type == 'WINDOW')
bpy.ops.object.select_all(action='DESELECT')
for o in col.objects:
    o.select_set(True)
with bpy.context.temp_override(area=area, region=region):
    bpy.ops.view3d.view_selected()
```

## Checks worth printing

```python
for o in col.objects:
    if o.type == 'MESH':
        print(o.name, "verts", len(o.data.vertices), "dims",
              [round(d, 3) for d in o.dimensions], "scale", [round(s, 3) for s in o.scale])
```
