#!/usr/bin/env python3
"""Prova nel browser (Chrome, Playwright) del finale con l'attestato a schermo e della richiesta via email. Dati e server FITTIZI.

Uso: python3 -m http.server 8781 --bind 127.0.0.1   (dalla radice del sito, in un altro terminale)
     python3 scripts/prova-browser-attestato-email.py

Le richieste verso *.supabase.co e /__test/ vanno a un server finto; ogni altra richiesta fuori da 127.0.0.1:8781 è fermata.
EMAIL_ATTIVA resta false nel repository: la parte «acceso» serve al browser una copia di bussola-interruttori.mjs con l'interruttore acceso.
"""
import importlib.util, json, os, re, sys
from playwright.sync_api import sync_playwright

QUI = os.path.dirname(os.path.abspath(__file__))
# Si riusano server finto e percorso AFM della prova del codice breve, senza eseguirne il corpo.
sorgente = open(os.path.join(QUI, 'prova-browser-codice-breve.py'), encoding='utf-8').read().split('# ------------------------------------------------------------------------------------------------------')[0]
base = {'__file__': os.path.join(QUI, 'prova-browser-codice-breve.py'), '__name__': 'codice'}
exec(compile(sorgente, 'prova-browser-codice-breve.py', 'exec'), base)
Finto, concludi_afm, BASE, RADICE = base['Finto'], base['concludi_afm'], base['BASE'], base['RADICE']
ANTEPRIME = os.environ.get('ANTEPRIME', '/tmp/anteprime/email'); os.makedirs(ANTEPRIME, exist_ok=True)

class FintoEmail(Finto):
    def __init__(self):
        super().__init__(); self.richieste_email = []
    def gestisci(self, route, request):
        try: corpo = json.loads(request.post_data or '{}')
        except Exception: corpo = {}
        if corpo.get('action') == 'attestato_email':
            self.log.append(('esperienze', 'attestato_email')); self.richieste.append((request.url, request.post_data or ''))
            self.richieste_email.append({**corpo, 'token': request.headers.get('x-bussola-token', '')})
            return route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body='{"ok":true}')
        return super().gestisci(route, request)

INTERRUTTORI = re.compile(r'.*/bussola-interruttori\.mjs.*')
def email_acceso(contesto):
    s = open(RADICE + '/bussola-interruttori.mjs', encoding='utf-8').read()
    assert 'export const EMAIL_ATTIVA = false || provaEmail;' in s
    s = s.replace('export const EMAIL_ATTIVA = false || provaEmail;', 'export const EMAIL_ATTIVA = true;')
    contesto.route(INTERRUTTORI, lambda r, q: r.fulfill(status=200, content_type='text/javascript', body=s))

esiti = []
def verifica(c, m): esiti.append((bool(c), m)); print(('OK   ' if c else 'FALLITO ') + m)
def contesto(b, f, acceso, w=390, h=844):
    ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce'); f.installa(ctx)
    if acceso: email_acceso(ctx)
    return ctx
def pagina(ctx, errori):
    pg = ctx.new_page()
    pg.on('console', lambda m: errori.append(m.text) if m.type == 'error' and 'cloudflareinsights' not in m.text and not m.text.startswith('Failed to load resource') else None)
    pg.on('pageerror', lambda e: errori.append(str(e)))
    return pg
def all_attestato(pg):
    pg.wait_for_selector('.bt-finale')
    if pg.locator('.bt-trecose').count(): pg.click('#finaleAvanti', force=True)
    pg.wait_for_selector('.bt-attestato .bt-biglietto__qr svg', timeout=15000)
def largo(pg): return pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1')

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']) if os.path.exists('/usr/bin/google-chrome') else p.chromium.launch(channel='chrome')
    errori = []

    print('== 1. interruttore spento (file vero del repository)')
    f = FintoEmail(); ctx = contesto(b, f, False); pg = pagina(ctx, errori)
    verifica(concludi_afm(pg, 'Mario', 'Prova'), 'la prova AFM arriva al finale')
    all_attestato(pg); pg.wait_for_timeout(500)
    verifica(pg.locator('.bt-attestato canvas').count() == 1, 'l\'attestato è a schermo')
    verifica(pg.locator('#finaleStampa').count() == 0, 'niente «Stampa»')
    verifica(pg.locator('#finaleScarica').count() == 1 and 'bt-link' in (pg.get_attribute('#finaleScarica', 'class') or ''), 'un solo collegamento discreto «Scarica l’immagine da condividere»')
    with pg.expect_download(timeout=15000) as d: pg.click('#finaleScarica')
    percorso = os.path.join(ANTEPRIME, 'scaricata-' + d.value.suggested_filename); d.value.save_as(percorso)
    verifica(d.value.suggested_filename == 'bussola-afm-Mario.jpg', f'si scarica un\'immagine JPEG con il solo nome di battesimo ({d.value.suggested_filename})')
    from PIL import Image
    verifica(Image.open(percorso).size == (1080, 1920), 'l\'immagine è 1080×1920, il formato delle storie di Instagram')
    verifica(pg.locator('.bt-biglietto__qr svg').count() == 1, 'il QR c\'è')
    verifica('inquadra il QR' in pg.inner_text('.bt-biglietto') and 'scarichi' not in pg.inner_text('.bt-biglietto'), 'la frase del QR non parla più di scaricare')
    verifica(pg.locator('.bt-email-blocco, .bt-email').count() == 0, 'spento: nessun campo email')
    verifica(not any(a == 'attestato_email' for _, a in f.log), 'spento: nessuna richiesta email')
    pg.screenshot(path=f'{ANTEPRIME}/finale-spento-390.png')
    pg.set_viewport_size({'width': 1366, 'height': 768}); pg.wait_for_timeout(300)
    verifica(largo(pg), 'spento 1366: nessuno scorrimento orizzontale'); pg.screenshot(path=f'{ANTEPRIME}/finale-spento-1366.png')
    ctx.close()

    print('== 2. interruttore acceso solo nella prova')
    f = FintoEmail(); ctx = contesto(b, f, True); pg = pagina(ctx, errori)
    verifica(concludi_afm(pg, 'Mario', 'Prova'), 'acceso: la prova AFM arriva al finale')
    all_attestato(pg); pg.wait_for_timeout(400)
    verifica(pg.locator('.bt-email__apri').is_visible() and pg.locator('form.bt-email').is_hidden(), 'acceso: c\'è «Vuoi riceverlo via email?», il modulo è chiuso')
    pg.screenshot(path=f'{ANTEPRIME}/finale-acceso-chiuso-390.png')
    pg.click('.bt-email__apri')
    verifica(pg.locator('form.bt-email input[type=email]').is_visible() and pg.locator('.bt-email__apri').is_hidden(), 'il tocco apre il modulo e il collegamento sparisce')
    pg.fill('form.bt-email input[type=email]', 'genitore@esempio'); pg.click('form.bt-email button[type=submit]'); pg.wait_for_timeout(200)
    verifica('Controlla' in pg.inner_text('form.bt-email .bt-nota'), 'email sbagliata: messaggio chiaro')
    pg.fill('form.bt-email input[type=email]', 'genitore.prova@esempio.it'); pg.click('form.bt-email button[type=submit]'); pg.wait_for_timeout(200)
    verifica('spunta' in pg.inner_text('form.bt-email .bt-nota') and not f.richieste_email, 'senza spunta: non parte nulla')
    pg.locator('form.bt-email').scroll_into_view_if_needed(); pg.screenshot(path=f'{ANTEPRIME}/finale-acceso-modulo-390.png')
    pg.check('form.bt-email input[type=checkbox]'); pg.click('form.bt-email button[type=submit]')
    pg.wait_for_selector('.bt-email-blocco .bt-frase', timeout=8000)
    verifica('genitore.prova@esempio.it' in pg.inner_text('.bt-email-blocco'), 'conferma a schermo con l\'email')
    r = f.richieste_email[0] if f.richieste_email else {}
    verifica(len(f.richieste_email) == 1 and r.get('consenso') is True and r.get('corso') == 'afm' and r.get('email') == 'genitore.prova@esempio.it', 'una sola richiesta con email, corso e consenso')
    verifica(r.get('nome') == 'Mario Prova' and r.get('informativa'), 'la richiesta porta il nome dell\'attestato e la versione dell\'informativa')
    verifica(re.fullmatch(r'[A-Za-z0-9_-]{43}', r.get('token', '')), 'la richiesta è legata al codice personale del lavoro')
    pg.screenshot(path=f'{ANTEPRIME}/finale-acceso-fatto-390.png')
    verifica(largo(pg), 'acceso 390: nessuno scorrimento orizzontale')
    altri = [c for u, c in f.richieste if 'attestato_email' not in c]
    verifica(not any('Mario' in c for c in altri), 'il nome va al server solo nella richiesta email, dopo il consenso')
    verifica(set(f.fuori) <= {'https://static.cloudflareinsights.com/beacon.min.js'}, 'nessuna richiesta verso reti vere')
    ctx.close(); b.close()

verifica(errori == [], 'nessun errore in console' + (' ' + str(errori[:3]) if errori else ''))
falliti = [m for ok, m in esiti if not ok]
print(f'\n{len(esiti) - len(falliti)} controlli superati, {len(falliti)} falliti')
sys.exit(1 if falliti else 0)
