#!/usr/bin/env python3
"""Prova nel browser (Chrome, Playwright) del codice breve per il ritorno da casa. Dati e server FITTIZI.

Uso: python3 -m http.server 8781 --bind 127.0.0.1   (dalla radice del sito, in un altro terminale)
     python3 scripts/prova-browser-codice-breve.py

Tutte le richieste verso *.supabase.co e /__test/ sono intercettate da un server finto; ogni altra richiesta fuori da
127.0.0.1:8781 viene fermata. L'interruttore CODICE_BREVE_ATTIVO resta false nel repository: la prova "acceso" serve al
browser una copia di bussola-interruttori.mjs con l'interruttore acceso, senza toccare il file.
"""
import re, sys, os, json, random, uuid
from playwright.sync_api import sync_playwright
BASE = 'http://127.0.0.1:8781'
RADICE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ANTEPRIME = os.environ.get('ANTEPRIME', '/tmp/anteprime/a11')
os.makedirs(ANTEPRIME, exist_ok=True)
CODICE = re.compile(r'^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$')

ALFA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
class Finto:
    def __init__(self, ruoli_classi=None):
        self.persone = {}          # token -> {id, progetti{corso:{payload,revision}}, codice}
        self.log = []              # (url_fine, azione)
        self.classi = set(ruoli_classi or [])
        self.tentativi = 0
        self.fuori = []
        self.richieste = []   # (url, corpo) di ogni chiamata ai servizi
    def installa(self, contesto):
        # Qualunque richiesta fuori da questo computer viene fermata prima di partire.
        contesto.route(lambda u: not re.match(r'^(http://127\.0\.0\.1:8781/|data:|blob:)', u) and not re.search(r'(supabase\.co|/__test/)', u), lambda r, q: (self.fuori.append(q.url), r.abort()))
        contesto.route(re.compile(r'.*(supabase\.co|/__test/).*'), self.gestisci)
    def gestisci(self, route, request):
        url = request.url
        try: corpo = json.loads(request.post_data or '{}')
        except Exception: corpo = {}
        azione = corpo.get('action', '')
        fine = 'esperienze' if 'esperienze' in url else 'gestione' if 'gestione' in url else 'altro'
        self.log.append((fine, azione)); self.richieste.append((url, request.post_data or ''))
        def rispondi(dati, stato=200):
            route.fulfill(status=stato, content_type='application/json', headers={'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'}, body=json.dumps(dati))
        if request.method == 'OPTIONS':
            return route.fulfill(status=204, headers={'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST'})
        token = request.headers.get('x-bussola-token', '')
        if fine == 'gestione':
            if azione == 'class_info': return rispondi({'error': 'Il codice non è disponibile. Controllalo con il docente.'}, 404)
            if azione == 'identity': return rispondi({'alunno': None})
            return rispondi({'error': 'no'}, 404)
        if fine != 'esperienze': return rispondi({'error': 'sconosciuto'}, 500)
        if azione == 'codice_apri':
            self.tentativi += 1
            codice = re.sub(r'[\s-]', '', str(corpo.get('codice', ''))).upper()
            for p in self.persone.values():
                if p.get('codice') == codice:
                    return rispondi({'participant': p['id'], 'projects': [{'corso': c, 'payload': v['payload'], 'revision': v['revision'], 'updated_at': v['t']} for c, v in p['progetti'].items()]})
            return rispondi({'error': 'Il codice non è valido o non è più disponibile.'}, 404)
        if not re.fullmatch(r'[A-Za-z0-9_-]{43}', token): return rispondi({'error': 'Accesso al progetto non valido.'}, 401)
        p = self.persone.setdefault(token, {'id': str(uuid.uuid4()), 'progetti': {}, 'codice': None})
        corso = corpo.get('corso', 'ssas')
        if azione in ('start', 'load'):
            pr = p['progetti'].get(corso)
            return rispondi({'participant': p['id'], 'project': {'payload': pr['payload'], 'revision': pr['revision'], 'updated_at': pr['t']} if pr else None, 'notes': []})
        if azione == 'save':
            rev = corpo.get('revision', 0); pr = p['progetti'].get(corso)
            n = (pr['revision'] + 1) if pr else 1
            p['progetti'][corso] = {'payload': corpo['project'], 'revision': n, 't': '2026-12-11T10:%02d:00Z' % len(self.log) if len(self.log) < 60 else '2026-12-11T11:00:00Z'}
            return rispondi({'revision': n})
        if azione == 'note': return rispondi({'note': {'id': corpo['note']['id'], 'created_at': '2026-12-11T10:00:00Z'}})
        if azione == 'codice_ottieni':
            if not p['codice']: p['codice'] = ''.join(random.choice(ALFA) for _ in range(6))
            return rispondi({'codice': p['codice']})
        return rispondi({'error': 'Operazione non disponibile.'}, 400)

INTERRUTTORI = re.compile(r'.*/bussola-interruttori\.mjs.*')
def con_codice_acceso(contesto, acceso):
    if not acceso: return
    sorgente = open(RADICE + '/bussola-interruttori.mjs', encoding='utf-8').read()
    assert 'CODICE_BREVE_ATTIVO = false' in sorgente
    modificato = sorgente.replace('CODICE_BREVE_ATTIVO = false', 'CODICE_BREVE_ATTIVO = true')
    contesto.route(INTERRUTTORI, lambda r, q: r.fulfill(status=200, content_type='text/javascript', body=modificato))
def concludi_afm(pagina, nome='Mario', cognome='Prova'):
    pagina.goto(BASE + '/bussola-afm.html')
    for _ in range(200):
        if pagina.locator('.bt-finale').count(): return True
        ing = pagina.locator('.bt-ingresso input[name=nome]')
        if ing.count() and ing.first.is_visible():
            pagina.fill('.bt-ingresso input[name=nome]', nome); pagina.fill('.bt-ingresso input[name=cognome]', cognome)
            pagina.locator('.bt-ingresso form button[type=submit]').first.click(); pagina.wait_for_timeout(300); continue
        if pagina.locator('#start').count() and pagina.locator('#start').is_visible():
            pagina.click('#start'); pagina.wait_for_timeout(300); continue
        sc = pagina.locator('.bt-scelta:not([aria-pressed=true]):not([disabled])')
        nxt = pagina.locator('#next')
        if nxt.count() and nxt.is_enabled(): nxt.click(); pagina.wait_for_timeout(120); continue
        if sc.count(): sc.first.click(); pagina.wait_for_timeout(120); continue
        pagina.wait_for_timeout(200)
    return False

# ------------------------------------------------------------------------------------------------------
esiti = []
SOLO_BEACON = {'https://static.cloudflareinsights.com/beacon.min.js'}   # contatore già presente nelle pagine: la prova lo ferma
def verifica(condizione, messaggio):
    esiti.append((bool(condizione), messaggio))
    print(('OK   ' if condizione else 'FALLITO ') + messaggio)
def nuovo_contesto(b, acceso, f, larghezza=390, altezza=844):
    ctx = b.new_context(viewport={'width': larghezza, 'height': altezza}, reduced_motion='reduce')
    f.installa(ctx); con_codice_acceso(ctx, acceso)
    return ctx
def pagina_con_errori(ctx, errori):
    pg = ctx.new_page()
    pg.on('console', lambda m: errori.append(m.text) if m.type == 'error' and 'cloudflareinsights' not in m.text and 'Content Security Policy' not in m.text and not m.text.startswith('Failed to load resource') else None)
    pg.on('pageerror', lambda e: errori.append(str(e)))
    return pg
def vai_all_attestato(pg):
    pg.wait_for_selector('.bt-finale')
    if pg.locator('.bt-trecose').count(): pg.click('#finaleAvanti', force=True)
    pg.wait_for_selector('.bt-attestato .bt-biglietto__qr svg, .bt-attestato .bt-biglietto__qr span', timeout=15000)
def senza_scorrimento(pg): return pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1')

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox']) if os.path.exists('/usr/bin/google-chrome') else p.chromium.launch(channel='chrome')
    errori = []

    # ---- 1. INTERRUTTORE SPENTO (il file vero del repository) ------------------------------------------------
    print('== 1. interruttore spento')
    assert 'CODICE_BREVE_ATTIVO = false' in open(RADICE + '/bussola-interruttori.mjs', encoding='utf-8').read()
    f0 = Finto(); ctx = nuovo_contesto(b, False, f0); pg = pagina_con_errori(ctx, errori)
    richieste_moduli = []
    pg.on('request', lambda r: richieste_moduli.append(r.url) if 'bussola-ritorno-codice' in r.url else None)
    verifica(concludi_afm(pg), 'spento: la prova AFM arriva al finale')
    vai_all_attestato(pg); pg.wait_for_timeout(800)
    verifica(pg.locator('.bt-biglietto').count() == 1 and pg.locator('.bt-biglietto__qr svg').count() == 1, 'spento: il biglietto c\'è con il QR')
    verifica(pg.locator('.bt-biglietto__codice').count() == 0, 'spento: nessun codice breve nel biglietto')
    verifica('Scrivilo' not in pg.inner_text('.bt-biglietto'), 'spento: nessuna frase nuova nel biglietto')
    verifica(not any(a.startswith('codice_') for _, a in f0.log), 'spento: nessuna chiamata codice_ottieni/codice_apri')
    verifica(richieste_moduli == [], 'spento: il modulo del codice breve non viene nemmeno scaricato')
    pg.goto(BASE + '/bussola.html'); pg.click('#linkCodice'); pg.fill('input[name=codice]', 'ZZZZ29'); pg.click('.bt-bentornato button[type=submit]'); pg.wait_for_timeout(800)
    verifica(pg.locator('.bt-errore').inner_text().strip() != '', 'spento: «Ho un codice» con un codice sconosciuto mostra un errore')
    verifica(not any(a == 'codice_apri' for _, a in f0.log) and richieste_moduli == [], 'spento: «Ho un codice» non chiama il server dei codici personali')
    verifica('Il codice di 6 caratteri' not in pg.inner_text('.bt-bentornato') and 'oppure il codice della tua classe' not in pg.inner_text('.bt-bentornato'), 'spento: la nota di «Ho un codice» resta quella di prima')
    verifica(set(f0.fuori) <= SOLO_BEACON, 'spento: nessuna richiesta fuori da 127.0.0.1 e dal server finto (a parte il contatore Cloudflare della pagina, fermato)')
    ctx.close()

    # ---- 2. INTERRUTTORE ACCESO SOLO NELLA PROVA: dispositivo A -----------------------------------------------
    print('== 2. acceso: dispositivo A conclude una prova e vede il codice')
    f = Finto(); ctxA = nuovo_contesto(b, True, f); pgA = pagina_con_errori(ctxA, errori)
    verifica(concludi_afm(pgA, 'Mario', 'Prova'), 'A: la prova AFM arriva al finale')
    vai_all_attestato(pgA)
    pgA.wait_for_selector('.bt-biglietto__codice:not([hidden])', timeout=15000)
    codice = pgA.inner_text('.bt-biglietto__codice').strip()
    verifica(CODICE.match(codice), f'A: il codice ha sei caratteri leggibili (senza 0/O/1/I/L): {codice}')
    verifica(not re.search('[01OIL]', codice), 'A: nessuno dei caratteri ambigui')
    verifica('Scrivilo: a casa, con i tuoi genitori, torna qui' in pgA.inner_text('.bt-biglietto'), 'A: la frase «Scrivilo: a casa, con i tuoi genitori, torna qui»')
    verifica(pgA.locator('.bt-biglietto__qr svg').count() == 1, 'A: il QR resta accanto al codice')
    dim = pgA.evaluate("(() => { const c = document.querySelector('.bt-biglietto__codice'); const s = getComputedStyle(c); return {px: parseFloat(s.fontSize), largo: c.scrollWidth <= c.clientWidth + 1}; })()")
    verifica(dim['px'] >= 30 and dim['largo'], f"A: il codice è in grande ({dim['px']:.0f} px) e non esce dal biglietto")
    verifica(senza_scorrimento(pgA), 'A 390x844: nessuno scorrimento orizzontale')
    pgA.locator('.bt-biglietto').scroll_into_view_if_needed(); pgA.screenshot(path=f'{ANTEPRIME}/codice-A-390.png')
    pgA.set_viewport_size({'width': 1366, 'height': 768}); pgA.wait_for_timeout(300)
    verifica(senza_scorrimento(pgA), 'A 1366x768: nessuno scorrimento orizzontale'); pgA.locator('.bt-biglietto').scroll_into_view_if_needed(); pgA.screenshot(path=f'{ANTEPRIME}/codice-A-1366.png')
    n_ott = sum(1 for _, a in f.log if a == 'codice_ottieni')
    verifica(n_ott == 1, f'A: una sola richiesta del codice ({n_ott})')

    # ---- 3. Dispositivo B (memoria del browser vuota) ----------------------------------------------------------
    print('== 3. acceso: dispositivo B inserisce il codice')
    ctxB = nuovo_contesto(b, True, f); pgB = pagina_con_errori(ctxB, errori)
    pgB.goto(BASE + '/bussola.html'); pgB.click('#linkCodice')
    verifica('6 caratteri' in pgB.inner_text('.bt-bentornato'), 'B: «Ho un codice» spiega il codice di 6 caratteri')
    pgB.fill('input[name=codice]', 'ZZZZ29'); pgB.click('.bt-bentornato button[type=submit]'); pgB.wait_for_timeout(800)
    verifica('non è valido' in pgB.locator('.bt-errore').inner_text(), 'B: un codice sconosciuto dà un messaggio chiaro, nessun attestato')
    verifica(pgB.locator('canvas').count() == 0, 'B: nessun attestato con il codice sbagliato')
    pgB.fill('input[name=codice]', 'ZZZL29'); pgB.click('.bt-bentornato button[type=submit]'); pgB.wait_for_timeout(500)
    verifica(sum(1 for _, a in f.log if a == 'codice_apri') == 1, 'B: un codice con la L (può essere solo di classe) non interroga i codici personali')
    pgB.fill('input[name=codice]', ' ' + codice[:3].lower() + '-' + codice[3:].lower() + ' '); pgB.click('.bt-bentornato button[type=submit]')
    pgB.wait_for_selector('input[name=nome]', timeout=15000)
    verifica('Come ti chiami' in pgB.inner_text('.bt-bentornato'), 'B: il nome non è sul server, quindi lo chiede')
    pgB.screenshot(path=f'{ANTEPRIME}/codice-B-nome-390.png')
    pgB.fill('.bt-bentornato input[name=nome]', 'Luca'); pgB.fill('.bt-bentornato input[name=cognome]', 'Fittizio'); pgB.click('.bt-bentornato button[type=submit]')
    pgB.wait_for_selector('.bt-bentornato canvas', timeout=20000)
    testo = pgB.inner_text('.bt-bentornato')
    verifica('Bentornato, Luca' in testo, 'B: «Bentornato» con il nome scritto qui')
    verifica(pgB.locator('.bt-bentornato canvas').count() == 1, 'B: l\'attestato è disegnato')
    verifica(pgB.get_attribute('#bentornatoScarica', 'download') not in (None, '') and 'bt-link' in (pgB.get_attribute('#bentornatoScarica', 'class') or ''), 'B: «Scarica l\'attestato» discreto (18/11/2026)')
    verifica(pgB.locator('.bt-bentornato .bt-distintivo[data-corso=afm]').count() == 1, 'B: il distintivo AFM è tra quelli ottenuti')
    verifica(pgB.get_attribute('#bentornatoAltro', 'href') == 'missioni.html' and 'famiglie.html#iscrizione' in pgB.get_attribute('#bentornatoIscrizione', 'href'), 'B: «Prova un altro indirizzo» e «Come ci si iscrive»')
    verifica('Open Day' in testo, 'B: le date dell\'Open Day')
    verifica(senza_scorrimento(pgB), 'B 390x844: nessuno scorrimento orizzontale')
    pgB.screenshot(path=f'{ANTEPRIME}/bentornato-B-390.png', full_page=True)
    pgB.set_viewport_size({'width': 1366, 'height': 768}); pgB.wait_for_timeout(300)
    verifica(senza_scorrimento(pgB), 'B 1366x768: nessuno scorrimento orizzontale'); pgB.screenshot(path=f'{ANTEPRIME}/bentornato-B-1366.png')

    # ---- 4. Il nome non va mai al server --------------------------------------------------------------------------
    print('== 4. riservatezza e rete')
    tutto = ' '.join(c for _, c in f.richieste)
    verifica(not re.search(r'Mario|Luca|Fittizio|Prova"', tutto.replace('"corso"', '')), 'nessuna richiesta al server contiene i nomi scritti')
    verifica(all(not re.search('"(nome|cognome)"', c) for u, c in f.richieste if 'esperienze' in u), 'le richieste ai lavori non hanno campi nome/cognome')
    verifica(set(f.fuori) <= SOLO_BEACON, 'nessuna richiesta è uscita verso reti vere (a parte il contatore Cloudflare della pagina, fermato prima di partire)')
    verifica(errori == [], 'nessun errore in console' + (' ' + str(errori[:3]) if errori else ''))
    ctxA.close(); ctxB.close()

    # ---- 5. Di nuovo spento: nulla si vede ------------------------------------------------------------------------
    print('== 5. di nuovo spento')
    assert 'CODICE_BREVE_ATTIVO = false' in open(RADICE + '/bussola-interruttori.mjs', encoding='utf-8').read()
    f5 = Finto(); ctx5 = nuovo_contesto(b, False, f5); pg5 = pagina_con_errori(ctx5, errori)
    concludi_afm(pg5); vai_all_attestato(pg5); pg5.wait_for_timeout(800)
    verifica(pg5.locator('.bt-biglietto__codice').count() == 0 and not any(a.startswith('codice_') for _, a in f5.log), 'rimesso a false: niente codice, nessuna chiamata nuova')
    ctx5.close(); b.close()

falliti = [m for ok, m in esiti if not ok]
print(f'\n{len(esiti) - len(falliti)} controlli superati, {len(falliti)} falliti')
sys.exit(1 if falliti else 0)
