// 404 page: shows the requested path, and the English text for /en/ paths.
(function () {
  var root = document.querySelector('.nf');
  if (!root) return;
  var en = /^\/en(\/|$)/.test(location.pathname);
  root.querySelectorAll('.nf-in').forEach(function (block) {
    block.hidden = block.dataset.lang !== (en ? 'en' : 'fr');
    var path = block.querySelector('[data-path]');
    if (path) path.textContent = location.pathname + location.search;
  });
  root.querySelectorAll('[data-nf-search]').forEach(function (button) {
    button.addEventListener('click', function () {
      var open = document.querySelector('site-palette [data-open]');
      if (open) open.click();
    });
  });
})();
