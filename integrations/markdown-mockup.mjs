// Markdown plugin (Sätteri, mdast): gives the application's pages the markup of
// the Synapse Docs design without touching their Markdown, which belongs to the
// application repository:
//  - a "prerequisites" table (Tool | Version | Role) becomes a grid of cards;
//  - a blockquote becomes an aside (note; a leading warning sign makes it a
//    caution, a leading light bulb a tip), except in the audit pages.
import { defineMdastPlugin } from 'satteri';

const ICONS = {
  note: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 16v-4', 'M12 8h.01'],
  tip: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z'],
  caution: ['M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z', 'M12 9v4', 'M12 17h.01'],
};
const icon = (kind) =>
  `<svg class="sy-aside-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[kind].map((d) => `<path d="${d}"/>`).join('')}</svg>`;

const plain = (n) => (n.type === 'text' || n.type === 'inlineCode' ? n.value : (n.children || []).map(plain).join(''));
const box = (tag, className, children) => ({ type: 'blockquote', data: { hName: tag, hProperties: { className } }, children });

export default function mockupPlugin(ctx) {
  const path = ctx.fileURL ? decodeURIComponent(ctx.fileURL.pathname) : '';
  const inAudit = /\/content\/docs\/(en\/)?audit\//.test(path);
  return defineMdastPlugin({
    name: 'synapse-mockup',
    table(node, c) {
      const [head, ...rows] = node.children;
      const names = head.children.map((cell) => plain(cell).trim());
      if (!/^(outil|tool)$/i.test(names[0]) || !/^version$/i.test(names[1] || '') || !rows.length) return;
      const cards = rows.map((row) => {
        const [name, version, role] = row.children;
        const kids = [{ type: 'paragraph', data: { hName: 'b' }, children: name.children }];
        if (version) kids.push({ type: 'paragraph', data: { hName: 'span' }, children: version.children });
        if (role && plain(role).trim()) kids.push({ type: 'paragraph', data: { hName: 'small' }, children: role.children });
        return box('div', ['req'], kids);
      });
      c.replaceNode(node, box('div', ['reqs'], cards));
    },
    blockquote(node, c) {
      if (inAudit || node.data?.hName) return;
      const first = node.children[0];
      const lead = first?.type === 'paragraph' ? first.children[0] : undefined;
      // The language switch line stays a plain quote.
      if (lead?.type === 'text' && lead.value.startsWith('🌐')) return;
      let kind = 'note';
      if (lead?.type === 'text') {
        const m = lead.value.match(/^\s*(⚠️?|💡)\s*/u);
        if (m) {
          kind = m[1].startsWith('⚠') ? 'caution' : 'tip';
          c.setProperty(lead, 'value', lead.value.slice(m[0].length));
        }
      }
      c.setProperty(node, 'data', { hName: 'div', hProperties: { className: ['aside', kind], role: 'note' } });
      c.prependChild(node, { type: 'html', value: icon(kind) });
    },
  });
}
