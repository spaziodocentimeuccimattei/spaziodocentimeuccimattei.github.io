# Piccolo kit per illustrazioni piatte (1080 x 500), stile coerente con le scene del sito.
W, H = 1080, 500
SKIN = ['#f1c7a5', '#d9a07a', '#a8714f', '#7a4f36', '#e8b48f']
INK = '#2d3142'


def svg(title, body, bg):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="{title}">'
            f'<title>{title}</title><rect width="{W}" height="{H}" fill="{bg}"/>{body}</svg>')


def hair(x, hy, style, color, r=15):
    if style == 'short':
        return f'<path d="M{x-r-1} {hy+2}Q{x-r} {hy-r-4} {x} {hy-r-3}Q{x+r} {hy-r-4} {x+r+1} {hy+2}Q{x+6} {hy-8} {x-r-1} {hy+2}Z" fill="{color}"/>'
    if style == 'long':
        return (f'<path d="M{x-r-2} {hy+30}Q{x-r-6} {hy-r-6} {x} {hy-r-3}Q{x+r+6} {hy-r-6} {x+r+2} {hy+30}L{x+r-4} {hy+4}Q{x} {hy-6} {x-r+4} {hy+4}Z" fill="{color}"/>')
    if style == 'bun':
        return (f'<circle cx="{x}" cy="{hy-r-4}" r="7" fill="{color}"/>'
                f'<path d="M{x-r-1} {hy+3}Q{x-r} {hy-r-3} {x} {hy-r-2}Q{x+r} {hy-r-3} {x+r+1} {hy+3}Q{x} {hy-9} {x-r-1} {hy+3}Z" fill="{color}"/>')
    if style == 'curly':
        return ''.join(f'<circle cx="{x+dx}" cy="{hy+dy}" r="7.5" fill="{color}"/>' for dx, dy in
                       [(-13, -2), (-9, -11), (0, -15), (9, -11), (13, -2), (-5, -14), (5, -14)])
    return ''


def person(x, y, skin, hair_style, hair_color, shirt, pants, arms=('down', 'down'), s=1.0, extra=''):
    """Persona in piedi; (x, y) = punto dei piedi. arms: down | up | out | hold."""
    g = []
    g.append(f'<g transform="translate({x} {y}) scale({s}) translate({-x} {-y})">')
    g.append(f'<path d="M{x-8} {y-72}L{x-9} {y-6}M{x+8} {y-72}L{x+9} {y-6}" stroke="{pants}" stroke-width="13" stroke-linecap="round"/>')
    g.append(f'<ellipse cx="{x-11}" cy="{y-2}" rx="9" ry="5" fill="{INK}"/><ellipse cx="{x+11}" cy="{y-2}" rx="9" ry="5" fill="{INK}"/>')
    hands = []
    for side, a in zip((-1, 1), arms):
        sx, sy = x + side * 19, y - 128
        ex, ey = {'down': (x + side * 25, y - 78), 'up': (x + side * 34, y - 176), 'out': (x + side * 52, y - 118),
                  'hold': (x + side * 6, y - 100)}[a]
        mx, my = (sx + ex) / 2 + side * 6, (sy + ey) / 2
        g.append(f'<path d="M{sx} {sy}Q{mx} {my} {ex} {ey}" stroke="{shirt}" stroke-width="11" stroke-linecap="round" fill="none"/>')
        hands.append(f'<circle cx="{ex}" cy="{ey}" r="5.5" fill="{skin}"/>')
    g.append(f'<path d="M{x-23} {y-70}Q{x-27} {y-122} {x-17} {y-136}Q{x} {y-143} {x+17} {y-136}Q{x+27} {y-122} {x+23} {y-70}Z" fill="{shirt}"/>')
    g.append(f'<rect x="{x-5}" y="{y-150}" width="10" height="14" rx="4" fill="{skin}"/>')
    if hair_style == 'long':
        g.append(hair(x, y - 162, hair_style, hair_color))
    g.append(f'<circle cx="{x}" cy="{y-162}" r="15" fill="{skin}"/>')
    if hair_style != 'long':
        g.append(hair(x, y - 162, hair_style, hair_color))
    else:
        g.append(f'<path d="M{x-16} {y-160}Q{x-15} {y-180} {x} {y-178}Q{x+15} {y-180} {x+16} {y-160}Q{x+4} {y-170} {x-16} {y-160}Z" fill="{hair_color}"/>')
    g.extend(hands)
    g.append(extra)
    g.append('</g>')
    return ''.join(g)


def seated(x, seat_y, skin, hair_style, hair_color, shirt, pants, facing=1, arms=('out', 'down'), s=1.0, extra=''):
    """Persona seduta; (x, seat_y) = anca sul sedile. facing: 1 verso destra, -1 verso sinistra."""
    f = facing
    g = [f'<g transform="translate({x} {seat_y}) scale({s}) translate({-x} {-seat_y})">']
    kx, fy = x + f * 44, seat_y + 52
    g.append(f'<path d="M{x} {seat_y}L{kx} {seat_y}L{kx} {fy}" stroke="{pants}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>')
    g.append(f'<ellipse cx="{kx+f*6}" cy="{fy+3}" rx="10" ry="5" fill="{INK}"/>')
    top = seat_y - 68
    g.append(f'<path d="M{x-21} {seat_y+4}Q{x-24} {top+14} {x-14} {top}Q{x} {top-7} {x+14} {top}Q{x+24} {top+14} {x+21} {seat_y+4}Z" fill="{shirt}"/>')
    hands = []
    for side, a in zip((-1, 1), arms):
        sx, sy = x + side * 16, top + 8
        ex, ey = {'down': (x + side * 20, seat_y - 6), 'out': (x + f * 46, top + 30), 'up': (x + side * 30, top - 40),
                  'hold': (x + f * 30, top + 40)}[a]
        g.append(f'<path d="M{sx} {sy}Q{(sx+ex)/2} {(sy+ey)/2+10} {ex} {ey}" stroke="{shirt}" stroke-width="10" stroke-linecap="round" fill="none"/>')
        hands.append(f'<circle cx="{ex}" cy="{ey}" r="5.5" fill="{skin}"/>')
    hy = top - 26
    g.append(f'<rect x="{x-5}" y="{top-14}" width="10" height="14" rx="4" fill="{skin}"/>')
    if hair_style == 'long':
        g.append(hair(x, hy, 'long', hair_color))
    g.append(f'<circle cx="{x}" cy="{hy}" r="15" fill="{skin}"/>')
    if hair_style != 'long':
        g.append(hair(x, hy, hair_style, hair_color))
    else:
        g.append(f'<path d="M{x-16} {hy+2}Q{x-15} {hy-18} {x} {hy-16}Q{x+15} {hy-18} {x+16} {hy+2}Q{x+4} {hy-8} {x-16} {hy+2}Z" fill="{hair_color}"/>')
    g.extend(hands)
    g.append(extra)
    g.append('</g>')
    return ''.join(g)


def chair(x, seat_y, color, facing=1):
    f = facing
    back = x - f * 22
    return (f'<path d="M{back} {seat_y-58}L{back} {seat_y+60}M{x+f*30} {seat_y+8}L{x+f*30} {seat_y+60}" stroke="{color}" stroke-width="6" stroke-linecap="round"/>'
            f'<rect x="{min(back, x+f*34)-2}" y="{seat_y+4}" width="{abs(x+f*34-back)+4}" height="9" rx="4" fill="{color}"/>')


def plant(x, y, pot, leaf, s=1.0):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<path d="M0 -28Q-26 -60 -6 -92Q4 -60 0 -28ZM0 -30Q24 -66 40 -70Q30 -40 0 -30ZM0 -24Q-34 -40 -42 -58Q-14 -58 0 -24Z" fill="{leaf}"/>'
            f'<path d="M-16 -28H16L12 0H-12Z" fill="{pot}"/></g>')


def bubble(x, y, w, h, fill, inner='', tail=1):
    t = x + w * (0.25 if tail > 0 else 0.75)
    return (f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{min(h/2, 18)}" fill="{fill}"/>'
            f'<path d="M{t-8} {y+h-1}L{t+tail*4} {y+h+16}L{t+10} {y+h-1}Z" fill="{fill}"/>{inner}</g>')


def heart(cx, cy, s, fill):
    return (f'<path transform="translate({cx} {cy}) scale({s})" d="M0 9C-14 0-20-6-20-13a10 10 0 0 1 20-3 10 10 0 0 1 20 3C20-6 14 0 0 9Z" fill="{fill}"/>')


def sun(cx, cy, r, fill, halo):
    return f'<circle cx="{cx}" cy="{cy}" r="{r+22}" fill="{halo}"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>'
