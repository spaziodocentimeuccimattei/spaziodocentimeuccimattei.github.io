// Presentation is a view, never a change to the saved project's position.
// A public orientation entry keeps its selected activity and any shared link.
export function activityDestination(href, course = null) {
  const source = new URL(href);
  const selected = String(course ?? source.searchParams.get('corso') ?? '').toLowerCase();
  const valid = ['afm', 'sia', 'turismo', 'ssas', 'cat'].includes(selected);
  const target = new URL(valid ? `bussola-${selected}.html` : 'missioni.html', source);
  target.search = source.search;
  target.searchParams.delete('corso');
  if (source.hash.includes('=')) target.hash = source.hash;
  return target.href;
}

export function experienceRoute(hash = '') {
  const raw = hash.replace(/^#/, '');
  const route = raw.includes('=') ? new URLSearchParams(raw).get('passaggio') : raw;
  return /^(ingresso|conclusione|passaggio-\d{1,2}|laboratorio-[1-5]-[1-3])$/.test(route || '') ? route : 'ingresso';
}

export function setupExperienceNavigation(onNavigate, browser = window) {
  let intro = experienceRoute(browser.location.hash) === 'ingresso';
  let first = true, traversing = false;
  browser.addEventListener('popstate', () => {
    const route = experienceRoute(browser.location.hash);
    intro = route === 'ingresso';
    traversing = true;
    try { onNavigate(route); } finally { traversing = false; }
  });
  return {
    isIntro: () => intro,
    route: () => experienceRoute(browser.location.hash),
    enter: () => { intro = false; },
    showIntro: () => { intro = true; },
    write(route, replace = false, projectId = '') {
      const url = new URL(browser.location.href);
      if (projectId) url.searchParams.set('progetto', projectId);
      const raw = url.hash.slice(1);
      if (raw.includes('=')) {
        const params = new URLSearchParams(raw);
        params.set('passaggio', route);
        url.hash = params.toString();
      } else url.hash = route;
      if (url.href !== browser.location.href) {
        browser.history[first || replace || traversing ? 'replaceState' : 'pushState'](null, '', url.href);
      }
      first = false;
    }
  };
}
