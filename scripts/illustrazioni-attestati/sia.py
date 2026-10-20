from kit import *

G, LIGHT, INKD, PURPLE, LIME, MINT, ORANGE = '#477b00', '#edf8d9', '#24243e', '#5931a8', '#c9f981', '#d3ecb4', '#f08a3c'
b = []
# Rete di nodi sullo sfondo.
pts = [(80, 80), (200, 50), (300, 120), (760, 60), (880, 110), (1000, 60), (960, 200), (60, 220)]
for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
    if abs(x1 - x2) < 400:
        b.append(f'<path d="M{x1} {y1}L{x2} {y2}" stroke="#bcd99a" stroke-width="3"/>')
b.append(''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="#fff" stroke="#9cc56a" stroke-width="4"/>' for x, y in pts))
b.append(f'<path d="M0 380Q540 350 1080 380V500H0Z" fill="{MINT}"/>')
# Lo schermo con il programma.
sx, sy, sw, sh = 360, 90, 360, 230
b.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" rx="16" fill="{INKD}"/><rect x="{sx+14}" y="{sy+14}" width="{sw-28}" height="{sh-46}" rx="8" fill="#33335a"/>')
b.append(f'<path d="M{sx+150} {sy+sh}l-12 46h84l-12-46Z" fill="#3b3b63"/><rect x="{sx+120}" y="{sy+sh+42}" width="120" height="12" rx="6" fill="{INKD}"/>')
b.append(''.join(f'<circle cx="{sx+30+i*16}" cy="{sy+30}" r="5" fill="{c}"/>' for i, c in enumerate([ORANGE, '#f6c95c', LIME])))
code = [(0, 120, LIME), (1, 80, '#9f87e0'), (1, 150, '#fff'), (2, 110, ORANGE), (1, 60, '#9f87e0'), (0, 90, LIME)]
for i, (ind, w, c) in enumerate(code):
    b.append(f'<rect x="{sx+34+ind*22}" y="{sy+54+i*22}" width="{w}" height="10" rx="5" fill="{c}"/>')
b.append(f'<path d="M{sx+250} {sy+90}l-24 26 24 26M{sx+290} {sy+90}l24 26-24 26M{sx+278} {sy+84}l-16 64" stroke="{LIME}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
# Archivio dati: tre cilindri.
def cyl(x, y, c):
    return (f'<path d="M{x-40} {y}v34a40 12 0 0 0 80 0v-34" fill="{c}"/><ellipse cx="{x}" cy="{y}" rx="40" ry="12" fill="#e6f5d0"/>'
            f'<ellipse cx="{x}" cy="{y}" rx="40" ry="12" fill="none" stroke="{c}" stroke-width="3"/>')
b.append(cyl(240, 300, G) + cyl(240, 262, '#5d9a14') + cyl(240, 224, '#77b52a'))
b.append(f'<path d="M282 250Q320 220 356 210" stroke="{G}" stroke-width="4" stroke-dasharray="4 8" fill="none" stroke-linecap="round"/>')
# Lo smartphone con l'app.
px, py = 800, 150
b.append(f'<rect x="{px}" y="{py}" width="120" height="210" rx="20" fill="{INKD}"/><rect x="{px+10}" y="{py+18}" width="100" height="170" rx="10" fill="#fff"/>')
b.append(f'<rect x="{px+20}" y="{py+30}" width="80" height="34" rx="8" fill="{LIME}"/><rect x="{px+20}" y="{py+74}" width="80" height="22" rx="6" fill="{MINT}"/><rect x="{px+20}" y="{py+104}" width="56" height="22" rx="6" fill="{MINT}"/>')
b.append(f'<rect x="{px+20}" y="{py+142}" width="80" height="30" rx="15" fill="{PURPLE}"/><path d="M{px+50} {py+157}h20" stroke="#fff" stroke-width="5" stroke-linecap="round"/>')
b.append(f'<path d="M722 220Q760 200 796 210" stroke="{G}" stroke-width="4" stroke-dasharray="4 8" fill="none" stroke-linecap="round"/>')
# Nuvola e lucchetto: servizi in rete e permessi.
b.append(f'<path d="M560 70a26 26 0 0 1 50-8 20 20 0 0 1 14 38h-84a18 18 0 0 1 20-30Z" fill="#fff" transform="translate(0 -24)"/>'
         f'<path d="M585 66v-20m-9 9 9-9 9 9" stroke="{G}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
b.append(f'<circle cx="960" cy="290" r="34" fill="{PURPLE}"/><rect x="946" y="286" width="28" height="22" rx="4" fill="#fff"/><path d="M951 286v-8a9 9 0 0 1 18 0v8" stroke="#fff" stroke-width="4" fill="none"/>')
# Persone: una spiega al monitor, una lavora seduta al portatile.
b.append(person(300, 455, SKIN[1], 'curly', '#1d1715', PURPLE, INKD, arms=('down', 'up'), s=.92))
lap = f'<rect x="692" y="398" width="66" height="8" rx="3" fill="{INKD}"/><path d="M700 398l8-36h52l-8 36Z" fill="#3b3b63"/><circle cx="730" cy="380" r="5" fill="{LIME}"/>'
b.append(f'<rect x="650" y="406" width="140" height="10" rx="4" fill="#8fb85e"/><path d="M665 416v60M775 416v60" stroke="#8fb85e" stroke-width="6"/>')
b.append(chair(610, 410, '#6f9a3d', facing=1))
b.append(seated(610, 410, SKIN[0], 'long', '#d9a441', ORANGE, '#36405a', facing=1, arms=('down', 'out'), s=.95))
b.append(lap)
b.append(plant(1030, 470, ORANGE, '#4f8f3a', 1.0))
b.append(plant(60, 470, ORANGE, '#4f8f3a', .9))
print(svg('Illustrazione SIA: un programma sullo schermo, un archivio di dati, un\'app sullo smartphone, il cloud e un lucchetto per i permessi; due persone lavorano insieme.', ''.join(b), LIGHT))
