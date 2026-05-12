/**
 * AFEM Sitemap Builder
 *
 * Regenere `sitemap.xml` (a la racine du repo) en lisant toutes les pages
 * publiees dans Supabase. Appele apres chaque publication du daily bot.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://www.afem-edu.fr';

const STATIC_URLS = [
  { loc: '/',                      changefreq: 'daily',   priority: '1.0' },
  { loc: '/blog',                  changefreq: 'daily',   priority: '0.9' },
  { loc: '/facultes',              changefreq: 'weekly',  priority: '0.9' },
  { loc: '/prepas-medecine',       changefreq: 'weekly',  priority: '0.9' },
  { loc: '/coaching',              changefreq: 'monthly', priority: '0.8' },
  { loc: '/qui-sommes-nous',       changefreq: 'monthly', priority: '0.7' },
  { loc: '/simulateur',            changefreq: 'monthly', priority: '0.8' },
  { loc: '/quizz',                 changefreq: 'monthly', priority: '0.7' },
  { loc: '/calculateur-reussite',  changefreq: 'monthly', priority: '0.8' },
  { loc: '/qcm-medecine',          changefreq: 'weekly',  priority: '0.8' },
  { loc: '/prepa-diploma-sante',   changefreq: 'monthly', priority: '0.7' },
];

function isoDate(d) {
  if (!d) return new Date().toISOString().slice(0, 10);
  try { return new Date(d).toISOString().slice(0, 10); } catch { return new Date().toISOString().slice(0, 10); }
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  var parts = ['  <url>', '    <loc>' + ORIGIN + loc + '</loc>'];
  if (lastmod) parts.push('    <lastmod>' + lastmod + '</lastmod>');
  if (changefreq) parts.push('    <changefreq>' + changefreq + '</changefreq>');
  if (priority) parts.push('    <priority>' + priority + '</priority>');
  parts.push('  </url>');
  return parts.join('\n');
}

export async function buildSitemap(supabase, outputPath) {
  // Récupère toutes les pages publiées
  const { data, error } = await supabase
    .from('page_content')
    .select('page_slug, page_type, updated_at, published_at, published')
    .eq('published', true);
  if (error) throw error;

  const rows = data || [];
  const entries = [];

  // Statiques
  const today = new Date().toISOString().slice(0, 10);
  STATIC_URLS.forEach((u) => entries.push({ ...u, lastmod: today }));

  // Articles
  rows
    .filter((r) => r.page_type === 'article')
    .sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''))
    .forEach((r) => {
      entries.push({
        loc: '/' + r.page_slug,
        lastmod: isoDate(r.updated_at || r.published_at),
        changefreq: 'weekly',
        priority: '0.8',
      });
    });

  // Facultes
  rows
    .filter((r) => r.page_type === 'faculte')
    .sort((a, b) => a.page_slug.localeCompare(b.page_slug))
    .forEach((r) => {
      entries.push({
        loc: '/' + r.page_slug,
        lastmod: isoDate(r.updated_at),
        changefreq: 'monthly',
        priority: '0.7',
      });
    });

  // Prepas
  rows
    .filter((r) => r.page_type === 'prepa')
    .sort((a, b) => a.page_slug.localeCompare(b.page_slug))
    .forEach((r) => {
      entries.push({
        loc: '/' + r.page_slug,
        lastmod: isoDate(r.updated_at),
        changefreq: 'monthly',
        priority: '0.7',
      });
    });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries.map(urlEntry).join('\n'),
    '</urlset>',
    '',
  ].join('\n');

  await fs.writeFile(outputPath, xml, 'utf8');
  return { path: outputPath, count: entries.length };
}
