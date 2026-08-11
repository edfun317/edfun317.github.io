// Loads and parses the markdown articles in /_posts at build time.
const rawModules = import.meta.glob('../_posts/*.md', { query: '?raw', import: 'default', eager: true });

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const [, fm, content] = match;
  const data = {};
  fm.split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key === 'tags') {
      data.tags = value.split(/\s+/).filter(Boolean);
    } else if (key === 'featured') {
      data.featured = value === 'true';
    } else {
      data[key] = value;
    }
  });
  return { data, content: content.trim() };
}

// Curated subset of _posts shown on the site, grouped into broad categories.
// Only articles explicitly listed here appear on the site. Edit this map to
// add/remove articles or move one into a different category.
const CURATION = {
  'gcp-pubsub-core-concepts': 'gcp',
  'gcp-pubsub-subscription-mechanism': 'gcp'
};

export const categories = ['gcp'];

export const posts = Object.entries(rawModules)
  .map(([path, raw]) => {
    const filename = path.split('/').pop().replace(/\.md$/, '');
    const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const { data, content } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date || filename.slice(0, 10),
      tags: data.tags || [],
      category: CURATION[slug] || null,
      content
    };
  })
  .filter((p) => p.category)
  .sort((a, b) => new Date(b.date) - new Date(a.date));
