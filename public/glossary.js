// Underlines the first occurrence of each glossary term in the guides and
// shows its definition in a tooltip (styles: src/styles/guides.css).
(function () {
  if (!/\/guides\//.test(location.pathname)) return;
  var root = document.querySelector('.sl-markdown-content');
  if (!root) return;
  var skip = /^(A|CODE|PRE|H1|H2|H3|H4|TH|ABBR|SUMMARY|BUTTON|SCRIPT|STYLE)$/;
  var escape = function (s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  fetch(/^\/en\//.test(location.pathname) ? '/en/glossary.json' : '/glossary.json')
    .then(function (r) {
      return r.json();
    })
    .then(function (terms) {
      terms.sort(function (a, b) {
        return b.term.length - a.term.length;
      });
      terms.forEach(function (t) {
        var re = new RegExp('(^|[^\\p{L}\\p{N}-])(' + escape(t.term) + ')(?![\\p{L}\\p{N}])', 'u');
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode: function (n) {
            for (var p = n.parentElement; p && p !== root; p = p.parentElement) {
              if (skip.test(p.tagName)) return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        });
        var node;
        while ((node = walker.nextNode())) {
          var m = re.exec(node.nodeValue);
          if (!m) continue;
          var start = m.index + m[1].length;
          var range = document.createRange();
          range.setStart(node, start);
          range.setEnd(node, start + m[2].length);
          var abbr = document.createElement('abbr');
          abbr.className = 'gl';
          abbr.tabIndex = 0;
          abbr.dataset.term = t.term;
          abbr.dataset.def = t.def;
          range.surroundContents(abbr);
          break;
        }
      });
    })
    .catch(function () {});

  // One shared tooltip, positioned in the viewport so that tables and other
  // scrolling containers never clip it.
  var tip = document.createElement('div');
  tip.className = 'gl-tip';
  tip.id = 'gl-tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.appendChild(tip);
  var show = function (abbr) {
    tip.textContent = '';
    var b = document.createElement('b');
    b.textContent = abbr.dataset.term;
    tip.appendChild(b);
    tip.appendChild(document.createTextNode(abbr.dataset.def));
    tip.hidden = false;
    abbr.setAttribute('aria-describedby', 'gl-tip');
    var r = abbr.getBoundingClientRect();
    var w = tip.offsetWidth;
    tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
    var above = r.top - tip.offsetHeight - 8;
    tip.style.top = (above > 8 ? above : r.bottom + 8) + 'px';
  };
  var hide = function () {
    tip.hidden = true;
  };
  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest && e.target.closest('abbr.gl');
    if (a) show(a);
    else hide();
  });
  document.addEventListener('focusin', function (e) {
    if (e.target.matches && e.target.matches('abbr.gl')) show(e.target);
  });
  document.addEventListener('focusout', hide);
  addEventListener('scroll', hide, { passive: true });
})();
