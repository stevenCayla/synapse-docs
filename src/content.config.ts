import fs from 'node:fs';
import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { docsVersionsLoader } from 'starlight-versions/loader';

// The versions collection is only needed once a version is archived (see
// versions.json and astro.config.mjs).
const hasArchivedVersions = JSON.parse(fs.readFileSync('versions.json', 'utf8')).length > 0;

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // French UI strings of the plugins (starlight-versions has no French translation).
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  ...(hasArchivedVersions ? { versions: defineCollection({ loader: docsVersionsLoader() }) } : {}),
};
