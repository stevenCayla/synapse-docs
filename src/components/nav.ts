// Navigation helpers shared by the header (section tabs) and the sidebar.
type Entry = {
  type: 'link' | 'group';
  href?: string;
  isCurrent?: boolean;
  label: string;
  entries?: Entry[];
};

// Top-level groups of the sidebar config are the sections of the site.
export const getSections = (sidebar: Entry[]) => sidebar.filter((e) => e.type === 'group');

export const containsCurrent = (entry: Entry): boolean =>
  entry.type === 'link' ? !!entry.isCurrent : !!entry.entries?.some(containsCurrent);

// First reachable URL of a section (target of its tab).
export const firstLink = (entry: Entry): string | undefined => {
  if (entry.type === 'link') return entry.href;
  for (const child of entry.entries ?? []) {
    const href = firstLink(child);
    if (href) return href;
  }
  return undefined;
};

export const activeSectionIndex = (sections: Entry[]) => {
  const i = sections.findIndex((s) => s.entries?.some(containsCurrent));
  return i === -1 ? 0 : i;
};

// Position of the current page in the sidebar: the chain of groups that
// contain it (the first one is the section) and its sibling links.
export function findTrail(sidebar: Entry[]) {
  const walk = (entries: Entry[], trail: Entry[]): { trail: Entry[]; siblings: Entry[] } | undefined => {
    for (const e of entries) {
      if (e.type === 'link' && e.isCurrent) return { trail, siblings: entries.filter((x) => x.type === 'link') };
      if (e.type === 'group') {
        const found = walk(e.entries ?? [], [...trail, e]);
        if (found) return found;
      }
    }
    return undefined;
  };
  return walk(sidebar, []);
}
