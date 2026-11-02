// Search engine hints added to the <head> of every page (Starlight route middleware):
// - archived versions are not indexed, so that only the current documentation ranks;
// - structured data (JSON-LD): the site on the home page, an article on the other pages.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import versions from '../versions.json';

const SITE = 'https://docs.synapse-medical.fr';
const NAME = 'Synapse Medical';

const slugs = versions.map((v: { slug: string }) => v.slug.replace(/\./g, '\\.'));
const archived = new RegExp(`^/(en/)?(${slugs.join('|')})(/|$)`);
const home = /^\/(en\/)?$/;
// Not documentation articles: protected or printable pages and the 404.
const skipped = /^\/(en\/)?(recette|fiches|sheets|404)(\/|$)/;

const jsonLd = (data: unknown) => ({
  tag: 'script' as const,
  attrs: { type: 'application/ld+json' },
  // "<" is escaped so that the data can never close the script element.
  content: JSON.stringify(data).replace(/</g, '\\u003c'),
});

export const onRequest = defineRouteMiddleware((context) => {
  const { pathname } = context.url;
  const { head, entry } = context.locals.starlightRoute;
  const isEn = pathname.startsWith('/en/');
  const inLanguage = isEn ? 'en' : 'fr';

  if (archived.test(pathname)) {
    head.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, follow' } });
    return;
  }
  if (skipped.test(pathname)) return;

  const url = new URL(pathname, SITE).href;
  const publisher = { '@type': 'Organization', name: NAME, url: SITE };
  if (home.test(pathname)) {
    head.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: `${NAME} — Documentation`,
        url,
        inLanguage,
        publisher,
      }),
    );
    return;
  }
  head.push(
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: entry.data.title,
      ...(entry.data.description ? { description: entry.data.description } : {}),
      url,
      inLanguage,
      isPartOf: { '@type': 'WebSite', name: `${NAME} — Documentation`, url: SITE },
      publisher,
    }),
  );
});
