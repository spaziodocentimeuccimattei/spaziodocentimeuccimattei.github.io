from kit import *

N, LIGHT, GOLD, CORAL, TEAL, PALE = '#123c57', '#e3edf3', '#f2b134', '#e46f5a', '#2e8b9a', '#c9dbe6'
b = []
# Profilo della città sullo sfondo.
for x, w, h in [(30, 70, 150), (110, 50, 210), (170, 80, 120), (620, 60, 180), (690, 90, 140), (790, 50, 230), (850, 70, 160), (930, 60, 200), (1000, 60, 130)]:
    b.append(f'<rect x="{x}" y="{360-h}" width="{w}" height="{h}" rx="4" fill="{PALE}"/>')
    b.append(''.join(f'<rect x="{x+10+c*16}" y="{370-h+r*24}" width="8" height="12" rx="2" fill="#e8f0f5"/>' for r in range(int(h/24)-1) for c in range(int((w-14)/16))))
b.append(f'<rect x="0" y="360" width="1080" height="140" fill="#d3e2eb"/>')
# La bottega con tenda a righe e vetrina.
bx, by, bw, bh = 300, 170, 300, 190
b.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="6" fill="#fff"/>')
b.append(f'<rect x="{bx-6}" y="{by-34}" width="{bw+12}" height="34" rx="6" fill="{N}"/>')
b.append(f'<rect x="{bx+60}" y="{by-26}" width="180" height="18" rx="9" fill="{GOLD}"/>')
stripes = ''.join(f'<path d="M{bx+i*30} {by}h30v34q-15 14-30 0Z" fill="{GOLD if i % 2 == 0 else "#fff6dc"}"/>' for i in range(10))
b.append(stripes)
b.append(f'<rect x="{bx+24}" y="{by+56}" width="150" height="110" rx="6" fill="#d9ecf3"/>')
b.append(f'<rect x="{bx+40}" y="{by+120}" width="34" height="30" rx="4" fill="{CORAL}"/><rect x="{bx+82}" y="{by+104}" width="30" height="46" rx="4" fill="{TEAL}"/><rect x="{bx+120}" y="{by+128}" width="40" height="22" rx="4" fill="{GOLD}"/>')
b.append(f'<path d="M{bx+24} {by+150}h150" stroke="{N}" stroke-width="4"/>')
b.append(f'<rect x="{bx+196}" y="{by+56}" width="80" height="134" rx="6" fill="{N}"/><circle cx="{bx+262}" cy="{by+126}" r="5" fill="{GOLD}"/>')
b.append(f'<rect x="{bx+200}" y="{by+66}" width="72" height="26" rx="4" fill="#fff"/><path d="M{bx+210} {by+79}h52" stroke="{CORAL}" stroke-width="5" stroke-linecap="round"/>')
# Grafico a barre con freccia in crescita.
gx, gy = 700, 330
for i, h in enumerate([50, 80, 70, 120, 160]):
    b.append(f'<rect x="{gx+i*44}" y="{gy-h}" width="30" height="{h}" rx="5" fill="{[TEAL, '#7fb9c4', CORAL, N, GOLD][i]}"/>')
b.append(f'<path d="M{gx-6} {gy-60}L{gx+80} {gy-110}L{gx+120} {gy-95}L{gx+214} {gy-190}" stroke="{CORAL}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
         f'<path d="M{gx+196} {gy-196}l26-6-6 26Z" fill="{CORAL}"/>')
b.append(f'<path d="M{gx-12} {gy}h228" stroke="{N}" stroke-width="4" stroke-linecap="round"/>')
# Monete ed euro.
def coins(x, y, n):
    return ''.join(f'<ellipse cx="{x}" cy="{y-i*9}" rx="22" ry="8" fill="{GOLD}" stroke="#c98c14" stroke-width="2"/>' for i in range(n))
b.append(coins(640, 352, 4) + coins(1000, 356, 6))
b.append(f'<circle cx="120" cy="96" r="30" fill="{GOLD}"/><path d="M132 82a17 17 0 1 0 0 28M104 92h22M104 101h22" stroke="{N}" stroke-width="5" fill="none" stroke-linecap="round"/>')
# Documento firmato: regole e accordi.
b.append(f'<g transform="rotate(-8 980 120)"><rect x="945" y="70" width="70" height="92" rx="6" fill="#fff" stroke="{PALE}" stroke-width="3"/>'
         f'<path d="M957 90h46M957 104h40M957 118h46" stroke="{PALE}" stroke-width="5" stroke-linecap="round"/><path d="M957 142q10-14 18 0t18-2" stroke="{TEAL}" stroke-width="3" fill="none"/></g>')
# Persone: una presenta l'idea, due si stringono la mano davanti alla bottega.
lap = f'<rect x="150" y="300" width="64" height="40" rx="5" fill="{N}"/><circle cx="182" cy="320" r="11" fill="{GOLD}"/><path d="M182 320V309A11 11 0 0 1 193 320Z" fill="{CORAL}"/><path d="M144 340h76" stroke="{N}" stroke-width="5" stroke-linecap="round"/>'
b.append(f'<rect x="120" y="340" width="130" height="10" rx="4" fill="#9db5c4"/><path d="M135 350v80M235 350v80" stroke="#9db5c4" stroke-width="6"/>')
b.append(lap)
b.append(person(100, 440, SKIN[4], 'bun', '#3b2a20', CORAL, '#2f4858', arms=('down', 'out'), s=.92))
b.append(person(430, 452, SKIN[2], 'short', '#1d1715', TEAL, N, arms=('down', 'out'), s=.95))
b.append(person(505, 452, SKIN[0], 'long', '#b26b2e', GOLD, '#46607a', arms=('out', 'down'), s=.95))
b.append(f'<circle cx="467" cy="340" r="9" fill="{SKIN[1]}"/>')
# Megafono: comunicare l'offerta.
b.append(f'<g transform="rotate(-18 250 120)"><path d="M230 104l56-22v76l-56-22Z" fill="{CORAL}"/><rect x="212" y="104" width="22" height="32" rx="5" fill="{N}"/><path d="M300 100q14 20 0 40M312 90q22 30 0 60" stroke="{TEAL}" stroke-width="4" fill="none" stroke-linecap="round"/></g>')
b.append(plant(1040, 470, CORAL, '#4f8f7a', 1.0))
print(svg('Illustrazione AFM: una bottega con vetrina, grafici in crescita, monete e un accordo firmato; due persone si stringono la mano e una prepara il piano al computer.', ''.join(b), LIGHT))
