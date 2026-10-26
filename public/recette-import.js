// REC-01b · Prospective study with import (src/components/recette-import/).
// Read mode / run mode, status of each check (OK, KO, Blocked) with a note,
// progress rail, text report, printable report (PV) and the test file as a
// real .xlsx. Everything stays in the browser (localStorage); nothing is sent.
(function () {
  var root = document.getElementById('recImp');
  if (!root) return;
  var en = root.getAttribute('data-lang') === 'en';
  var KEY = 'syn-docs-recette-REC-01b';
  var MODE_KEY = KEY + '-mode';
  var COMMIT = root.getAttribute('data-commit') || '';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var T = en
    ? {
        label: { ok: 'OK', ko: 'KO', na: 'Blocked' },
        progress: function (n, t, ko, na) { return '<b>' + n + '</b> / ' + t + ' checks' + (ko ? ' · <span class="ko">' + ko + ' KO</span>' : '') + (na ? ' · <span class="na">' + na + ' blocked</span>' : ''); },
        stepLabel: function (i, n, t) { return 'Step ' + i + (t ? ', ' + n + ' of ' + t : ''); },
        notePre: function (i, title, text) { return 'Step ' + i + ' · ' + title + '\nCheck: ' + text + '\nWhat I did: \nWhat happened: \nTime: '; },
        nowField: 'What I did: ',
        allSet: 'Every check has a status',
        confirmReset: 'Erase all statuses and comments of this session?',
        reportCopied: 'Report copied',
        copyFail: 'Copy failed',
        tableCopied: 'Copied: paste into A1, then colour the headers',
        valCopied: function (v) { return '“' + v + '” copied'; },
        xlsxDone: 'Test file downloaded',
        popup: 'Allow pop-ups to generate the report',
        locale: 'en-GB',
        repTitle: 'ACCEPTANCE TEST REPORT — REC-01b · Prospective study with import',
        tester: 'Tester', date: 'Date', env: 'Environment', commit: 'Commit / version', browser: 'Browser',
        summary: function (s) { return s.ok + ' OK · ' + s.ko + ' KO · ' + s.na + ' blocked · ' + s.ne + ' not run (out of ' + s.tot + ')'; },
        summaryLabel: 'Summary',
        pvTitle: 'Acceptance test report — REC-01b',
        pvSub: 'Prospective study with import · Synapse EDC',
        issued: 'Issue date',
        verdict: 'Verdict',
        verdicts: { ko: 'Non-compliant', ne: 'Incomplete', ok: 'Compliant' },
        check: 'Check', status: 'Status', notRun: 'Not run',
        sig: ['Tester', 'Data Manager', 'Quality Assurance'],
        sigLine: 'Name, date, signature',
        fileName: 'acceptance-REC-01b-patients.xlsx',
        pvSummary: function (s) { return '<b>' + s.ok + '</b> OK · <b>' + s.ko + '</b> KO · <b>' + s.na + '</b> blocked · <b>' + s.ne + '</b> not run (out of ' + s.tot + ')'; },
      }
    : {
        label: { ok: 'OK', ko: 'KO', na: 'Bloqué' },
        progress: function (n, t, ko, na) { return '<b>' + n + '</b> / ' + t + ' vérifications' + (ko ? ' · <span class="ko">' + ko + ' KO</span>' : '') + (na ? ' · <span class="na">' + na + ' bloquée' + (na > 1 ? 's' : '') + '</span>' : ''); },
        stepLabel: function (i, n, t) { return 'Étape ' + i + (t ? ', ' + n + ' sur ' + t : ''); },
        notePre: function (i, title, text) { return 'Étape ' + i + ' · ' + title + '\nVérification : ' + text + "\nCe que j'ai fait : \nCe qui s'est passé : \nHeure : "; },
        nowField: "Ce que j'ai fait : ",
        allSet: 'Toutes les vérifications ont un statut',
        confirmReset: 'Effacer tous les statuts et commentaires de cette session ?',
        reportCopied: 'Rapport copié',
        copyFail: 'Copie impossible',
        tableCopied: 'Copié : collez en A1, puis colorez les en-têtes',
        valCopied: function (v) { return '« ' + v + ' » copié'; },
        xlsxDone: 'Fichier de test téléchargé',
        popup: 'Autorisez les fenêtres pop-up pour générer le PV',
        locale: 'fr-FR',
        repTitle: 'RAPPORT DE RECETTE — REC-01b · Étude prospective avec import',
        tester: 'Testeur', date: 'Date', env: 'Environnement', commit: 'Commit / version', browser: 'Navigateur',
        summary: function (s) { return s.ok + ' OK · ' + s.ko + ' KO · ' + s.na + ' bloquées · ' + s.ne + ' non exécutées (sur ' + s.tot + ')'; },
        summaryLabel: 'Synthèse',
        pvTitle: 'PV de recette — REC-01b',
        pvSub: 'Étude prospective avec import · Synapse EDC',
        issued: "Date d'édition",
        verdict: 'Verdict',
        verdicts: { ko: 'Non conforme', ne: 'Incomplet', ok: 'Conforme' },
        check: 'Vérification', status: 'Statut', notRun: 'Non exécuté',
        sig: ['Testeur', 'Data Manager', 'Assurance Qualité'],
        sigLine: 'Nom, date, signature',
        fileName: 'recette-REC-01b-patients.xlsx',
        pvSummary: function (s) { return '<b>' + s.ok + '</b> OK · <b>' + s.ko + '</b> KO · <b>' + s.na + '</b> bloquées · <b>' + s.ne + '</b> non exécutées (sur ' + s.tot + ')'; },
      };

  /* State, kept in localStorage. */
  var ST = { m: {}, c: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    ST.m = saved.m || {};
    ST.c = saved.c || {};
  } catch (e) { /* no storage: the page still works */ }
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) { /* ignore */ } };
  var forced = {}; // cards opened by hand
  var closed = {}; // cards closed by hand

  var plain = function (h) { return h.replace(/<[^>]+>/g, ''); };
  var toast = function (text) {
    var d = document.createElement('div');
    d.className = 'mmd-toast';
    d.setAttribute('role', 'status');
    d.textContent = text;
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 1800);
  };
  var browserName = function () {
    var m = navigator.userAgent.match(/(Firefox|Edg|Chrome|Safari)\/(\d+)/);
    return m ? ({ Edg: 'Edge' }[m[1]] || m[1]) + ' ' + m[2] : '—';
  };
  var copy = function (text, msg) {
    if (!navigator.clipboard) return toast(T.copyFail);
    navigator.clipboard.writeText(text).then(function () { toast(msg); }, function () { toast(T.copyFail); });
  };
  var cards = $$('.pc', root);
  var rail = $$('.prail button', root);
  var scrollToEl = function (el) {
    var y = el.getBoundingClientRect().top + window.scrollY - 210;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  /* Status of a card: none (no check), todo, part, ok, ko, na. */
  var cardState = function (card) {
    var boxes = $$('.pchk', card);
    if (!boxes.length) return ['none', 0, 0];
    var s = boxes.map(function (x) { return (ST.c[x.dataset.k] || {}).s; }).filter(Boolean);
    var st = s.indexOf('ko') > -1 ? 'ko' : s.indexOf('na') > -1 ? 'na' : s.length === boxes.length ? 'ok' : s.length ? 'part' : 'todo';
    return [st, s.length, boxes.length];
  };

  var spy = function () {
    if (!root.offsetParent) return;
    var cur = 0;
    cards.forEach(function (c, i) { if (c.getBoundingClientRect().top < 220) cur = i; });
    rail.forEach(function (b, i) { b.classList.toggle('cur', i === cur); });
  };

  var sync = function () {
    var exec = root.classList.contains('pexec');
    var tot = 0, set = 0, ko = 0, na = 0;
    $$('.pchk', root).forEach(function (x) {
      var s = ST.c[x.dataset.k] || {};
      x.className = 'pchk' + (s.s ? ' s-' + s.s : '');
      $$('.pseg button', x).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.s === s.s)); });
      var ta = $('.pnote', x);
      if (document.activeElement !== ta) ta.value = s.note || '';
      tot += 1;
      if (s.s) set += 1;
      if (s.s === 'ko') ko += 1;
      if (s.s === 'na') na += 1;
    });
    cards.forEach(function (c, i) {
      var r = cardState(c), st = r[0];
      c.classList.remove('todo', 'part', 'ok', 'ko', 'na');
      if (exec && st !== 'none') c.classList.add(st);
      $('.pc-p', c).textContent = r[2] ? r[1] + ' / ' + r[2] : '';
      var col = exec && (closed[i] || (st === 'ok' && !forced[i]));
      c.classList.toggle('col', !!col);
      $('.pc-h', c).setAttribute('aria-expanded', String(!col));
      rail[i].className = exec && st !== 'none' && st !== 'todo' ? st : '';
      rail[i].setAttribute('aria-label', T.stepLabel(i + 1, r[1], r[2]));
    });
    $('#piProg', root).innerHTML = T.progress(set, tot, ko, na);
    spy();
  };

  var setMode = function (m) {
    root.classList.toggle('pexec', m === 'exec');
    root.classList.toggle('pread', m !== 'exec');
    $$('.pmode button', root).forEach(function (b) {
      b.classList.toggle('on', b.dataset.m === m);
      b.setAttribute('aria-selected', String(b.dataset.m === m));
    });
    try { localStorage.setItem(MODE_KEY, m); } catch (e) { /* ignore */ }
    sync();
  };

  var openCard = function (i) {
    var c = $('#pc-' + (i + 1), root);
    if (!c) return null;
    forced[i] = true;
    delete closed[i];
    c.classList.remove('col');
    $('.pc-h', c).setAttribute('aria-expanded', 'true');
    return c;
  };

  /* Rows of the report: one per check. */
  var rows = function () {
    return $$('.pchk', root).map(function (x) {
      var i = +x.dataset.si, s = ST.c[x.dataset.k] || {};
      return { step: (i + 1) + '. ' + plain($('#pc-' + (i + 1) + ' .pc-h b', root).innerHTML), text: $('.pchk-t', x).textContent, s: s.s || '', note: s.note || '' };
    });
  };
  var summary = function (r) {
    var n = function (v) { return r.filter(function (x) { return x.s === v; }).length; };
    return { ok: n('ok'), ko: n('ko'), na: n('na'), ne: r.filter(function (x) { return !x.s; }).length, tot: r.length };
  };
  var meta = function () {
    return {
      tester: ST.m.tester || '—',
      env: ST.m.env || 'uat-app.synapse-medical.fr',
      commit: ST.m.commit || COMMIT,
      browser: ST.m.browser || browserName(),
    };
  };

  var report = function () {
    var r = rows(), m = meta(), sm = summary(r);
    var L = [T.repTitle, T.tester + ' : ' + m.tester, T.date + ' : ' + new Date().toLocaleString(T.locale), T.env + ' : ' + m.env, T.commit + ' : ' + m.commit, T.browser + ' : ' + m.browser, T.summaryLabel + ' : ' + T.summary(sm), ''];
    var last;
    r.forEach(function (x) {
      if (x.step !== last) { L.push(x.step); last = x.step; }
      L.push('  [' + (x.s ? T.label[x.s] : '—') + '] ' + x.text);
      if (x.note) L.push(x.note.split('\n').map(function (l) { return '      ' + l; }).join('\n'));
    });
    return L.join('\n');
  };

  var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  var pv = function () {
    var r = rows(), m = meta(), sm = summary(r);
    var colour = { ok: '#1f7a3d', ko: '#b42318', na: '#9a5b00', '': '#777' };
    var last, body = r.map(function (x) {
      var head = x.step !== last ? '<tr class="st"><td colspan="2">' + esc(x.step) + '</td></tr>' : '';
      last = x.step;
      return head + '<tr><td>' + esc(x.text) + (x.note ? '<div class="nt">' + esc(x.note) + '</div>' : '') + '</td><td style="color:' + colour[x.s] + ';font-weight:700">' + (x.s ? T.label[x.s] : T.notRun) + '</td></tr>';
    }).join('');
    var verdict = sm.ko || sm.na ? T.verdicts.ko : sm.ne ? T.verdicts.ne : T.verdicts.ok;
    var html = '<!doctype html><html lang="' + (en ? 'en' : 'fr') + '"><head><meta charset="utf-8"><title>' + T.pvTitle + '</title><style>@page{size:A4;margin:16mm}body{font:11pt/1.45 system-ui,sans-serif;color:#111}h1{font-size:18pt;margin:0 0 4px}.sub{color:#555;margin:0 0 14px}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ccc;padding:5px 8px;text-align:left;vertical-align:top}th{background:#f3f3f6;font-size:9.5pt}.meta td:first-child{width:32%;color:#555}tr.st td{background:#f3f3f6;font-weight:700}.nt{margin-top:4px;font:9pt/1.4 ui-monospace,monospace;white-space:pre-wrap;color:#444}.sig{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px;break-inside:avoid}.sig div{border:1px solid #ccc;padding:8px;height:80px;font-size:9.5pt;color:#555}</style></head><body>' +
      '<h1>' + T.pvTitle + '</h1><p class="sub">' + T.pvSub + '</p><table class="meta">' +
      '<tr><td>' + T.tester + '</td><td>' + esc(m.tester) + '</td></tr>' +
      '<tr><td>' + T.issued + '</td><td>' + new Date().toLocaleString(T.locale) + '</td></tr>' +
      '<tr><td>' + T.env + '</td><td>' + esc(m.env) + '</td></tr>' +
      '<tr><td>' + T.commit + '</td><td>' + esc(m.commit) + '</td></tr>' +
      '<tr><td>' + T.browser + '</td><td>' + esc(m.browser) + '</td></tr>' +
      '<tr><td>' + T.summaryLabel + '</td><td>' + T.pvSummary(sm) + '</td></tr>' +
      '<tr><td>' + T.verdict + '</td><td><b>' + verdict + '</b></td></tr></table>' +
      '<table><thead><tr><th>' + T.check + '</th><th style="width:18%">' + T.status + '</th></tr></thead><tbody>' + body + '</tbody></table>' +
      '<div class="sig">' + T.sig.map(function (s) { return '<div>' + s + '<br>' + T.sigLine + '</div>'; }).join('') + '</div></body></html>';
    var w = window.open('', '_blank');
    if (!w) return toast(T.popup);
    w.document.write(html);
    w.document.close();
    // The print is triggered from here: an inline script would be blocked by the CSP.
    setTimeout(function () { w.focus(); w.print(); }, 300);
  };

  /* Test file as a real .xlsx: a minimal zip (stored entries), no dependency. */
  var crcTable = (function () {
    var t = [];
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  var crc32 = function (b) {
    var c = 0xffffffff;
    for (var i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  var zip = function (files) {
    var enc = new TextEncoder(), parts = [], central = [], offset = 0;
    var u16 = function (v) { return [v & 255, (v >> 8) & 255]; };
    var u32 = function (v) { return [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255]; };
    var date = ((2026 - 1980) << 9) | (10 << 5) | 23;
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = enc.encode(f.data), crc = crc32(data);
      var common = [].concat(u16(20), u16(0x800), u16(0), u16(0), u16(date), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      var local = new Uint8Array([].concat(u32(0x04034b50), common));
      parts.push(local, name, data);
      var cen = new Uint8Array([].concat(u32(0x02014b50), u16(20), common, u16(0), u16(0), u16(0), u32(0), u32(offset)));
      central.push(cen, name);
      offset += local.length + name.length + data.length;
    });
    var size = central.reduce(function (a, p) { return a + p.length; }, 0);
    var end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(size), u32(offset), u16(0)));
    return new Blob(parts.concat(central, [end]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };
  var xe = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var tableData = function () {
    var table = $('.tdata', root);
    var heads = $$('thead th', table);
    var body = $$('tbody tr', table);
    return {
      headers: heads.map(function (h) { return h.textContent; }),
      groups: heads.map(function (h) { return +(h.className.match(/g(\d)/) || [0, 0])[1]; }),
      rows: body.filter(function (tr) { return !tr.classList.contains('leg') && $$('td', tr).length > 1; }).map(function (tr) { return $$('td', tr).map(function (td) { return td.textContent; }); }),
      legend: $$('td', $('tr.leg', table)).map(function (td, i) { return i ? td.textContent : ''; }),
    };
  };
  var xlsx = function () {
    var d = tableData();
    var col = function (i) { return String.fromCharCode(65 + i); };
    var cell = function (r, i, val, s) {
      if (val === '') return '';
      var ref = col(i) + r, m = val.match(/^(\d\d)\/(\d\d)\/(\d{4})$/);
      if (m) return '<c r="' + ref + '" s="5"><v>' + (Date.UTC(+m[3], m[2] - 1, +m[1]) - Date.UTC(1899, 11, 30)) / 864e5 + '</v></c>';
      if (s === undefined && /^-?\d+(,\d+)?$/.test(val)) return '<c r="' + ref + '"><v>' + val.replace(',', '.') + '</v></c>';
      return '<c r="' + ref + '" t="inlineStr"' + (s ? ' s="' + s + '"' : '') + '><is><t>' + xe(val) + '</t></is></c>';
    };
    var sheetRows = ['<row r="1">' + d.headers.map(function (h, i) { return cell(1, i, h, 1 + d.groups[i]); }).join('') + '</row>']
      .concat(d.rows.map(function (r, j) { return '<row r="' + (j + 2) + '">' + r.map(function (v, i) { return cell(j + 2, i, v); }).join('') + '</row>'; }))
      .concat(['<row r="' + (d.rows.length + 3) + '">' + d.legend.map(function (v, i) { return cell(d.rows.length + 3, i, v, 6); }).join('') + '</row>']);
    var NS = 'http://schemas.openxmlformats.org';
    var xf = function (f, fi, n) { return '<xf numFmtId="' + (n || 0) + '" fontId="' + f + '" fillId="' + fi + '" borderId="0" xfId="0"' + (f ? ' applyFont="1"' : '') + (fi ? ' applyFill="1"' : '') + (n ? ' applyNumberFormat="1"' : '') + '/>'; };
    var fill = function (c) { return '<fill><patternFill patternType="solid"><fgColor rgb="FF' + c + '"/><bgColor indexed="64"/></patternFill></fill>'; };
    var head = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    var blob = zip([
      { name: '[Content_Types].xml', data: head + '<Types xmlns="' + NS + '/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
      { name: '_rels/.rels', data: head + '<Relationships xmlns="' + NS + '/package/2006/relationships"><Relationship Id="rId1" Type="' + NS + '/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: head + '<workbook xmlns="' + NS + '/spreadsheetml/2006/main" xmlns:r="' + NS + '/officeDocument/2006/relationships"><sheets><sheet name="Patients" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: head + '<Relationships xmlns="' + NS + '/package/2006/relationships"><Relationship Id="rId1" Type="' + NS + '/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="' + NS + '/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/styles.xml', data: head + '<styleSheet xmlns="' + NS + '/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><i/><sz val="10"/><color rgb="FF666666"/><name val="Calibri"/></font></fonts><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' + fill('DBE8FB') + fill('DCF1DE') + fill('FDE7CF') + '</fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="7">' + xf(0, 0) + xf(1, 0) + xf(1, 2) + xf(1, 3) + xf(1, 4) + xf(0, 0, 164) + xf(2, 0) + '</cellXfs></styleSheet>' },
      { name: 'xl/worksheets/sheet1.xml', data: head + '<worksheet xmlns="' + NS + '/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="17" width="17" customWidth="1"/></cols><sheetData>' + sheetRows.join('') + '</sheetData></worksheet>' },
    ]);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = T.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    toast(T.xlsxDone);
  };

  /* Session fields. */
  $$('.psess input', root).forEach(function (x) {
    var k = x.dataset.m;
    if (ST.m[k]) x.value = ST.m[k];
    else if (k === 'browser') x.value = browserName();
    x.addEventListener('input', function () { ST.m[k] = x.value; save(); });
  });
  $$('.pc .val', root).forEach(function (x) { x.title = en ? 'Click to copy' : 'Cliquer pour copier'; });

  var mode = 'read';
  try { mode = localStorage.getItem(MODE_KEY) || 'read'; } catch (e) { /* ignore */ }
  setMode(mode);

  root.addEventListener('click', function (e) {
    var t = e.target;
    var mb = t.closest('.pmode button');
    if (mb) return setMode(mb.dataset.m);

    var tb = t.closest('.ptabs button');
    if (tb) {
      var box = tb.closest('.pc-b');
      $$('.ptabs button', box).forEach(function (y) {
        y.classList.toggle('on', y === tb);
        y.setAttribute('aria-selected', String(y === tb));
      });
      $$(':scope > .ppane', box).forEach(function (pane) { pane.classList.toggle('on', pane.dataset.p === tb.dataset.t); });
      return;
    }
    var pl = t.closest('.ppills button');
    if (pl) {
      var pn = pl.closest('.ppane');
      $$('.ppills button', pn).forEach(function (y) { y.classList.toggle('on', y === pl); });
      $$('.pfig', pn).forEach(function (f) { f.classList.toggle('on', f.dataset.f === pl.dataset.sh); });
      return;
    }

    var sb = t.closest('.pseg button');
    if (sb) {
      var x = sb.closest('.pchk'), key = x.dataset.k, cur = ST.c[key] || {}, s = sb.dataset.s;
      if (cur.s === s) delete cur.s;
      else {
        cur.s = s;
        if (s !== 'ok' && !cur.note) {
          var i = +x.dataset.si;
          cur.note = T.notePre(i + 1, plain($('#pc-' + (i + 1) + ' .pc-h b', root).innerHTML), $('.pchk-t', x).textContent) + new Date().toLocaleTimeString(T.locale, { hour: '2-digit', minute: '2-digit' });
        }
      }
      ST.c[key] = cur;
      save();
      var card = x.closest('.pc'), ci = +card.dataset.i;
      var done = cardState(card)[0] === 'ok' && !forced[ci];
      sync();
      if (done) {
        var next = $('#pc-' + (ci + 2), root);
        if (next) scrollToEl(next);
      }
      if (s !== 'ok' && cur.s) {
        var ta = $('.pnote', x), at = ta.value.indexOf(T.nowField);
        ta.focus();
        if (at > -1) ta.setSelectionRange(at + T.nowField.length, at + T.nowField.length);
      }
      return;
    }

    var h = t.closest('.pc-h');
    if (h && root.classList.contains('pexec')) {
      var c = h.closest('.pc'), idx = +c.dataset.i;
      if (c.classList.contains('col')) { forced[idx] = true; delete closed[idx]; }
      else { closed[idx] = true; delete forced[idx]; }
      return sync();
    }

    var g = t.closest('[data-go]');
    if (g && root.contains(g) && /^\d+$/.test(g.dataset.go)) {
      e.preventDefault();
      var target = openCard(+g.dataset.go);
      if (target) { scrollToEl(target); sync(); }
      return;
    }

    var val = t.closest('.pc .val');
    if (val) return copy(val.textContent.trim(), T.valCopied(val.textContent.trim()));

    if (t.closest('#piResume')) {
      var todo = $$('.pchk', root).filter(function (y) { return !(ST.c[y.dataset.k] || {}).s; })[0];
      if (!todo) return toast(T.allSet);
      var cc = openCard(+todo.dataset.si);
      sync();
      scrollToEl(cc);
      if (todo.animate) todo.animate([{ background: 'var(--sy-accent-soft)' }, { background: 'transparent' }], { duration: 1400 });
      return;
    }
    if (t.closest('#piReset')) {
      if (confirm(T.confirmReset)) { ST.c = {}; save(); forced = {}; closed = {}; sync(); }
      return;
    }
    if (t.closest('#piCopyRep')) return copy(report(), T.reportCopied);
    if (t.closest('#piPV')) return pv();
    if (t.closest('#pi-xlsx')) return xlsx();
    if (t.closest('#pi-copy')) {
      var d = tableData();
      return copy([d.headers.join('\t')].concat(d.rows.map(function (r) { return r.join('\t'); }), [''], [d.legend.join('\t')]).join('\n'), T.tableCopied);
    }
  });
  root.addEventListener('input', function (e) {
    var ta = e.target.closest('.pnote');
    if (!ta) return;
    var key = ta.closest('.pchk').dataset.k;
    (ST.c[key] = ST.c[key] || {}).note = ta.value;
    save();
  });
  window.addEventListener('scroll', spy, { passive: true });
})();
