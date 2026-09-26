// Precomputes serialized MDX + frontmatter for all posts and pages at build time,
// so the Cloudflare Worker never needs `fs` at runtime.
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

async function build() {
  const { serialize } = await import('next-mdx-remote/serialize');

  const out = {};
  for (const dir of ['_posts', '_pages']) {
    const dirPath = path.join(process.cwd(), dir);
    const files = fs.existsSync(dirPath)
      ? fs.readdirSync(dirPath).filter((f) => /\.mdx?$/.test(f))
      : [];
    const items = [];
    for (const file of files) {
      const slug = file.replace(/\.mdx?$/, '');
      const raw = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      const { data, content } = matter(raw);
      const mdxSource = await serialize(content, { scope: data });
      items.push({ slug, data, source: mdxSource });
    }
    out[dir] = items;
  }

  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'posts-data.json'),
    JSON.stringify(out['_posts'])
  );
  fs.writeFileSync(
    path.join(dataDir, 'pages-data.json'),
    JSON.stringify(out['_pages'])
  );
  console.log(
    `Precomputed ${out['_posts'].length} posts and ${out['_pages'].length} pages.`
  );
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
