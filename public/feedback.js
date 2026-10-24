// "Was this page helpful?" widget at the end of the documentation pages.
// Nothing is sent automatically: after a negative answer the reader can open a
// pre-filled GitHub issue (from their own account), nothing else leaves the page.
(function () {
  var content = document.querySelector('.sl-markdown-content');
  if (!content || content.closest('.sy-full') || content.querySelector('.sy-full')) return;
  var en = /^\/en\//.test(location.pathname);
  var REPO = 'https://github.com/stevenCayla/synapse-docs/issues/new';
  var T = en
    ? {
        q: 'Was this page helpful?',
        yes: 'Yes',
        no: 'No',
        thanks: 'Thank you for your feedback.',
        sorry: 'Sorry. Help us improve this page.',
        what: 'What was missing?',
        chips: ['Missing information', 'Error', 'Outdated screenshot', 'Unclear'],
        ph: 'Describe what you were looking for (optional)',
        note: 'Opens a pre-filled GitHub issue; nothing is sent until you submit it.',
        send: 'Open a GitHub issue',
        prefix: 'Docs feedback',
        page: 'Page',
        reasons: 'Reasons',
        comment: 'Comment',
      }
    : {
        q: 'Cette page vous a-t-elle été utile ?',
        yes: 'Oui',
        no: 'Non',
        thanks: 'Merci pour votre retour.',
        sorry: 'Désolé. Aidez-nous à améliorer cette page.',
        what: "Qu'est-ce qui manquait ?",
        chips: ['Information manquante', 'Erreur', 'Capture obsolète', 'Pas clair'],
        ph: 'Décrivez ce que vous cherchiez (facultatif)',
        note: "Ouvre une issue GitHub préremplie ; rien n'est envoyé tant que vous ne la validez pas.",
        send: 'Ouvrir une issue GitHub',
        prefix: 'Retour sur la doc',
        page: 'Page',
        reasons: 'Motifs',
        comment: 'Commentaire',
      };

  var el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };

  var box = el('section', 'sy-fb');
  box.setAttribute('aria-label', T.q);
  var row = el('div', 'sy-fb-row');
  var label = el('span', 'sy-fb-q', T.q);
  label.setAttribute('role', 'status');
  var icon = function (d) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    return svg;
  };
  var withIcon = function (b, d, text) {
    b.append(icon(d), text);
    return b;
  };
  var yes = withIcon(el('button'), 'M7 10v10H4V10h3zm0 0 4-7c1.5 0 2.5 1 2.5 2.5V9H19a2 2 0 0 1 2 2.3l-1.2 6.5A2 2 0 0 1 17.8 20H7', T.yes);
  var no = withIcon(el('button'), 'M17 14V4h3v10h-3zm0 0-4 7c-1.5 0-2.5-1-2.5-2.5V15H5a2 2 0 0 1-2-2.3l1.2-6.5A2 2 0 0 1 6.2 4H17', T.no);
  [yes, no].forEach(function (b) { b.type = 'button'; });
  row.append(label, yes, no);

  var form = el('div', 'sy-fb-form');
  form.hidden = true;
  form.appendChild(el('b', null, T.what));
  var chips = el('div', 'sy-fb-chips');
  var chosen = [];
  T.chips.forEach(function (c) {
    var b = el('button', null, c);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      chosen = Array.prototype.filter.call(chips.children, function (x) { return x.getAttribute('aria-pressed') === 'true'; })
        .map(function (x) { return x.textContent; });
      update();
    });
    chips.appendChild(b);
  });
  var area = el('textarea');
  area.placeholder = T.ph;
  area.setAttribute('aria-label', T.ph);
  area.rows = 3;
  var foot = el('div', 'sy-fb-foot');
  var note = el('span', null, T.note);
  var send = el('a', 'sy-fb-send', T.send);
  send.target = '_blank';
  send.rel = 'noopener noreferrer';
  foot.append(note, send);
  form.append(chips, area, foot);

  var update = function () {
    var title = document.querySelector('h1');
    var heading = title ? title.textContent.trim() : location.pathname;
    var body = T.page + ': ' + location.origin + location.pathname + '\n' +
      (chosen.length ? T.reasons + ': ' + chosen.join(', ') + '\n' : '') +
      (area.value.trim() ? '\n' + T.comment + ':\n' + area.value.trim() + '\n' : '');
    send.href = REPO + '?labels=documentation&title=' + encodeURIComponent(T.prefix + ': ' + heading) +
      '&body=' + encodeURIComponent(body);
  };
  area.addEventListener('input', update);

  yes.addEventListener('click', function () {
    yes.classList.add('on');
    no.classList.remove('on');
    form.hidden = true;
    label.textContent = T.thanks;
  });
  no.addEventListener('click', function () {
    no.classList.add('on');
    yes.classList.remove('on');
    form.hidden = false;
    label.textContent = T.sorry;
    update();
    area.focus();
  });

  box.append(row, form);
  content.appendChild(box);
})();
