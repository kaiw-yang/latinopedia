/* Shared numbered citations. Only connect existing markers or exact source URLs. */
(function () {
  const boxSelector = '.ref-box, .br-bibliography, #refs .refs';
  function marker(text) { return text.trim().match(/^\[([A-Z]*\d+)\]/)?.[1] || null; }
  function jump(id) {
    const target = document.getElementById(id);
    if (!target) return;
    for (let p = target.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
    target.scrollIntoView({behavior: 'smooth', block: 'center'});
    target.classList.remove('cite-flash');
    void target.offsetWidth;
    target.classList.add('cite-flash');
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  }
  function link(number, id, back) {
    const a = document.createElement('a');
    a.className = back ? 'cite-back' : 'cite-ref';
    a.href = '#' + id;
    a.innerHTML = '<strong>[' + number + ']</strong>';
    a.setAttribute('aria-label', (back ? '返回正文引用 ' : '跳转到参考文献 ') + number);
    a.addEventListener('click', e => { e.preventDefault(); jump(id); });
    return a;
  }
  window.LatinopediaCitations = function (scope) {
    if (!scope) return;
    const boxes = [...scope.querySelectorAll(boxSelector)].filter(b => !b.parentElement.closest(boxSelector));
    if (boxes.length && boxes.every(b => b.dataset.citationsReady)) return;
    const groups = boxes.map((box, bi) => {
      box.dataset.citationsReady = '1';
      let rows = [...box.querySelectorAll('.ref-item, li')].filter(r => !r.parentElement.closest('.ref-item, li'));
      if (!rows.length) rows = [...box.children].filter(r => r.tagName === 'A');
      const entries = rows.map((row, i) => {
        const n = i + 1, id = 'cite-ref-' + bi + '-' + n, oldId = row.id;
        const tag = row.querySelector('.ref-tag, .cite-back');
        const old = marker(tag?.textContent || row.textContent);
        const urls = [...row.querySelectorAll('a[href]')].map(a => a.href).filter(h => /^https?:/.test(h));
        if (row.tagName === 'A' && /^https?:/.test(row.href)) urls.push(row.href);
        // Keep titles and external links; remove only old bibliography labels.
        if (tag) tag.remove();
        const titleLink = row.tagName === 'A' ? row : row.querySelector('a');
        if (titleLink && marker(titleLink.textContent)) titleLink.textContent = titleLink.textContent.replace(/^\s*\[[A-Z]*\d+\]\s*/, '');
        let target = row;
        if (row.tagName === 'A') { target = document.createElement('div'); target.className = 'ref-item'; row.before(target); target.append(row); }
        target.id = id;
        const label = document.createElement('strong'); label.className = 'cite-num'; label.textContent = '[' + n + ']';
        target.prepend(label, document.createTextNode(' '));
        return {n, id, oldId, old, urls, label, first: null};
      });
      box.classList.add('numbered-references');
      return {box, entries, bi};
    });
    const candidates = [...scope.querySelectorAll('a[href]')].filter(a => !a.closest(boxSelector));
    for (const a of candidates) {
      const old = marker(a.textContent);
      const exactMarker = /^\s*\[[A-Z]*\d+\]\s*$/.test(a.textContent);
      const matches = groups.map(g => ({g, entry: g.entries.find(e => e.urls.includes(a.href))})).filter(x => x.entry);
      const following = g => Boolean(a.compareDocumentPosition(g.box) & Node.DOCUMENT_POSITION_FOLLOWING);
      let match;
      if (exactMarker) {
        const explicit = groups.map(g => ({g, entry:g.entries.find(e => e.oldId && a.getAttribute('href') === '#' + e.oldId)})).find(x => x.entry);
        const numbered = groups.filter(following).map(g => ({g, entry:g.entries.find(e => e.old === old)})).find(x => x.entry);
        match = explicit || numbered;
      }
      if (!match) match = matches.find(x => following(x.g)) || matches[0];
      if (!match) continue;
      const {entry, g} = match;
      const replacement = link(entry.n, entry.id, false);
      if (!entry.first) { replacement.id = 'cite-text-' + g.bi + '-' + entry.n; entry.first = replacement.id; }
      a.replaceWith(replacement);
    }
    for (const {entries} of groups) for (const entry of entries) if (entry.first) entry.label.replaceWith(link(entry.n, entry.first, true));
  };
  document.addEventListener('DOMContentLoaded', () => {
    const scope = document.getElementById('detailContent') || document.querySelector('main');
    window.LatinopediaCitations(scope);
  });
})();
