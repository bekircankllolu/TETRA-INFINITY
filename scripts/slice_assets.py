#!/usr/bin/env python3
"""asset/ içindeki kompozit AI görsellerini oyun sprite'larına dilimler.

Çıktılar assets/game/ altına yazılır:
  blocks/{i,o,t,s,z,j,l}.png  — tek hücre blok dokuları
  buttons/{left,right,rotate,soft,hard}.png — kontrol butonları
  logo.png — menü logosu (amblem + yazı)
  emblem.png — kare T amblemi (ikon kaynağı)
  bg.jpg — oyun arkaplanı (sıkıştırılmış)
"""
import os
import sys
from PIL import Image

SRC = 'asset'
OUT = 'assets/game'

F_LOGO = 'ChatGPT Image 12 Haz 2026 13_18_51 (1).png'
F_BLOCKS = 'ChatGPT Image 12 Haz 2026 13_18_51 (2).png'
F_BUTTONS = 'ChatGPT Image 12 Haz 2026 13_18_54 (8).png'
F_BG = 'ChatGPT Image 12 Haz 2026 13_18_54 (9).png'


def mask(im, threshold):
    """Parlaklık eşiğini aşan piksellerin ikili maskesi (downscale yok)."""
    g = im.convert('L')
    return g.point(lambda p: 255 if p >= threshold else 0)


def components(im, threshold=60, scale=4, min_area=400):
    """Bağlı bileşenlerin tam çözünürlükteki sınırlayıcı kutuları (union-find)."""
    small = im.convert('L').resize((im.width // scale, im.height // scale))
    w, h = small.size
    px = small.load()
    parent = {}

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for y in range(h):
        for x in range(w):
            if px[x, y] >= threshold:
                idx = y * w + x
                parent.setdefault(idx, idx)
                if x > 0 and (idx - 1) in parent:
                    union(idx - 1, idx)
                if y > 0 and (idx - w) in parent:
                    union(idx - w, idx)
                if y > 0 and x > 0 and (idx - w - 1) in parent:
                    union(idx - w - 1, idx)
                if y > 0 and x < w - 1 and (idx - w + 1) in parent:
                    union(idx - w + 1, idx)

    boxes = {}
    for idx in parent:
        r = find(idx)
        x, y = idx % w, idx // w
        b = boxes.setdefault(r, [x, y, x, y, 0])
        b[0] = min(b[0], x)
        b[1] = min(b[1], y)
        b[2] = max(b[2], x)
        b[3] = max(b[3], y)
        b[4] += 1

    out = []
    for x0, y0, x1, y1, area in boxes.values():
        if area * scale * scale >= min_area:
            out.append((x0 * scale, y0 * scale, (x1 + 1) * scale, (y1 + 1) * scale,
                        area * scale * scale))
    return out


def crop_cell(im, bbox, cols, rows, cell_col, cell_row, inset_frac=0.06, square=False):
    """Parça bbox'undan tek bir hücre keser; kenarlardan içeri büzer.
    square=True: hücre yüksekliği genişlikten türetilir (alt/üst parlama
    bbox'u şişirdiğinde üstten hizalı kare hücre kullan)."""
    x0, y0, x1, y1, _ = bbox
    cw = (x1 - x0) / cols
    ch = cw if square else (y1 - y0) / rows
    cx0 = x0 + cell_col * cw
    cy0 = y0 + cell_row * ch
    inset_x = cw * inset_frac
    inset_y = ch * inset_frac
    return im.crop((int(cx0 + inset_x), int(cy0 + inset_y),
                    int(cx0 + cw - inset_x), int(cy0 + ch - inset_y)))


def slice_blocks():
    im = Image.open(os.path.join(SRC, F_BLOCKS)).convert('RGB')
    comps = components(im, threshold=40, min_area=3000)
    # Küçük parlamaları ele: gerçek parçalar en az ~100px genişlikte
    comps = [c for c in comps if c[2] - c[0] > 100 and c[3] - c[1] > 80]
    comps.sort(key=lambda b: (b[1], b[0]))  # üstten alta, soldan sağa
    if len(comps) != 7:
        print(f'UYARI: blok görselinde 7 değil {len(comps)} bileşen bulundu:')
        for c in comps:
            print('  ', c)
        sys.exit(1)

    # Satır bantlarına ayır (y merkezlerine göre)
    rows = []
    for c in sorted(comps, key=lambda b: (b[1] + b[3]) / 2):
        cy = (c[1] + c[3]) / 2
        placed = False
        for row in rows:
            if abs(cy - row[0]) < im.height * 0.1:
                row[1].append(c)
                placed = True
                break
        if not placed:
            rows.append([cy, [c]])
    for row in rows:
        row[1].sort(key=lambda b: b[0])

    flat = [c for _, items in rows for c in items]
    # Görsel düzeni: O I / T S / Z J / L  — her parçanın (kolon,satır) hücre seçimi
    spec = [
        ('o', 2, 2, 0, 1),  # alt sıra: üst kenara taşan parlamadan kaçın
        ('i', 4, 1, 1, 0),
        ('t', 3, 2, 1, 1),
        ('s', 3, 2, 1, 1),
        ('z', 3, 2, 1, 1),
        ('j', 3, 2, 1, 1),
        ('l', 3, 2, 1, 1),
    ]
    os.makedirs(os.path.join(OUT, 'blocks'), exist_ok=True)
    for (name, cols, rws, cc, cr), bbox in zip(spec, flat):
        cell = crop_cell(im, bbox, cols, rws, cc, cr, square=(name == 'l'))
        cell = cell.resize((96, 96), Image.LANCZOS)
        cell.save(os.path.join(OUT, 'blocks', f'{name}.png'), optimize=True)
        print(f'blocks/{name}.png  <- bbox {bbox[:4]}')


def slice_buttons():
    im = Image.open(os.path.join(SRC, F_BUTTONS)).convert('RGB')
    # Butonlar ince neon çizgili: düşük eşik + bbox boyutuna göre filtre
    comps = components(im, threshold=45, min_area=1000)
    btns = [c for c in comps
            if c[2] - c[0] > 120 and c[3] - c[1] > 120
            and 0.6 < (c[2] - c[0]) / max(1, (c[3] - c[1])) < 1.7]
    # İç içe kutuları ele (buton içindeki ikon ayrı bileşen çıkabiliyor)
    btns = [b for b in btns
            if not any(o is not b and o[0] <= b[0] and o[1] <= b[1]
                       and o[2] >= b[2] and o[3] >= b[3] for o in btns)]
    btns.sort(key=lambda b: (b[1], b[0]))
    if len(btns) != 5:
        print(f'UYARI: buton görselinde 5 değil {len(btns)} buton bulundu:')
        for c in comps:
            print('  ', c, 'oran', (c[2] - c[0]) / max(1, (c[3] - c[1])))
        sys.exit(1)
    names = ['left', 'right', 'rotate', 'soft', 'hard']
    os.makedirs(os.path.join(OUT, 'buttons'), exist_ok=True)
    for name, (x0, y0, x1, y1, _) in zip(names, btns):
        pad = int((x1 - x0) * 0.06)
        crop = im.crop((max(0, x0 - pad), max(0, y0 - pad),
                        min(im.width, x1 + pad), min(im.height, y1 + pad)))
        crop = crop.resize((160, int(160 * crop.height / crop.width)), Image.LANCZOS)
        crop.save(os.path.join(OUT, 'buttons', f'{name}.png'), optimize=True)
        print(f'buttons/{name}.png  <- bbox {(x0, y0, x1, y1)}')


def slice_logo():
    im = Image.open(os.path.join(SRC, F_LOGO)).convert('RGB')
    # Harfler ayrı küçük bileşenler olarak çıkar; düşük alan eşiği gerekli
    comps = components(im, threshold=50, min_area=600)
    comps.sort(key=lambda b: b[0])  # soldan sağa
    if not comps:
        sys.exit('logo bileşeni bulunamadı')
    # Dişli butonu: sağ kenara yakın, kareye yakın, büyük blob — logodan ayır
    gear = max(
        (c for c in comps
         if c[2] - c[0] > 80 and 0.7 < (c[2] - c[0]) / max(1, c[3] - c[1]) < 1.4),
        key=lambda c: c[0],
    )
    rest = [c for c in comps if c is not gear and c[2] <= gear[0]]
    x0 = min(c[0] for c in rest)
    y0 = min(c[1] for c in rest)
    x1 = max(c[2] for c in rest)
    y1 = max(c[3] for c in rest)
    x1 = min(x1, gear[0] - 24)  # dişli parlamasını da dışarıda bırak
    pad = 16
    logo = im.crop((max(0, x0 - pad), max(0, y0 - pad),
                    min(im.width, x1 + pad), min(im.height, y1 + pad)))
    logo.save(os.path.join(OUT, 'logo.png'), optimize=True)
    print(f'logo.png  <- bbox {(x0, y0, x1, y1)} (dişli hariç: {gear[:4]})')

    # Amblem: en soldaki büyük blob — kare ikon kaynağı
    emblem_box = rest[0]
    ex0, ey0, ex1, ey1, _ = emblem_box
    side = max(ex1 - ex0, ey1 - ey0)
    cx, cy = (ex0 + ex1) // 2, (ey0 + ey1) // 2
    half = int(side * 0.62)  # nefes payı (yazıya taşmadan)
    sq = im.crop((cx - half, cy - half, cx + half, cy + half))
    sq = sq.resize((1024, 1024), Image.LANCZOS)
    sq.save(os.path.join(OUT, 'emblem.png'), optimize=True)
    print(f'emblem.png  <- merkez {(cx, cy)}')


def compress_bg():
    im = Image.open(os.path.join(SRC, F_BG)).convert('RGB')
    im.save(os.path.join(OUT, 'bg.jpg'), quality=82, optimize=True)
    print(f'bg.jpg  ({im.size[0]}x{im.size[1]})')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    slice_blocks()
    slice_buttons()
    slice_logo()
    compress_bg()
    print('Bitti.')
