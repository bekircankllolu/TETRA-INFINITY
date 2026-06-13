#!/usr/bin/env python3
"""Basit retro SFX'leri sentezler (saf stdlib). Çıktı: assets/game/sfx/*.wav

Bunlar yer tutucu seslerdir; istenirse gerçek ses dosyalarıyla değiştirilebilir.
"""
import math
import os
import struct
import wave

RATE = 22050
OUT = 'assets/game/sfx'


def env(i, n, attack=0.01, release=0.3):
    """Basit attack/release zarfı (0..1)."""
    t = i / n
    a = min(1.0, t / attack) if attack > 0 else 1.0
    r = min(1.0, (1 - t) / release) if release > 0 else 1.0
    return a * r


def tone(freq, dur, vol=0.5, wave_type='sine', attack=0.01, release=0.3, sweep=0.0):
    n = int(RATE * dur)
    out = []
    for i in range(n):
        t = i / RATE
        f = freq * (1 + sweep * (i / n))
        ph = 2 * math.pi * f * t
        if wave_type == 'square':
            s = 1.0 if math.sin(ph) >= 0 else -1.0
        elif wave_type == 'saw':
            s = 2 * ((f * t) % 1.0) - 1.0
        elif wave_type == 'tri':
            s = 2 * abs(2 * ((f * t) % 1.0) - 1) - 1
        else:
            s = math.sin(ph)
        out.append(s * vol * env(i, n, attack, release))
    return out


def mix(*layers):
    n = max(len(l) for l in layers)
    out = [0.0] * n
    for l in layers:
        for i, v in enumerate(l):
            out[i] += v
    # Kırpma koruması
    peak = max((abs(v) for v in out), default=1.0)
    if peak > 1.0:
        out = [v / peak for v in out]
    return out


def seq(*segments):
    out = []
    for s in segments:
        out.extend(s)
    return out


def save(name, samples):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name + '.wav')
    with wave.open(path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        frames = b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 32000)) for s in samples)
        w.writeframes(frames)
    print(f'{name}.wav  ({len(samples)/RATE:.2f}s)')


def build():
    save('move', tone(330, 0.05, 0.35, 'square', release=0.6))
    save('rotate', tone(520, 0.06, 0.35, 'square', release=0.6))
    save('softdrop', tone(220, 0.04, 0.25, 'tri', release=0.7))
    save('hold', tone(440, 0.10, 0.35, 'tri', sweep=0.3))
    save('harddrop', tone(180, 0.14, 0.5, 'saw', sweep=-0.5, release=0.5))
    save('lock', mix(tone(160, 0.10, 0.45, 'square', sweep=-0.3),
                     tone(80, 0.10, 0.3, 'sine')))
    # Satır temizleme: yukarı süpürme
    save('clear', tone(440, 0.28, 0.45, 'square', sweep=0.8, release=0.4))
    # Tetris: çift katmanlı parlak akor süpürmesi
    save('tetris', mix(tone(523, 0.45, 0.4, 'square', sweep=0.5, release=0.5),
                       tone(659, 0.45, 0.3, 'square', sweep=0.5, release=0.5),
                       tone(784, 0.45, 0.25, 'tri', sweep=0.6, release=0.5)))
    # T-spin: gizemli iki nota
    save('tspin', seq(tone(392, 0.12, 0.4, 'tri'), tone(587, 0.18, 0.4, 'tri', sweep=0.2)))
    # Level up: yükselen arpej
    save('levelup', seq(tone(523, 0.09, 0.4, 'square'),
                        tone(659, 0.09, 0.4, 'square'),
                        tone(784, 0.09, 0.4, 'square'),
                        tone(1047, 0.16, 0.4, 'square', release=0.5)))
    # Game over: alçalan
    save('gameover', seq(tone(440, 0.18, 0.4, 'saw'),
                         tone(349, 0.18, 0.4, 'saw'),
                         tone(262, 0.35, 0.45, 'saw', release=0.5)))
    save('click', tone(660, 0.04, 0.3, 'square', release=0.5))
    save('start', seq(tone(392, 0.10, 0.4, 'square'), tone(659, 0.18, 0.4, 'square', sweep=0.2)))


if __name__ == '__main__':
    build()
    print('SFX hazır.')
