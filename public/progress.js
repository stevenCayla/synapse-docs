// Reading progress of the guides: "mark as done" button at the end of each
// guide, counters in the sidebar, progress bars and check marks on the home
// page. Stored in localStorage only; nothing leaves the browser.
(function () {
  var KEY = 'syn-docs-progress';
  var GROUPS = {
    start: ['premiers-pas', 'creer-etude', 'design-population-sites', 'reglementaire-ecrf-equipe', 'importer', 'lancer'],
    run: ['saisir-ecrf', 'requetes-monitoring', 'randomisation', 'gel-verrouillage', 'exports'],
  };
  var en = /^\/en\//.test(location.pathname);
  var TXT = en
    ? { mark: 'Mark this guide as done', done: 'Guide done', reset: 'Reset my progress' }
    : { mark: 'Marquer ce guide comme terminé', done: 'Guide terminé', reset: 'Réinitialiser ma progression' };

  var load = function () {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  };
  var save = function (p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  };
  var progress = load();
  var slugOf = function (href) {
    var m = /\/guides\/([^/?#]+)/.exec(href || '');
    return m ? m[1] : null;
  };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var apply = function () {
    save(progress);
    // Guide links: sidebar, home, reading path.
    $$('a[href*="/guides/"]').forEach(function (a) {
      // Links inside a guide (pager, cross references) are not progress markers.
      if (a.closest('.pagination-links')) return;
      if (a.closest('.sl-markdown-content') && !a.closest('.sy-home')) return;
      var slug = slugOf(a.getAttribute('href'));
      if (slug) a.classList.toggle('done', !!progress[slug]);
    });
    // Home progress bars.
    Object.keys(GROUPS).forEach(function (g) {
      var n = GROUPS[g].filter(function (s) { return progress[s]; }).length;
      var total = GROUPS[g].length;
      $$('[data-gcount="' + g + '"]').forEach(function (el) { el.textContent = n + '/' + total; });
      $$('[data-gbar="' + g + '"]').forEach(function (el) { el.style.width = (100 * n / total) + '%'; });
    });
    // Sidebar group counters.
    $$('details').forEach(function (d) {
      var slugs = $$('a[href*="/guides/"]', d).map(function (a) { return slugOf(a.getAttribute('href')); }).filter(Boolean);
      if (!slugs.length) return;
      var label = d.querySelector(':scope > summary .group-label');
      if (!label) return;
      var badge = label.querySelector('.gcount');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'gcount';
        label.appendChild(badge);
      }
      var n = slugs.filter(function (s) { return progress[s]; }).length;
      badge.textContent = n + '/' + slugs.length;
      badge.classList.toggle('full', n === slugs.length);
    });
    // End-of-guide button.
    var btn = document.querySelector('[data-done]');
    if (btn) {
      var on = !!progress[btn.dataset.done];
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? TXT.done : TXT.mark;
    }
  };

  var slug = slugOf(location.pathname);
  var content = document.querySelector('.sl-markdown-content');
  if (slug && content && (GROUPS.start.indexOf(slug) >= 0 || GROUPS.run.indexOf(slug) >= 0)) {
    var wrap = document.createElement('div');
    wrap.className = 'sy-gend';
    var b = document.createElement('button');
    b.type = 'button';
    b.dataset.done = slug;
    b.addEventListener('click', function () {
      if (progress[slug]) delete progress[slug];
      else progress[slug] = true;
      apply();
    });
    wrap.appendChild(b);
    content.appendChild(wrap);
  }

  $$('[data-reset-progress]').forEach(function (el) {
    el.addEventListener('click', function () {
      progress = {};
      apply();
    });
  });
  // The sidebar is rendered by Starlight before this script runs (defer).
  apply();
})();
