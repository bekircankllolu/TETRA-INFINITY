#!/usr/bin/env python3
"""Prosedürel blok skinleri üretir: assets/game/skins/<skin>/<color>.png (96x96 RGBA)

Skinler:
  neon  — koyu yarı saydam zemin + parlak neon kenar + iç parıltı
  retro — düz dolgu + klasik açık/koyu eğim (NES tarzı)
"""
import os
from PIL import Image, ImageDraw

SIZE = 96
OUT = 'assets/game/skins'

COLORS = {
    'i': (34, 211, 238),
    'o': (255, 201, 61),
    't': (177, 76, 240),
    's': (61, 220, 104),
    'z': (255, 61, 90),
    'j': (61, 123, 255),
    'l': (255, 145, 0),
}


def lighten(c, f):
    return tuple(min(255, int(v + (255 - v) * f)) for v in c)


def darken(c, f):
    return tuple(max(0, int(v * (1 - f))) for v in c)


def neon_tile(color):
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Dış parıltı: genişleyen yarı saydam çerçeveler
    for i in range(8, 0, -1):
        a = int(22 * (9 - i) / 8)
        d.rounded_rectangle([i, i, SIZE - 1 - i, SIZE - 1 - i], radius=14,
                            outline=color + (a,), width=3)
    # İç koyu dolgu (renk tonlu)
    d.rounded_rectangle([10, 10, SIZE - 11, SIZE - 11], radius=10,
                        fill=darken(color, 0.78) + (235,))
    # Parlak neon kenar
    d.rounded_rectangle([10, 10, SIZE - 11, SIZE - 11], radius=10,
                        outline=lighten(color, 0.25) + (255,), width=4)
    # Üstte hafif parlama
    d.rounded_rectangle([18, 16, SIZE - 19, SIZE // 2], radius=8,
                        fill=lighten(color, 0.5) + (28,))
    return img


def retro_tile(color):
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    b = 10  # eğim kalınlığı
    light = lighten(color, 0.45)
    dark = darken(color, 0.45)
    # Taban dolgu
    d.rectangle([0, 0, SIZE - 1, SIZE - 1], fill=color + (255,))
    # Açık üst + sol eğim
    d.polygon([(0, 0), (SIZE, 0), (SIZE - b, b), (b, b), (b, SIZE - b), (0, SIZE)], fill=light + (255,))
    # Koyu alt + sağ eğim
    d.polygon([(SIZE, 0), (SIZE, SIZE), (0, SIZE), (b, SIZE - b),
               (SIZE - b, SIZE - b), (SIZE - b, b)], fill=dark + (255,))
    # İç düz alan
    d.rectangle([b, b, SIZE - 1 - b, SIZE - 1 - b], fill=color + (255,))
    return img


def build():
    for skin, fn in (('neon', neon_tile), ('retro', retro_tile)):
        path = os.path.join(OUT, skin)
        os.makedirs(path, exist_ok=True)
        for name, color in COLORS.items():
            fn(color).save(os.path.join(path, f'{name}.png'), optimize=True)
        print(f'{skin}: 7 blok')


if __name__ == '__main__':
    build()
    print('Skinler hazır.')
