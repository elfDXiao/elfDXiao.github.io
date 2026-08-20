# -*- coding: utf-8 -*-
"""生成 360° 等距柱状投影（equirectangular）示例全景图（2048x1024 JPEG）。
正式实拍全景图就位后，这些占位图可删除；图片文件名为英文小写，方便引用。
用法：python _make_placeholders.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 2048, 1024  # 等距柱状投影 2:1
OUT = os.path.dirname(os.path.abspath(__file__))

def font(size, bold=False):
    for p in [r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc",
              r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"]:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def make_pano(fname, hue, label, sub):
    """hue 为墙面主色相；绘制抽象浴室空间：顶棚/墙/地 + 浴缸 + 窗 + 文字。"""
    img = Image.new("RGB", (W, H))
    px = img.load()
    sky = (248, 246, 240)
    wall = tuple(int(255 * 0.97) if False else c for c in ())  # placeholder
    wall_c = (int(240 - hue * 0.02), int(238 - hue * 0.03), int(232 - hue * 0.04))
    # 用 HSV 简单生成墙面色
    import colorsys
    base = colorsys.hsv_to_rgb(hue / 360.0, 0.22, 0.92)
    base = tuple(int(c * 255) for c in base)
    ceil_c = tuple(min(255, c + 26) for c in base)
    floor_c = (122, 106, 90)
    # 垂直渐变：0~0.32 顶棚，0.32~0.52 墙，0.52~1.0 地面
    for y in range(H):
        t = y / H
        if t < 0.32:
            t2 = t / 0.32
            c = lerp(sky, ceil_c, t2)
        elif t < 0.52:
            t2 = (t - 0.32) / 0.20
            c = lerp(ceil_c, base, t2)
        else:
            t2 = (t - 0.52) / 0.48
            c = lerp(base, floor_c, t2)
        for x in range(0, W, 4):
            for k in range(4):
                px[x + k, y] = c
    d = ImageDraw.Draw(img)
    # 墙面横向分缝线（辅助立体感）
    for yy in (330, 390, 450):
        d.line([(0, yy), (W, yy)], fill=tuple(min(255, c + 12) for c in base), width=2)
    # 浴缸：地面上的椭圆
    d.ellipse([W * 0.22, 780, W * 0.78, 980], outline=(250, 248, 242), width=10)
    d.ellipse([W * 0.30, 805, W * 0.70, 958], fill=(244, 240, 230), outline=(232, 226, 214), width=4)
    # 浴缸出水/龙头
    d.rounded_rectangle([W * 0.66, 600, W * 0.72, 800], radius=8, fill=(232, 226, 214))
    # 窗户（墙面上）
    d.rectangle([W * 0.14, 190, W * 0.34, 420], fill=(225, 236, 240), outline=(255, 255, 255), width=8)
    d.line([(W * 0.24, 190), (W * 0.24, 420)], fill=(255, 255, 255), width=6)
    d.line([(W * 0.14, 305), (W * 0.34, 305)], fill=(255, 255, 255), width=6)
    # 地面网格（透视感）
    for x in range(0, W, W // 8):
        d.line([(x, 620), (x + 220, 1000)], fill=(100, 86, 72), width=2)
    # 大文字
    f_big = font(130, bold=True)
    f_small = font(52)
    f_tiny = font(34)
    d.text((W * 0.04, 40), label, font=f_big, fill=(60, 58, 54))
    d.text((W * 0.04, 190), sub, font=f_small, fill=(90, 88, 84))
    d.text((W * 0.04, 640), "360° 全景示例图（正式实拍图将替换）", font=f_tiny, fill=(250, 248, 242))
    d.text((W * 0.04, 700), "拖动鼠标旋转视角 · 滚轮缩放", font=f_tiny, fill=(250, 248, 242))
    img.save(os.path.join(OUT, fname), quality=88)
    print("saved", fname, os.path.getsize(os.path.join(OUT, fname)), "bytes")

if __name__ == "__main__":
    make_pano("placeholder-01.jpg", 155, "浴室 360° 全景", "整体浴室实拍 · 示例 A")
    make_pano("placeholder-02.jpg", 25, "浴室 360° 全景", "整体浴室实拍 · 示例 B")
    make_pano("placeholder-03.jpg", 205, "浴室 360° 全景", "整体浴室实拍 · 示例 C")
