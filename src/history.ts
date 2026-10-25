// Edit history of a page, read from the git log of its source file at build
// time (same source as the "last updated" date). Automatic commits (sync,
// dependency bots) are left out: only people are listed.
import { execFileSync } from 'node:child_process';

export type Revision = { author: string; date: Date; sha: string; subject: string };

const cache = new Map<string, Revision[]>();

export function pageHistory(file: string, max = 8): Revision[] {
  const hit = cache.get(file);
  if (hit) return hit.slice(0, max);
  let out = '';
  try {
    out = execFileSync('git', ['log', '--follow', '--format=%an%x1f%aI%x1f%h%x1f%s', '--', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    // Not a git checkout (source archive): no history.
  }
  const revisions = out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [author, iso, sha, subject] = line.split('\x1f');
      return { author, date: new Date(iso), sha, subject: subject.replace(/^[a-z]+(\([^)]*\))?!?:\s*/, '') };
    })
    .filter((r) => !/\[bot\]$/.test(r.author));
  cache.set(file, revisions);
  return revisions.slice(0, max);
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w.match(/\p{L}/u)?.[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Stable hue per person, like the avatars of the design.
export const hue = (name: string) => [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 360;
