"""
3D artwork of the Viện STP keynote (Blender / Cycles, transparent PNGs, one isometric camera for all platforms so
they compose as one scene on the slides).

    python tools/render3d/stp_scenes.py <scene|all> [out_dir] [samples]
Scenes: core research training trace iot digital ai laptop phone
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import kit as B  # noqa: E402
import textures as TX  # noqa: E402

TEX = os.path.join(ROOT, 'assets', 'images', 'build', 'stp3d', 'tex')
LOGO = os.path.join(ROOT, 'assets', 'images', 'src', 'stp', 'logo_stp.png')
LIME, GREEN, DEEP, RED = '7FC211', '207D08', '0D3B24', 'DE0709'
R45 = math.radians(45)


def stage(scale=5.4, target=(0, 0, 1.15)):
    B.reset()
    B.studio()
    B.iso_camera(scale=scale, target=target)


def glow_beam(name, color, strength=2.0, mix=0.82):
    import bpy
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = B.hexrgb(color)
    e.inputs[1].default_value = strength
    t = nt.nodes.new('ShaderNodeBsdfTransparent')
    mx = nt.nodes.new('ShaderNodeMixShader')
    mx.inputs[0].default_value = mix
    nt.links.new(e.outputs[0], mx.inputs[1])
    nt.links.new(t.outputs[0], mx.inputs[2])
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(mx.outputs[0], o.inputs[0])
    m.blend_method = 'BLEND'
    return m


def facing(ob):
    """Rotate an upright object (built in the XZ plane) to face the isometric camera."""
    ob.rotation_euler = (ob.rotation_euler[0], ob.rotation_euler[1], R45)


# ------------------------------------------------------------------ scenes
def core():
    stage()
    top = B.platform((0, 0, 0), 3.0)
    B.torus((0, 0, top + 0.01), 1.12, 0.018, B.emission('ring', LIME, 5))
    stand = B.box((0, 0, top + 0.09), (2.0, 0.42, 0.18), B.mat('silver', **B.SILVER), bevel=0.06, rot=(0, 0, R45))
    stand.rotation_euler = (0, 0, R45)
    glass = B.box((0, 0, top + 1.05), (1.9, 0.1, 1.75), B.mat('frost', color='F4FBF6', trans=0.75, rough=0.22),
                  bevel=0.07, seg=8, rot=(0, 0, R45))
    lg = B.plane((0, 0, top + 1.07), (1.5, 1.5), B.image_mat('logo', LOGO, emit=0.25), rot=(math.radians(90), 0, R45))
    off = 0.06
    lg.location = (off * math.sin(R45), -off * math.cos(R45), top + 1.07)
    B.box((0, 0, top + 0.19), (1.7, 0.06, 0.02), B.emission('slot', LIME, 6), bevel=0.0, rot=(0, 0, R45))
    _ = glass


def research():
    stage()
    top = B.platform((0, 0, 0), 3.0)
    gm = B.mat('barglass', color='F3FBF5', trans=0.6, rough=0.12, coat=0.5)
    cap = B.emission('barcap', LIME, 5)
    for k, hgt in enumerate((0.55, 0.85, 1.2, 1.6)):
        x, y = -0.85 + k * 0.42, 0.55 - k * 0.0
        B.box((x, y, top + hgt / 2), (0.3, 0.3, hgt), gm, bevel=0.05)
        B.box((x, y, top + hgt + 0.012), (0.28, 0.28, 0.025), cap, bevel=0.01)
    pts = [(-0.85, 0.2, top + 0.7), (-0.43, 0.2, top + 1.0), (-0.01, 0.2, top + 1.3), (0.41, 0.2, top + 1.8)]
    B.tube(pts, 0.02, B.emission('trend', LIME, 4))
    for p in pts:
        B.sphere(p, 0.06, B.emission('dot', 'FFFFFF', 6))
    fl = B.mat('flask', color='F5FFF7', trans=0.95, rough=0.03)
    fx, fy = 0.6, -0.5
    B.cone((fx, fy, top + 0.33), 0.42, 0.13, 0.66, fl)
    B.cyl((fx, fy, top + 0.82), 0.12, 0.36, fl, bevel=0.01)
    B.cone((fx, fy, top + 0.17), 0.37, 0.24, 0.3, B.mat('liquid', color='7FC211', trans=0.4, rough=0.1, emit=LIME,
                                                          strength=1.2))
    B.torus((fx, fy, top + 1.0), 0.13, 0.025, fl)
    mx, my = -0.55, -0.65
    ring = B.torus((mx, my, top + 0.72), 0.34, 0.05, B.mat('deep', color=DEEP, metal=0.4, rough=0.3),
                   rot=(math.radians(90), 0, R45))
    lens = B.cyl((mx, my, top + 0.72), 0.31, 0.03, B.mat('lens', color='EAF8FF', trans=1.0, rough=0.02),
                 rot=(math.radians(90), 0, R45))
    hd = B.cyl((mx - 0.0, my - 0.0, top + 0.2), 0.055, 0.5, B.mat('deep', color=DEEP, metal=0.4, rough=0.3), bevel=0.02)
    _ = (ring, lens, hd)
    ax, ay, az = 0.75, 0.75, top + 1.75                      # atom
    B.sphere((ax, ay, az), 0.12, B.emission('nucleus', LIME, 8))
    for rx, ry in ((70, 0), (70, 60), (70, 120)):
        B.torus((ax, ay, az), 0.36, 0.012, B.emission('orbit', 'FFFFFF', 3),
                rot=(math.radians(rx), 0, math.radians(ry)))


def training():
    stage()
    top = B.platform((0, 0, 0), 3.0)
    g = B.mat('capgreen', color='0F3D26', rough=0.32, coat=0.5)
    cx, cy = 0.1, 0.35
    B.cyl((cx, cy, top + 0.25), 0.55, 0.5, g, bevel=0.03)
    B.box((cx, cy, top + 0.54), (1.5, 1.5, 0.07), g, bevel=0.025)
    B.cyl((cx, cy, top + 0.59), 0.08, 0.05, B.mat('gold', color='E8C25A', metal=0.9, rough=0.25), bevel=0.012)
    B.tube([(cx, cy, top + 0.6), (cx + 0.3, cy - 0.3, top + 0.59), (cx + 0.7, cy - 0.7, top + 0.585),
            (cx + 0.73, cy - 0.73, top + 0.2)], 0.02, B.emission('tassel', LIME, 3))
    B.cyl((cx + 0.73, cy - 0.73, top + 0.16), 0.05, 0.18, B.emission('tassel', LIME, 3))
    paper = B.mat('paper', color='FBF8EF', rough=0.6)
    dx, dy = -0.65, -0.35
    B.cyl((dx, dy, top + 0.15), 0.15, 1.25, paper, rot=(0, math.radians(90), math.radians(-45)), bevel=0.02)
    B.torus((dx, dy, top + 0.15), 0.155, 0.03, B.mat('ribbon', color=RED, rough=0.35, coat=0.4),
            rot=(0, math.radians(90), math.radians(-45)))
    hx, hy = 0.72, -0.55                                  # stack of books
    for k, (col, w_, d_, h_, rz) in enumerate((('0F3D26', 0.95, 0.68, 0.16, 8), ('7FC211', 0.88, 0.62, 0.14, -6),
                                               ('F4F7F6', 0.82, 0.58, 0.13, 14))):
        z = top + 0.08 + sum((0.16, 0.14, 0.13)[:k]) + 0.002 * k
        hh = (0.16, 0.14, 0.13)[k]
        B.box((hx, hy, z), (w_, d_, hh), B.mat(f'cover{k}', color=col, rough=0.35, coat=0.5), bevel=0.02,
              rot=(0, 0, math.radians(45 + rz)))
        B.box((hx, hy, z), (w_ - 0.06, d_ + 0.012, hh - 0.04), B.mat('pages', color='FBF8EF', rough=0.7), bevel=0.0,
              rot=(0, 0, math.radians(45 + rz)))


def trace():
    stage()
    top = B.platform((0, 0, 0), 3.0)
    kraft = B.mat('kraft', color='C9A174', rough=0.75)
    bx, by, bh = 0.0, -0.05, 0.85
    B.box((bx, by, top + bh / 2), (1.3, 1.3, bh), kraft, bevel=0.03, seg=3)
    B.box((bx, by, top + bh + 0.002), (0.26, 1.32, 0.012), B.mat('tape', color='E6CFA6', rough=0.4), bevel=0.0)
    lab = B.plane((bx, by - 0.652, top + bh * 0.5), (0.9, 0.64), B.image_mat('label', os.path.join(TEX, 'box_label.png'),
                                                                          alpha=False), rot=(math.radians(90), 0, 0))
    _ = lab
    qz = top + bh + 0.95
    B.box((bx, by, qz - 0.03), (1.35, 1.35, 0.05), B.mat('clear', color='F2FBF4', trans=0.9, rough=0.1), bevel=0.04)
    B.rounded_rect_curve(bx, by, qz - 0.03, 1.33, 1.33, 0.08, 0.012, B.emission('qedge', LIME, 6))
    m = TX.qr_matrix()
    B.voxels(m, (bx, by, qz), 1.2 / len(m), 0.09, B.mat('qrblock', color='F4F7F6', rough=0.25, coat=0.6))
    B.cyl((bx, by, top + bh + 0.47), 0.55, 0.9, glow_beam('beam', LIME, 2.2, 0.86), verts=96)
    ckx, cky, ckz = 1.0, 0.75, top + 1.65
    B.cyl((ckx, cky, ckz), 0.36, 0.06, B.mat('badge', color=GREEN, rough=0.3, coat=0.6, emit=LIME, strength=0.6),
          rot=(math.radians(90), 0, R45))
    B.torus((ckx, cky, ckz), 0.36, 0.03, B.emission('badgering', LIME, 6), rot=(math.radians(90), 0, R45))
    rx, ry = 0.7071, 0.7071                        # screen-right direction; (rx, -ry) points at the camera
    fx, fy = 0.05 * rx, -0.05 * ry

    def P(u, v):
        return (ckx + u * rx + fx, cky + u * ry + fy, ckz + v)
    B.tube([P(-0.17, 0.0), P(-0.05, -0.12), P(0.19, 0.14)], 0.035, B.emission('check', 'FFFFFF', 7), res=1)


def iot():
    stage()
    top = B.platform((0, 0, 0), 3.0)
    soil = B.mat('soil', color='5A3B22', rough=0.9)
    sh = 0.32
    B.box((0, 0, top + sh / 2), (2.15, 2.15, sh), soil, bevel=0.06)
    B.box((0, 0, top + sh + 0.02), (2.12, 2.12, 0.05), B.mat('grass', color='3E8E2A', rough=0.8), bevel=0.03)
    leaf = B.mat('leaf', color='5DB23A', rough=0.5, coat=0.3)
    leaf2 = B.mat('leaf2', color='2F7D24', rough=0.5)
    import random
    rnd = random.Random(4)
    for i in range(5):
        for j in range(5):
            x, y = -0.85 + i * 0.42, -0.85 + j * 0.42
            if (x > 0.05 and y < -0.05) or (x < -0.3 and y > 0.3):
                continue
            for k in range(3):
                a = rnd.uniform(0, 6.28)
                B.sphere((x + 0.06 * math.cos(a), y + 0.06 * math.sin(a), top + sh + 0.12 + k * 0.03), 0.09,
                         leaf if k % 2 else leaf2, scale=(1.0, 0.55, 1.6), seg=24)
    dev = B.mat('device', color='1C2B4A', rough=0.3, coat=0.6)
    sx, sy = 0.55, -0.55
    B.box((sx, sy, top + sh + 0.38), (0.34, 0.16, 0.5), dev, bevel=0.04, rot=(0, 0, R45))
    B.box((sx, sy, top + sh + 0.45), (0.2, 0.17, 0.05), B.emission('led', LIME, 6), bevel=0.0, rot=(0, 0, R45))
    for k in range(4):
        o = -0.11 + k * 0.075
        B.cyl((sx + o * 0.707, sy + o * 0.707, top + sh + 0.05), 0.012, 0.25,
              B.mat('steel', color='C9CED2', metal=1.0, rough=0.2))
    mx, my = -0.7, 0.7
    B.cyl((mx, my, top + sh + 0.85), 0.035, 1.7, B.mat('steel', color='C9CED2', metal=1.0, rough=0.2))
    B.cyl((mx, my, top + sh + 1.78), 0.05, 0.22, B.mat('white', **B.WHITE), bevel=0.02)
    for k, r in enumerate((0.25, 0.42, 0.6)):
        B.torus((mx, my, top + sh + 1.8), r, 0.012, B.emission(f'wave{k}', LIME, 6 - k * 1.6))
    px, py = 0.65, 0.62
    B.cyl((px, py, top + sh + 0.3), 0.03, 0.6, B.mat('steel', color='C9CED2', metal=1.0, rough=0.2))
    B.plane((px, py, top + sh + 0.63), (0.75, 0.52), B.image_mat('solar', os.path.join(TEX, 'solar.png'), alpha=False,
                                                                    rough=0.15),
            rot=(math.radians(-35), 0, R45))


def digital():
    stage()
    top = B.platform((0, 0, 0), 3.0)
    rack = B.mat('rack', color='1E2A25', metal=0.4, rough=0.35, coat=0.4)
    for k, (x, y) in enumerate(((-0.75, 0.55), (-0.2, 0.75))):
        B.box((x, y, top + 0.7), (0.5, 0.5, 1.4), rack, bevel=0.03)
        for j in range(6):
            z = top + 0.22 + j * 0.2
            B.box((x, y - 0.252, z), (0.36, 0.01, 0.025), B.emission('rled', LIME if j % 2 else 'FFFFFF', 4), bevel=0)
            B.box((x + 0.252, y, z), (0.01, 0.36, 0.025), B.emission('rled2', LIME if j % 3 else 'FFFFFF', 3), bevel=0)
    sx, sy, sz = 0.45, -0.35, top + 1.0
    B.box((sx, sy, sz), (1.75, 0.07, 1.1), B.mat('bezel', color='111916', metal=0.3, rough=0.3), bevel=0.04,
          rot=(0, 0, R45))
    scr = B.plane((sx, sy, sz), (1.66, 1.02), B.image_mat('dash', os.path.join(TEX, 'dashboard.png'), emit=1.4,
                                                          alpha=False), rot=(math.radians(90), 0, R45))
    scr.location = (sx + 0.037 * math.sin(R45), sy - 0.037 * math.cos(R45), sz)
    B.cyl((sx, sy, top + 0.22), 0.04, 0.44, B.mat('steel', color='C9CED2', metal=1.0, rough=0.2))
    B.cyl((sx, sy, top + 0.015), 0.32, 0.03, B.mat('silver', **B.SILVER), bevel=0.01)


def ai():
    stage()
    top = B.platform((0, 0, 0), 3.0)
    gold = B.mat('gold', color='E8C25A', metal=0.95, rough=0.22)
    for k in range(7):
        o = -0.6 + k * 0.2
        for (x, y, sx, sy) in ((o, 0.78, 0.07, 0.3), (o, -0.78, 0.07, 0.3), (0.78, o, 0.3, 0.07), (-0.78, o, 0.3, 0.07)):
            B.box((x, y, top + 0.05), (sx, sy, 0.03), gold, bevel=0.008, seg=2)
    B.box((0, 0, top + 0.13), (1.45, 1.45, 0.2), B.mat('chip', color='14211B', metal=0.2, rough=0.3, coat=0.7),
          bevel=0.05)
    B.box((0, 0, top + 0.235), (1.05, 1.05, 0.02), B.mat('die', color='22352B', metal=0.6, rough=0.25), bevel=0.02)
    import bpy
    cu = bpy.data.curves.new('ai', 'FONT')
    cu.body = 'AI'
    cu.font = bpy.data.fonts.load(os.path.join(ROOT, 'fonts', 'keynote', 'BeVietnamPro-Black.ttf'))
    cu.size, cu.extrude, cu.align_x, cu.align_y = 0.72, 0.06, 'CENTER', 'CENTER'
    tx = bpy.data.objects.new('ai', cu)
    bpy.context.scene.collection.objects.link(tx)
    tx.location = (0, 0, top + 0.31)
    tx.rotation_euler = (0, 0, R45)
    cu.materials.append(B.emission('aitext', LIME, 7))
    for k, (r, z) in enumerate(((0.95, 0.9), (0.7, 1.35))):
        B.torus((0, 0, top + z), r, 0.014, B.emission(f'holo{k}', LIME if k else 'FFFFFF', 4))
    B.cone((0, 0, top + 0.75), 0.6, 0.2, 1.0, glow_beam('aibeam', LIME, 1.6, 0.9))
    for a in range(8):                                     # traces to the platform edge
        ang = math.radians(22.5 + a * 45)
        r0, r1 = 0.85, 1.2
        B.tube([(r0 * math.cos(ang), r0 * math.sin(ang), top + 0.012), (r1 * math.cos(ang), r1 * math.sin(ang),
                                                                         top + 0.012)], 0.012,
               B.emission('trace', LIME, 4), res=2)
        B.sphere((r1 * math.cos(ang), r1 * math.sin(ang), top + 0.015), 0.035, B.emission('pad', 'FFFFFF', 5), seg=16)


def laptop():
    """Laptop with the real enterprise dashboard + tablet with the certificate lookup page (real screenshots)."""
    import mathutils
    B.reset()
    B.studio()
    B.iso_camera(scale=5.6, elev=26, azim=28, target=(0.3, -0.2, 0.8))
    alu = B.mat('alu', color='C8CDD1', metal=0.85, rough=0.28)
    B.box((0, 0, 0.05), (3.0, 2.05, 0.1), alu, bevel=0.05, seg=8)
    B.box((0, 0.2, 0.102), (2.6, 1.05, 0.01), B.mat('keys', color='2A2F2C', rough=0.55), bevel=0.01)
    B.box((0, -0.68, 0.102), (0.9, 0.48, 0.008), B.mat('pad', color='B9BFC3', metal=0.6, rough=0.3), bevel=0.02)
    tilt = math.radians(-14)                              # lid leans back 14 degrees from vertical
    hinge = mathutils.Vector((0, 1.0, 0.1))
    up = mathutils.Vector((0, -math.sin(tilt), math.cos(tilt)))
    fwd = mathutils.Vector((0, -math.cos(tilt), -math.sin(tilt)))
    B.box(tuple(hinge + up * 0.97), (3.0, 0.07, 1.94), alu, bevel=0.05, seg=8, rot=(tilt, 0, 0))
    B.plane(tuple(hinge + up * 1.0 + fwd * 0.037), (2.82, 1.76),
            B.image_mat('lscreen', os.path.join(TEX, 'laptop_screen.png'), emit=0.75, alpha=False),
            rot=(math.radians(90) + tilt, 0, 0))
    tab = B.mat('tab', color='1A1F1C', metal=0.3, rough=0.3)
    tz = math.radians(-18)
    tx, ty, tzc = 2.05, -0.75, 0.72
    tt = math.radians(-16)
    eul = mathutils.Euler((tt, 0, tz))
    n = mathutils.Vector((0, -1, 0))
    n.rotate(eul)
    B.box((tx, ty, tzc), (2.0, 0.07, 1.42), tab, bevel=0.07, seg=8, rot=(tt, 0, tz))
    B.plane(tuple(mathutils.Vector((tx, ty, tzc)) + n * 0.037), (1.9, 1.32),
            B.image_mat('tscreen', os.path.join(TEX, 'tablet_screen.png'), emit=0.9, alpha=False),
            rot=(math.radians(90) + tt, 0, tz))
    B.box((tx + 0.0, ty + 0.35, 0.05), (0.9, 0.5, 0.1), B.mat('silver', **B.SILVER), bevel=0.04, rot=(0, 0, tz))


def phone():
    stage(scale=2.75, target=(0, 0, 1.05))
    body = B.mat('phone', color='1B1F1D', metal=0.6, rough=0.25, coat=0.8)
    rot = (math.radians(90 - 10), 0, math.radians(30))
    z = 1.24
    B.box((0, 0, z), (0.95, 0.07, 2.0), body, bevel=0.1, seg=10, rot=(math.radians(-10), 0, math.radians(30)))
    import mathutils
    n = mathutils.Vector((0, -1, 0))
    n.rotate(mathutils.Euler((math.radians(-10), 0, math.radians(30))))
    scr = B.plane((0, 0, z), (0.86, 1.86), B.image_mat('pscreen', os.path.join(TEX, 'phone_trace.png'), emit=0.85,
                                                       alpha=False), rot=rot)
    scr.location = mathutils.Vector((0, 0, z)) + n * 0.037
    # round pedestal (fits inside the frame): silver base, lime seam, frosted glass top
    B.cyl((0, 0, 0.07), 0.8, 0.14, B.mat('silver', **B.SILVER), bevel=0.04)
    B.torus((0, 0, 0.145), 0.775, 0.014, B.emission('pedge', LIME, 7))
    B.cyl((0, 0, 0.19), 0.74, 0.08, B.mat('glass', **B.GLASS), bevel=0.03)
    B.torus((0, 0, 0.235), 0.42, 0.008, B.emission('pring', LIME, 4))


SCENES = dict(core=core, research=research, training=training, trace=trace, iot=iot, digital=digital, ai=ai,
              laptop=laptop, phone=phone)
SIZE = dict(laptop=(1600, 1200), phone=(1000, 1300))
PLATFORM_SIZE = (1400, 1300)

if __name__ == '__main__':
    name = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'assets', 'images', 'build', 'stp3d')
    samples = int(sys.argv[3]) if len(sys.argv) > 3 else 96
    os.makedirs(out, exist_ok=True)
    names = list(SCENES) if name == 'all' else name.split(',')
    for n in names:
        SCENES[n]()
        w, h = SIZE.get(n, PLATFORM_SIZE)
        B.render(os.path.join(out, f'{n}.png'), w, h, samples)
        print('rendered', n)
