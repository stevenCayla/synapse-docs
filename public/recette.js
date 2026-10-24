// Acceptance test pages: copy the test file for a spreadsheet, and track the
// execution of a test book (REC-01) in the browser. Nothing leaves the page.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Test file: copy as tab-separated text. */
  var copy = $('#kitCopy');
  if (copy) {
    copy.addEventListener('click', function () {
      var text = $$('#kitTable tr').map(function (tr) {
        if (tr.classList.contains('empty')) return '';
        return $$('th,td', tr).map(function (c, i) {
          return tr.classList.contains('legend') && i === 0 ? '' : c.textContent.trim();
        }).join('\t');
      }).join('\n');
      var msg = $('#kitMsg');
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
        function () { msg.textContent = 'Copié. Collez en A1 dans Excel.'; },
        function () { msg.textContent = 'Copie impossible : sélectionnez le tableau.'; }
      );
    });
  }

  /* Test book: statuses and checked steps, kept in localStorage. */
  var cases = $$('.tc');
  if (!cases.length) return;
  var KEY = 'syn-docs-recette-REC-01';
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { state = {}; }
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

  var render = function () {
    var done = 0;
    cases.forEach(function (tc) {
      var s = state[tc.dataset.tc] || {};
      $('.tc-s', tc).value = s.status || '';
      tc.className = 'tc ' + (s.status || '');
      if (s.status) done++;
      $$('.steps-t tbody tr', tc).forEach(function (tr, i) {
        var box = $('input', tr);
        box.checked = !!(s.steps || [])[i];
        tr.classList.toggle('done', box.checked);
      });
    });
    $('#runProg').textContent = done + ' / ' + cases.length + ' cas exécutés';
    save();
  };

  cases.forEach(function (tc) {
    var id = tc.dataset.tc;
    $('.tc-s', tc).addEventListener('change', function (e) {
      (state[id] = state[id] || {}).status = e.target.value;
      render();
    });
    $$('.steps-t tbody input', tc).forEach(function (box, i) {
      box.addEventListener('change', function () {
        var s = (state[id] = state[id] || {});
        (s.steps = s.steps || [])[i] = box.checked;
        render();
      });
    });
  });

  $('#runReset').addEventListener('click', function () {
    state = {};
    render();
  });
  $('#runExport').addEventListener('click', function () {
    var label = { ok: 'Conforme', ko: 'Non conforme', na: 'Bloqué', '': 'Non exécuté' };
    var text = 'PV de recette — ' + document.title.split(' | ')[0] + '\n' + new Date().toISOString() + '\n\n' +
      cases.map(function (tc) {
        return tc.dataset.tc + ' — ' + $('.tc-h b', tc).textContent + ' : ' + label[(state[tc.dataset.tc] || {}).status || ''];
      }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = 'PV-REC-01.txt';
    a.click();
  });
  render();
})();
