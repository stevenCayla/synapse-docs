// Reads the synced changelog page (Keep a Changelog format) and turns it into
// releases: "## `2.0.4`" / "## In progress (`Unreleased`)" sections with
// "### Added / Changed / Fixed" lists of bullets.
import fs from 'node:fs';

export type Kind = 'new' | 'imp' | 'fix' | 'sec';
export interface Entry {
  kind: Kind;
  html: string;
}
export interface Release {
  version: string;
  unreleased: boolean;
  /** ISO date of the release (root changelog only). */
  date?: string;
  /** Introduction paragraph of the release. */
  lede?: string;
  /** "Check before deployment" items. */
  warnings: string[];
  entries: Entry[];
}

const KINDS: Record<string, Kind> = {
  added: 'new',
  ajouté: 'new',
  changed: 'imp',
  modifié: 'imp',
  deprecated: 'imp',
  déprécié: 'imp',
  removed: 'imp',
  supprimé: 'imp',
  fixed: 'fix',
  corrigé: 'fix',
  security: 'sec',
  sécurité: 'sec',
};

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Minimal inline Markdown: `code`, **bold**, [text](url).
export function inline(md: string): string {
  return escapeHtml(md)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

export function parseChangelog(file: string): Release[] {
  const text = fs.readFileSync(file, 'utf8').replace(/^---[\s\S]*?---\n/, '');
  const releases: Release[] = [];
  let release: Release | undefined;
  let kind: Kind = 'imp';
  let entry: string[] | undefined;

  const flush = () => {
    if (release && entry) release.entries.push({ kind, html: inline(entry.join(' ').trim()) });
    entry = undefined;
  };

  for (const line of text.split('\n')) {
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);
    if (h2) {
      flush();
      const version = h2[1].match(/`(\d+\.\d+\.\d+|Unreleased)`/)?.[1];
      release = version ? { version, unreleased: version === 'Unreleased', warnings: [], entries: [] } : undefined;
      if (release) releases.push(release);
    } else if (h3 && release) {
      flush();
      kind = KINDS[h3[1].trim().toLowerCase()] ?? 'imp';
    } else if (release && /^- /.test(line)) {
      flush();
      entry = [line.slice(2)];
    } else if (release && entry && /^\s+\S/.test(line)) {
      entry.push(line.trim());
    } else if (release && entry && !line.trim()) {
      flush();
    }
  }
  flush();
  return releases.filter((r) => r.entries.length);
}

// Root CHANGELOG.md of the application (Keep a Changelog):
//   ## [3.1.0] - 2026-10-18, an introduction paragraph, then "### Added",
//   "### Changed", "### Fixed"… and "### ⚠️ …" blocks of deployment warnings.
export function parseRootChangelog(file: string): Release[] {
  const releases: Release[] = [];
  let release: Release | undefined;
  let mode: Kind | 'warn' | 'intro' | 'skip' = 'skip';
  let entry: string[] | undefined;

  const flush = () => {
    if (release && entry) {
      const html = inline(entry.join(' ').replace(/ (\d+\. )/g, '<br>$1').trim());
      if (mode === 'warn') release.warnings.push(html);
      else if (mode === 'new' || mode === 'imp' || mode === 'fix' || mode === 'sec') release.entries.push({ kind: mode, html });
    }
    entry = undefined;
  };

  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const h2 = line.match(/^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?/);
    const h3 = line.match(/^### (.+)$/);
    if (h2) {
      flush();
      release = { version: h2[1], unreleased: h2[1] === 'Unreleased', date: h2[2], warnings: [], entries: [] };
      releases.push(release);
      mode = 'intro';
    } else if (/^## /.test(line)) {
      flush();
      release = undefined;
    } else if (!release) {
      continue;
    } else if (h3) {
      flush();
      const name = h3[1].trim().toLowerCase();
      mode = h3[1].startsWith('⚠') ? (/incompatibles?/.test(name) || /à vérifier/.test(name) ? 'warn' : 'skip') : (KINDS[name] ?? 'imp');
    } else if (/^- /.test(line)) {
      flush();
      entry = [line.slice(2)];
    } else if (entry && /^\s+\S/.test(line)) {
      entry.push(line.trim());
    } else if (!line.trim()) {
      flush();
    } else if (mode === 'intro') {
      release.lede = `${release.lede ?? ''} ${line.trim()}`.trim();
    }
  }
  flush();
  return releases.filter((r) => r.entries.length || r.warnings.length);
}

