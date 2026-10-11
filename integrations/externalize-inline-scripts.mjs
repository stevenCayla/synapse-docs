import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Production enforces the CSP "script-src 'self'": every inline <script> is
// blocked there (language/theme selectors, search shortcut, sidebar state
// restore…). After the build, each executable inline script is moved into
// /_astro/inline.<hash>.js and replaced by <script src>.
// An external classic script stays blocking and a module stays deferred, so
// execution order and timing are unchanged.
const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const JS_TYPES = new Set(['', 'text/javascript', 'module']);

async function* htmlFiles(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

export default function externalizeInlineScripts() {
  return {
    name: 'externalize-inline-scripts',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const assetsDir = path.join(outDir, '_astro');
        await fs.mkdir(assetsDir, { recursive: true });
        const written = new Set();
        let count = 0;

        for await (const file of htmlFiles(outDir)) {
          const html = await fs.readFile(file, 'utf8');
          const pending = [];
          const out = html.replace(SCRIPT_RE, (tag, attrs, code) => {
            const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? '').toLowerCase();
            if (/\bsrc\s*=/i.test(attrs) || !code.trim() || !JS_TYPES.has(type)) return tag;
            const hash = createHash('sha256').update(code).digest('hex').slice(0, 10);
            const name = `inline.${hash}.js`;
            if (!written.has(name)) {
              written.add(name);
              pending.push(fs.writeFile(path.join(assetsDir, name), code));
            }
            count++;
            return `<script${attrs} src="/_astro/${name}"></script>`;
          });
          await Promise.all(pending);
          if (out !== html) await fs.writeFile(file, out);
        }

        logger.info(`${count} inline script(s) externalized into ${written.size} file(s).`);
      },
    },
  };
}
