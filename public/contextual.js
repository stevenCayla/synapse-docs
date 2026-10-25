// Contextual help: a guide opened from the application can carry
//   ?step=N      scroll to the Nth step of the guide and highlight it
//   &from=app    show an "Opened from Synapse" banner
// Steps are the numbered headings ("1. Type d'étude", "11.2 Colonnes") of the page.
(function () {
  var params = new URLSearchParams(location.search);
  var content = document.querySelector('.sl-markdown-content');
  if (!content || !/\/guides\//.test(location.pathname)) return;
  var en = /^\/en\//.test(location.pathname);
  var hasStep = params.has('step');
  var fromApp = params.get('from') === 'app';
  if (!hasStep && !fromApp) return;

  var steps = Array.prototype.slice.call(content.querySelectorAll('h2')).filter(function (h) {
    return /^\d+(\.\d+)?\.?\s/.test(h.textContent.trim());
  });
  var step = hasStep ? steps[parseInt(params.get('step'), 10)] : undefined;

  if (fromApp) {
    var bar = document.createElement('div');
    bar.className = 'sy-ctx';
    bar.setAttribute('role', 'status');
    var msg = document.createElement('span');
    msg.textContent = (en ? 'Opened from Synapse' : 'Ouvert depuis Synapse') +
      (step ? (en ? ' · step highlighted' : ' · étape mise en évidence') : '');
    var link = document.createElement('a');
    link.href = location.pathname;
    link.textContent = en ? 'See the whole guide' : 'Voir tout le guide';
    bar.appendChild(msg);
    bar.appendChild(link);
    content.insertBefore(bar, content.firstChild);
  }
  if (step) {
    setTimeout(function () {
      step.scrollIntoView({ behavior: 'smooth', block: 'start' });
      step.classList.add('sy-flash');
    }, 150);
  }
})();
