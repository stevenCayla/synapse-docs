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
