// Glossary terms for the tooltips of the guides (public/glossary.js). The
// glossary page is the single source: lines "- **TERM** — definition".
import fs from 'node:fs';

export function glossaryResponse(file: string) {
  const terms = fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .flatMap((line) => {
      const m = line.match(/^- \*\*(.+?)\*\* — (.+)$/);
      return m ? [{ term: m[1], def: m[2] }] : [];
    });
  return new Response(JSON.stringify(terms), {
    headers: { 'Content-Type': 'application/json' },
  });
}
