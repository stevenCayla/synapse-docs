// Reads the synced changelog page (Keep a Changelog format) and turns it into
// releases: "## `2.0.4`" / "## In progress (`Unreleased`)" sections with
// "### Added / Changed / Fixed" lists of bullets.
import fs from 'node:fs';

export type Kind = 'new' | 'imp' | 'fix';
export interface Entry {
  kind: Kind;
  html: string;
}
export interface Release {
  version: string;
  unreleased: boolean;
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
  security: 'fix',
  sécurité: 'fix',
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
      release = version ? { version, unreleased: version === 'Unreleased', entries: [] } : undefined;
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
