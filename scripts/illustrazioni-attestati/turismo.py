from kit import *

G, DEEP, SKY, SEA, SEA2, SAND, TERRA, SUN = '#006733', '#0b4a2e', '#e3f4ea', '#7fc8b8', '#5aae9e', '#f1ddb0', '#d9774b', '#f6c95c'
b = []
b.append(sun(860, 110, 46, SUN, '#f7e7b0'))
b.append('<path d="M120 90q14-10 28 0 14-10 28 0" stroke="#7aa592" stroke-width="3" fill="none" stroke-linecap="round"/>'
         '<path d="M700 70q10-7 20 0 10-7 20 0" stroke="#7aa592" stroke-width="3" fill="none" stroke-linecap="round"/>')
# Mare all'orizzonte e barca a vela.
b.append(f'<rect x="0" y="230" width="1080" height="90" fill="{SEA}"/>')
b.append('<path d="M0 252h1080M0 276h1080M0 300h1080" stroke="#a9dccf" stroke-width="3" stroke-dasharray="40 26"/>')
b.append(f'<path d="M940 222L940 160L978 216Z" fill="#fff"/><path d="M934 160L934 222L906 218Z" fill="#fde9c4"/><path d="M896 224h96l-12 14h-72Z" fill="{TERRA}"/>')
# Colline con nuraghe.
b.append(f'<path d="M0 250Q120 150 260 190T470 240Q520 262 560 300V330H0Z" fill="#9cc79a"/><path d="M0 280Q160 220 330 250T600 300V340H0Z" fill="#7cb382"/>')
nx, ny = 170, 185
b.append(f'<path d="M{nx-46} {ny+40}L{nx-30} {ny-40}H{nx+30}L{nx+46} {ny+40}Z" fill="#c8b48e"/>'
         f'<path d="M{nx-34} {ny-40}h68v-8h-68Z" fill="#b29d77"/><path d="M{nx-10} {ny+40}v-22a10 10 0 0 1 20 0v22Z" fill="#6f5f47"/>'
         + ''.join(f'<path d="M{nx-44+i*1.8} {ny+30-i*14}H{nx+44-i*1.8}" stroke="#a8946f" stroke-width="2"/>' for i in range(5)))
# Laguna con fenicotteri.
b.append(f'<path d="M520 320Q700 286 880 312T1080 316V380H520Z" fill="{SEA2}"/>')
def flamingo(x, y, s=1, f=1):
    return (f'<g transform="translate({x} {y}) scale({s*f} {s})"><path d="M0 0v34M8 0l4 34" stroke="#e07d97" stroke-width="3"/>'
            f'<ellipse cx="4" cy="-10" rx="22" ry="13" fill="#f39cb2"/><path d="M18 -16Q30 -40 22 -60Q16 -72 28 -74" stroke="#f39cb2" stroke-width="6" fill="none" stroke-linecap="round"/>'
            f'<path d="M28 -74l10 4-6 6Z" fill="#2d3142"/></g>')
b.append(flamingo(800, 300, 1.0) + flamingo(870, 306, .85) + flamingo(980, 298, .95, -1))
# Spiaggia e sentiero tratteggiato fino al segnaposto.
b.append(f'<path d="M0 340Q300 318 560 336T1080 344V500H0Z" fill="{SAND}"/>')
b.append(f'<path d="M80 470Q260 380 470 410T720 360" stroke="#c9a46a" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round" fill="none"/>')
b.append(f'<path d="M720 300a24 24 0 0 1 24 24c0 18-24 40-24 40s-24-22-24-40a24 24 0 0 1 24-24Z" fill="{TERRA}"/><circle cx="720" cy="324" r="9" fill="#fff"/>')
# La guida con la bandierina e due visitatori, una con la macchina fotografica.
flag = f'<path d="M334 270V206" stroke="{DEEP}" stroke-width="4" stroke-linecap="round"/><path d="M334 206l36 10-36 11Z" fill="{TERRA}"/>'
b.append(person(300, 440, SKIN[1], 'long', '#3a2418', G, '#2f4858', arms=('down', 'up'), s=.95, extra=flag))
b.append(bubble(176, 232, 98, 44, '#fff', '<circle cx="202" cy="254" r="11" fill="#7fc8b8"/><path d="M191 254h22M202 243c-6 6-6 16 0 22M202 243c6 6 6 16 0 22" stroke="#0b4a2e" stroke-width="2" fill="none"/><path d="M222 248h32M222 260h22" stroke="#7aa592" stroke-width="4" stroke-linecap="round"/>', tail=-1))
cam = f'<rect x="455" y="300" width="26" height="18" rx="4" fill="#2d3142"/><circle cx="468" cy="309" r="6" fill="#9cc7d6"/>'
b.append(person(440, 446, SKIN[0], 'short', '#c58b3a', '#f2a541', '#46607a', arms=('hold', 'out'), s=.9, extra=cam))
b.append(person(560, 450, SKIN[3], 'curly', '#1d1715', '#5aa0c8', '#36405a', arms=('down', 'out'), s=.88))
b.append(f'<rect x="604" y="400" width="44" height="34" rx="6" fill="{G}"/><rect x="618" y="392" width="16" height="10" rx="3" fill="none" stroke="{DEEP}" stroke-width="4"/><path d="M604 416h44" stroke="#9cc79a" stroke-width="3"/>')
b.append(plant(1020, 470, TERRA, '#4f8f5a', 1.0))
print(svg('Illustrazione Turismo: una guida accompagna due visitatori lungo la costa, tra nuraghe, laguna con fenicotteri e mare.', ''.join(b), SKY))
