from kit import *

M, DEEP, SOFT, BLOB, TEAL, CREAM, WOOD = '#c4084f', '#7a0a3a', '#fce4ee', '#f8cfe0', '#2f7f78', '#fffaf5', '#d9a575'
b = []
# Fondo: stanza luminosa con grande forma morbida e pavimento.
b.append(f'<path d="M0 360Q270 330 540 345T1080 350V500H0Z" fill="#f6c6d8"/>')
b.append(f'<circle cx="540" cy="250" r="215" fill="{BLOB}"/>')
b.append(f'<circle cx="540" cy="250" r="160" fill="#fbe0ea"/>')
b.append('<g fill="#e9a3bd" opacity=".55">' + ''.join(f'<circle cx="{x}" cy="{y}" r="3"/>' for x, y in
         [(70, 60), (110, 95), (980, 70), (1030, 110), (60, 300), (1020, 300), (300, 40), (780, 45)]) + '</g>')
# Rete dei servizi: quattro nodi collegati al centro da linee tratteggiate.
nodes = [(150, 150, 'casa'), (175, 318, 'salute'), (930, 150, 'scuola'), (905, 318, 'parco')]
dots = f'stroke="{M}" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" fill="none" opacity=".75"'
for nx in (150, 930):
    b.append(f'<path d="M{nx} 150Q{(nx+540)/2} 80 540 112" {dots}/>')
b.append(f'<path d="M150 150Q150 240 175 318M930 150Q930 240 905 318" {dots}/>')
icons = {
    'casa': lambda x, y: f'<path d="M{x-17} {y+2}L{x} {y-15}L{x+17} {y+2}V{y+17}H{x-17}Z" fill="{M}"/><rect x="{x-5}" y="{y+5}" width="10" height="12" fill="{CREAM}"/>',
    'salute': lambda x, y: f'<path d="M{x-6} {y-17}h12v11h11v12h-11v11h-12v-11h-11v-12h11Z" fill="{M}"/>',
    'scuola': lambda x, y: f'<path d="M{x-19} {y-11}Q{x-9} {y-17} {x} {y-10}Q{x+9} {y-17} {x+19} {y-11}V{y+15}Q{x+9} {y+9} {x} {y+15}Q{x-9} {y+9} {x-19} {y+15}Z" fill="{M}"/><path d="M{x} {y-10}V{y+15}" stroke="{CREAM}" stroke-width="2.5"/>',
    'parco': lambda x, y: f'<circle cx="{x}" cy="{y-6}" r="14" fill="{TEAL}"/><rect x="{x-3}" y="{y+4}" width="6" height="14" rx="2" fill="{DEEP}"/>',
}
for nx, ny, kind in nodes:
    b.append(f'<circle cx="{nx}" cy="{ny}" r="40" fill="#fff" stroke="#f3b4cb" stroke-width="5"/>{icons[kind](nx, ny)}')
# Il cuore al centro della rete: l'aiuto progettato insieme.
b.append(f'<circle cx="540" cy="112" r="38" fill="{M}"/>' + heart(540, 112, 1.25, '#fff'))
# Tavolo, sedie e due persone che si ascoltano.
b.append(chair(420, 300, '#b45b7d', facing=1))
b.append(chair(660, 300, '#b45b7d', facing=-1))
b.append(f'<ellipse cx="540" cy="296" rx="92" ry="17" fill="{WOOD}"/><rect x="535" y="300" width="10" height="62" rx="4" fill="#b98657"/><ellipse cx="540" cy="364" rx="40" ry="6" fill="#e3a8bf"/>')
b.append(f'<rect x="500" y="281" width="34" height="9" rx="3" fill="#fff"/><circle cx="572" cy="282" r="9" fill="{TEAL}"/><rect x="566" y="270" width="12" height="9" rx="3" fill="#8fc7bf"/>')
clip = f'<rect x="452" y="226" width="26" height="33" rx="4" fill="#fff" stroke="{DEEP}" stroke-width="2"/><path d="M458 237h14M458 245h10M458 252h12" stroke="{M}" stroke-width="2.5" stroke-linecap="round"/>'
b.append(seated(420, 300, SKIN[2], 'curly', '#2b1d1a', TEAL, '#24485a', facing=1, arms=('down', 'hold'), extra=clip))
b.append(seated(660, 300, SKIN[0], 'bun', '#a9a19c', M, '#5b3b55', facing=-1, arms=('down', 'out')))
# Fumetti: chi parla racconta, chi ascolta prende nota.
b.append(bubble(640, 120, 92, 46, '#fff', heart(686, 143, .8, M), tail=-1))
b.append(bubble(352, 124, 84, 42, '#fff', ''.join(f'<circle cx="{376+i*18}" cy="145" r="5" fill="{TEAL}"/>' for i in range(3)), tail=1))
# Una terza persona arriva con un'idea: il lavoro di rete.
b.append(person(800, 402, SKIN[3], 'short', '#1d1715', '#f2a541', '#2f4858', arms=('down', 'up'), s=.92))
b.append(f'<circle cx="831" cy="226" r="13" fill="#ffe28a"/><path d="M826 241h10v6h-10Z" fill="#c9a24a"/>')
b.append(person(285, 402, SKIN[4], 'long', '#6b3b2a', '#7d5ba6', '#36405a', arms=('out', 'down'), s=.88))
b.append(plant(70, 420, '#c86a4f', '#5c9a7f', 1.2))
b.append(plant(1010, 425, '#c86a4f', '#5c9a7f', 1.05))
print(svg('Illustrazione SSAS: due persone si ascoltano al tavolo, al centro di una rete di servizi per casa, salute, scuola e territorio.', ''.join(b), SOFT))
