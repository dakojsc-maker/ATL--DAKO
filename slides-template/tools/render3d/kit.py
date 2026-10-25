"""
Blender (bpy) toolkit for the 3D artwork of the keynote decks: isometric glass / silver platforms with glowing seams
and simple product objects, rendered with Cycles to transparent PNGs so they composite cleanly on any slide.

    import kit as B
    B.reset(); B.studio(); cam = B.iso_camera(scale=6)
    B.platform((0, 0, 0), size=3)
    B.render('out.png', 1600, 1200, samples=96)
"""
import math
import os

import bpy
from mathutils import Vector


def hexrgb(h, a=1.0):
    h = h.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, a)


# ------------------------------------------------------------------ scene
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _MATS.clear()
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.render.film_transparent = True
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8
    sc.cycles.transmission_bounces = 8
    return sc


def studio(world=0.55, key=900, fill=380, rim=500, warm=False):
    """Soft studio: grey world for reflections + large key (top-left), fill (right) and rim (back) area lights."""
    w = bpy.data.worlds.new('w')
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs[0].default_value = hexrgb('E9EEF0')
    bg.inputs[1].default_value = world
    for nm, loc, energy, size, col in (('key', (-6, -4, 9), key, 7, 'FFFFFF'), ('fill', (7, -6, 5), fill, 6, 'F2FFF4'),
                                       ('rim', (2, 8, 6), rim, 5, 'E8FFE0' if not warm else 'FFF3E0')):
        ld = bpy.data.lights.new(nm, 'AREA')
        ld.energy, ld.size, ld.color = energy, size, hexrgb(col)[:3]
        ob = bpy.data.objects.new(nm, ld)
        bpy.context.scene.collection.objects.link(ob)
        ob.location = loc
        look_at(ob, (0, 0, 0))


def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def iso_camera(scale=6.0, elev=32, azim=45, target=(0, 0, 0.4), dist=30):
    cd = bpy.data.cameras.new('cam')
    cd.type = 'ORTHO'
    cd.ortho_scale = scale
    cam = bpy.data.objects.new('cam', cd)
    bpy.context.scene.collection.objects.link(cam)
    e, a = math.radians(elev), math.radians(azim)
    t = Vector(target)
    cam.location = t + Vector((math.cos(e) * math.sin(a), -math.cos(e) * math.cos(a), math.sin(e))) * dist
    look_at(cam, t)
    bpy.context.scene.camera = cam
    return cam


def render(out, w=1600, h=1200, samples=96):
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    sc.cycles.samples = samples
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.filepath = os.path.abspath(out)
    bpy.ops.render.render(write_still=True)
    return out


# ------------------------------------------------------------------ materials
_MATS = {}


def mat(name, color='FFFFFF', metal=0.0, rough=0.4, trans=0.0, emit=None, strength=0.0, coat=0.0, alpha=1.0,
        ior=1.45, sss=0.0):
    key = (name, color, metal, rough, trans, emit, strength, coat, alpha)
    if key in _MATS:
        return _MATS[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = hexrgb(color)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    p.inputs['Transmission Weight'].default_value = trans
    p.inputs['IOR'].default_value = ior
    p.inputs['Coat Weight'].default_value = coat
    p.inputs['Subsurface Weight'].default_value = sss
    if emit:
        p.inputs['Emission Color'].default_value = hexrgb(emit)
        p.inputs['Emission Strength'].default_value = strength
    if alpha < 1:
        p.inputs['Alpha'].default_value = alpha
        m.blend_method = 'BLEND'
    _MATS[key] = m
    return m


def emission(name, color, strength=5.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = hexrgb(color)
    e.inputs[1].default_value = strength
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(e.outputs[0], o.inputs[0])
    return m


def image_mat(name, path, emit=0.0, rough=0.35, alpha=True):
    """Material from an image (screens, labels, logos). emit > 0 makes it glow like a display."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(os.path.abspath(path))
    tex.extension = 'CLIP'
    nt.links.new(tex.outputs['Color'], p.inputs['Base Color'])
    p.inputs['Roughness'].default_value = rough
    if emit:
        nt.links.new(tex.outputs['Color'], p.inputs['Emission Color'])
        p.inputs['Emission Strength'].default_value = emit
    if alpha:
        nt.links.new(tex.outputs['Alpha'], p.inputs['Alpha'])
        m.blend_method = 'HASHED'
    return m


def assign(ob, m):
    ob.data.materials.clear()
    ob.data.materials.append(m)
    return ob


# ------------------------------------------------------------------ primitives
def _finish(ob, bevel=0.0, seg=6, smooth=True, angle=40):
    if bevel:
        bm = ob.modifiers.new('bevel', 'BEVEL')
        bm.width, bm.segments = bevel, seg
        bm.limit_method = 'ANGLE'
        bm.harden_normals = False
    if smooth:
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
        ob.select_set(False)
    return ob


def box(loc, size, m, bevel=0.06, seg=6, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(ob, m)
    return _finish(ob, bevel, seg)


def cyl(loc, r, h, m, verts=64, bevel=0.0, rot=(0, 0, 0), seg=4):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc, rotation=rot)
    ob = bpy.context.active_object
    assign(ob, m)
    return _finish(ob, bevel, seg)


def cone(loc, r1, r2, h, m, verts=64, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=h, location=loc, rotation=rot)
    ob = bpy.context.active_object
    assign(ob, m)
    return _finish(ob)


def sphere(loc, r, m, scale=(1, 1, 1), seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    ob = bpy.context.active_object
    ob.scale = scale
    assign(ob, m)
    return _finish(ob, angle=80)


def dome(loc, r, m, scale=(1, 1, 1), seg=64):
    """Upper half of a sphere (helmets, domes) with its rim at loc."""
    import bmesh
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    ob = bpy.context.active_object
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context='VERTS')
    bm.to_mesh(ob.data)
    bm.free()
    ob.scale = scale
    assign(ob, m)
    sol = ob.modifiers.new('solid', 'SOLIDIFY')
    sol.thickness = r * 0.06
    return _finish(ob, angle=80)


def torus(loc, R, r, m, rot=(0, 0, 0), maj=96, mn=24):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot,
                                     major_segments=maj, minor_segments=mn)
    ob = bpy.context.active_object
    assign(ob, m)
    return _finish(ob, angle=80)


def plane(loc, size, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    ob = bpy.context.active_object
    ob.scale = (size[0], size[1], 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return assign(ob, m)


def tube(points, r, m, res=24):
    """Smooth tube along a poly-bezier through points."""
    cu = bpy.data.curves.new('tube', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 6
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(points) - 1)
    for bp, p in zip(sp.bezier_points, points):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    sp.resolution_u = res
    ob = bpy.data.objects.new('tube', cu)
    bpy.context.scene.collection.objects.link(ob)
    cu.materials.append(m)
    return ob


def rounded_rect_curve(cx, cy, z, w, h, r, thick, m, segs=8):
    """Closed rounded-rectangle ring (glowing seam / edge light)."""
    pts = []
    for (ox, oy, a0) in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180),
                         (w / 2 - r, -h / 2 + r, 270)):
        for k in range(segs + 1):
            a = math.radians(a0 + 90 * k / segs)
            pts.append((cx + ox + r * math.cos(a), cy + oy + r * math.sin(a), z))
    cu = bpy.data.curves.new('ring', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = thick
    cu.bevel_resolution = 4
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (*c, 1)
    sp.use_cyclic_u = True
    ob = bpy.data.objects.new('ring', cu)
    bpy.context.scene.collection.objects.link(ob)
    cu.materials.append(m)
    return ob


# ------------------------------------------------------------------ the STP platform
SILVER = dict(color='D7DDE1', metal=0.55, rough=0.22)
WHITE = dict(color='F4F7F6', metal=0.0, rough=0.28, coat=0.6)
GLASS = dict(color='EAF7EE', trans=0.85, rough=0.18, ior=1.45)


def platform(c=(0, 0, 0), size=3.0, glow='7FC211', glow_strength=7, top='glass', ports=True):
    """Two-tier rounded platform: silver base, glowing lime seam, frosted glass (or white) top. Returns top z."""
    x, y, z = c
    s = size
    r = s * 0.12
    base_h, seam_h, top_h = s * 0.11, s * 0.018, s * 0.075
    box((x, y, z + base_h / 2), (s, s, base_h), mat('silver', **SILVER), bevel=r * 0.5, seg=10)
    rounded_rect_curve(x, y, z + base_h + seam_h * 0.4, s * 0.93, s * 0.93, r * 0.85, seam_h * 0.55,
                       emission('seam', glow, glow_strength))
    tm = mat('glass', **GLASS) if top == 'glass' else mat('white', **WHITE)
    box((x, y, z + base_h + seam_h + top_h / 2), (s * 0.9, s * 0.9, top_h), tm, bevel=r * 0.42, seg=10)
    inner = z + base_h + seam_h + top_h
    box((x, y, inner + 0.004), (s * 0.78, s * 0.78, 0.01), mat('white', **WHITE), bevel=0.004, seg=2)
    if ports:            # glowing connector slots on the two visible sides
        for dx, dy, sx, sy in ((s / 2, 0, 0.03, s * 0.16), (0, -s / 2, s * 0.16, 0.03)):
            box((x + dx, y + dy, z + base_h * 0.5), (sx, sy, base_h * 0.14), emission('portglow', glow, 4), bevel=0.0)
    return inner + 0.01


def voxels(matrix, origin, cell, height, m, gap=0.12):
    """Extruded blocks for every True cell of a 2D matrix (QR codes, pixel icons) as one mesh."""
    import bmesh
    me = bpy.data.meshes.new('vox')
    bm = bmesh.new()
    ox, oy, oz = origin
    n = len(matrix)
    c = cell * (1 - gap)
    for j, row in enumerate(matrix):
        for i, v in enumerate(row):
            if not v:
                continue
            cx, cy = ox + (i - n / 2 + 0.5) * cell, oy + (n / 2 - j - 0.5) * cell
            res = bmesh.ops.create_cube(bm, size=1.0)
            for vert in res['verts']:
                vert.co.x = cx + vert.co.x * c
                vert.co.y = cy + vert.co.y * c
                vert.co.z = oz + (vert.co.z + 0.5) * height
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new('vox', me)
    bpy.context.scene.collection.objects.link(ob)
    assign(ob, m)
    return _finish(ob, bevel=cell * 0.12, seg=2, smooth=False)
