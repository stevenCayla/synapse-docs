// Pages whose content is still being written: flagged with `wip: true` in the
// front matter, or (for the pages of the application) nearly empty.
import { getCollection, type CollectionEntry } from 'astro:content';

const MIN_WORDS = 60;
// Pages that are listings or generated, never flagged by their size.
const EXEMPT = /^(en\/)?(\d+\.\d+\/|changelog\/|audit\/)/;

const words = (body: string) =>
  body
    .replace(/^#.*$/gm, '')
    .split(/\s+/)
    .filter(Boolean).length;

export const isWip = (entry: CollectionEntry<'docs'>) =>
  entry.data.wip === true || (!EXEMPT.test(entry.id) && words(entry.body ?? '') < MIN_WORDS);

/** The page already says it is being written (an aside of its own). */
export const hasOwnNotice = (body = '') => /en cours de rédaction|work in progress|under construction/i.test(body);

export const entryHref = (id: string) => `/${id.replace(/\/?index$/, '')}/`.replace(/\/+/g, '/');

/** Hrefs of the pages being written. */
export async function wipHrefs() {
  return new Set((await getCollection('docs')).filter(isWip).map((e) => entryHref(e.id)));
}
