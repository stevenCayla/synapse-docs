// Screenshot viewer: a click on a screenshot of a guide opens it full size in a
// dialog (Escape or a click outside closes it; arrows browse the page's shots).
(function () {
  var root = document.querySelector('.sl-markdown-content');
  if (!root || !/\/guides\//.test(location.pathname)) return;
  var en = /^\/en\//.test(location.pathname);
  var T = en
    ? { close: 'Close', prev: 'Previous screenshot', next: 'Next screenshot', open: 'Enlarge the screenshot', of: ' of ' }
    : { close: 'Fermer', prev: 'Capture précédente', next: 'Capture suivante', open: 'Agrandir la capture', of: ' sur ' };
  var imgs = Array.prototype.slice.call(root.querySelectorAll('img')).filter(function (i) {
    return !i.closest('a, button');
  });
  if (!imgs.length) return;

  var dlg = document.createElement('dialog');
  dlg.className = 'sy-lb';
  dlg.setAttribute('aria-label', document.title.split(' | ')[0]);
  dlg.innerHTML =
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="sy-lb-x"></button>' +
    '<button type="button" class="sy-lb-p"></button>' +
    '<button type="button" class="sy-lb-n"></button>';
  document.body.appendChild(dlg);
  var shot = dlg.querySelector('img');
  var cap = dlg.querySelector('figcaption');
  var x = dlg.querySelector('.sy-lb-x');
  var p = dlg.querySelector('.sy-lb-p');
  var n = dlg.querySelector('.sy-lb-n');
  x.textContent = '×'; x.setAttribute('aria-label', T.close);
  p.textContent = '‹'; p.setAttribute('aria-label', T.prev);
  n.textContent = '›'; n.setAttribute('aria-label', T.next);
  var cur = 0, opener = null;

  function show(i) {
    cur = (i + imgs.length) % imgs.length;
    var src = imgs[cur];
    shot.src = src.currentSrc || src.src;
    shot.alt = src.alt;
    cap.textContent = (src.alt || '') + (imgs.length > 1 ? '  (' + (cur + 1) + T.of + imgs.length + ')' : '');
    p.hidden = n.hidden = imgs.length < 2;
  }
  imgs.forEach(function (img, i) {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', T.open + (img.alt ? ' : ' + img.alt : ''));
    img.style.cursor = 'zoom-in';
    var open = function () { opener = img; show(i); dlg.showModal(); };
    img.addEventListener('click', open);
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
  x.addEventListener('click', function () { dlg.close(); });
  p.addEventListener('click', function () { show(cur - 1); });
  n.addEventListener('click', function () { show(cur + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });
  dlg.addEventListener('close', function () { if (opener) opener.focus(); });
})();
