// Small accessibility fixes applied to the rendered documentation:
//  - scrollable tables and code areas can be reached and scrolled with the keyboard;
//  - task-list checkboxes of the Markdown content get an accessible name.
(function () {
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  $$('.sl-markdown-content table, .kit-wrap').forEach(function (el) {
    if (el.scrollWidth > el.clientWidth + 1) {
      el.tabIndex = 0;
      if (!el.hasAttribute('role')) el.setAttribute('role', 'region');
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', document.title.split(' | ')[0]);
    }
  });
  $$('.task-list-item input[type="checkbox"]').forEach(function (box) {
    if (!box.getAttribute('aria-label')) box.setAttribute('aria-label', (box.parentElement.textContent || '').trim());
  });
})();
