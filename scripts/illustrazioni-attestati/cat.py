from kit import *

T, LIGHT, GRID, SAND, TERRA, DEEP, SUN, HELMET = '#006b63', '#daf2e9', '#bfe3d6', '#e8d8b5', '#c9714a', '#0b3f3a', '#f6c95c', '#f2b134'
b = []
# Carta tecnica quadrettata.
b.append(''.join(f'<path d="M{x} 0V500" stroke="{GRID}" stroke-width="1.5"/>' for x in range(0, 1081, 30)))
b.append(''.join(f'<path d="M0 {y}H1080" stroke="{GRID}" stroke-width="1.5"/>' for y in range(0, 501, 30)))
b.append(sun(980, 80, 34, SUN, '#f2e6b5'))
b.append(f'<path d="M0 372Q540 352 1080 372V500H0Z" fill="#b9dccb"/>')
# Edificio in costruzione: struttura, solai e una parte già chiusa.
ex, ey = 430, 372
b.append(f'<rect x="{ex}" y="{ey-200}" width="230" height="200" fill="none" stroke="{T}" stroke-width="3" stroke-dasharray="8 7"/>')
b.append(f'<rect x="{ex}" y="{ey-100}" width="230" height="100" fill="#fff"/><rect x="{ex}" y="{ey-100}" width="230" height="10" fill="{T}"/>')
b.append(''.join(f'<rect x="{ex+22+i*72}" y="{ey-74}" width="40" height="44" rx="3" fill="#a9d8e6"/>' for i in range(3)))
b.append(f'<rect x="{ex+94}" y="{ey-48}" width="40" height="48" fill="{TERRA}"/>' if False else f'<rect x="{ex+166}" y="{ey-30}" width="40" height="30" fill="{TERRA}"/>')
b.append(f'<path d="M{ex} {ey-200}V{ey-100}M{ex+115} {ey-200}V{ey-100}M{ex+230} {ey-200}V{ey-100}" stroke="{DEEP}" stroke-width="8"/>'
         f'<rect x="{ex-6}" y="{ey-204}" width="242" height="10" fill="{DEEP}"/><path d="M{ex-14} {ey-204}L{ex+115} {ey-262}L{ex+244} {ey-204}" stroke="{T}" stroke-width="3" stroke-dasharray="8 7" fill="none"/>')
# Quote: misurare e rappresentare.
b.append(f'<path d="M{ex} {ey+18}H{ex+230}M{ex} {ey+10}v16M{ex+230} {ey+10}v16" stroke="{DEEP}" stroke-width="2.5"/>'
         f'<path d="M{ex+8} {ey+12}l-8 6 8 6M{ex+222} {ey+12}l8 6-8 6" stroke="{DEEP}" stroke-width="2.5" fill="none"/>'
         f'<rect x="{ex+92}" y="{ey+8}" width="46" height="20" rx="4" fill="{LIGHT}"/><path d="M{ex+100} {ey+18}h30" stroke="{DEEP}" stroke-width="3"/>')
b.append(f'<path d="M{ex+258} {ey}V{ey-200}M{ex+250} {ey}h16M{ex+250} {ey-200}h16" stroke="{DEEP}" stroke-width="2.5"/>')
# Gru.
gx = 760
b.append(f'<path d="M{gx} 372V70" stroke="{HELMET}" stroke-width="12"/><path d="M{gx-6} 80L{gx+6} 92M{gx-6} 120L{gx+6} 132M{gx-6} 160L{gx+6} 172M{gx-6} 200L{gx+6} 212M{gx-6} 240L{gx+6} 252M{gx-6} 280L{gx+6} 292" stroke="#c98c14" stroke-width="3"/>')
b.append(f'<path d="M{gx-170} 76H{gx+80}" stroke="{HELMET}" stroke-width="12"/><rect x="{gx+50}" y="82" width="34" height="26" fill="{DEEP}"/><path d="M{gx} 40L{gx-170} 72M{gx} 40L{gx+80} 72M{gx} 40V72" stroke="{DEEP}" stroke-width="3"/>')
b.append(f'<path d="M{gx-120} 82V150" stroke="{DEEP}" stroke-width="2.5"/><rect x="{gx-150}" y="150" width="60" height="16" rx="3" fill="{TERRA}"/>')
# Stazione topografica sul treppiede con il topografo.
tx = 230
b.append(f'<path d="M{tx} 300L{tx-26} 372M{tx} 300L{tx+26} 372M{tx} 300V372" stroke="{DEEP}" stroke-width="5" stroke-linecap="round"/>'
         f'<rect x="{tx-16}" y="272" width="32" height="28" rx="5" fill="{HELMET}"/><rect x="{tx+14}" y="280" width="18" height="10" rx="3" fill="{DEEP}"/>')
b.append(f'<path d="M{tx+32} 285L{ex-6} 220" stroke="{TERRA}" stroke-width="2" stroke-dasharray="6 8"/>')
helmet = lambda x, y: f'<path d="M{x-18} {y-170}a18 16 0 0 1 36 0Z" fill="{HELMET}"/><rect x="{x-21}" y="{y-172}" width="42" height="5" rx="2" fill="#c98c14"/>'
b.append(person(170, 440, SKIN[2], 'short', '#1d1715', T, '#2f4858', arms=('down', 'out'), s=.9, extra=helmet(170, 440)))
plan = f'<rect x="306" y="350" width="40" height="30" rx="3" fill="#fff" stroke="{T}" stroke-width="2"/><path d="M312 372l10-10 8 6 10-12" stroke="{TERRA}" stroke-width="2.5" fill="none"/>'
b.append(person(330, 452, SKIN[0], 'long', '#8a4b2a', TERRA, '#36405a', arms=('hold', 'down'), s=.9, extra=helmet(330, 452) + plan))
# Ambiente: alberi.
def tree(x, y, s=1):
    return (f'<g transform="translate({x} {y}) scale({s})"><rect x="-5" y="-50" width="10" height="50" rx="3" fill="#7a5a3a"/>'
            f'<circle cx="0" cy="-70" r="34" fill="#4f9a74"/><circle cx="-20" cy="-56" r="20" fill="#5fae84"/></g>')
b.append(tree(70, 372, 1.0) + tree(1010, 372, 1.1) + tree(890, 380, .8))
# Archeodesign: colonna, capitello e anfora.
b.append(f'<rect x="830" y="400" width="36" height="74" rx="3" fill="{SAND}"/><path d="M838 400v74M848 400v74M858 400v74" stroke="#d4c095" stroke-width="2"/>'
         f'<rect x="822" y="392" width="52" height="12" rx="3" fill="#d9c79c"/>'
         f'<path d="M906 474q-22-24-8-52 4-8-2-14h28q-6 6-2 14 14 28-8 52Z" fill="{TERRA}"/><path d="M904 418q-14 2-10 16M926 418q14 2 10 16" stroke="{TERRA}" stroke-width="4" fill="none"/>'
         f'<path d="M940 476l30-8 10 8Z" fill="#d9c79c"/>')
print(svg('Illustrazione CAT: un edificio in costruzione con le quote, una gru, il rilievo con la stazione topografica, alberi e reperti archeologici.', ''.join(b), LIGHT))
