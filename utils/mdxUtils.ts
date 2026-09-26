// Workers-compatible post/page loading: all content is precomputed at build time
// into data/posts-data.json and data/pages-data.json (see scripts/precompute-posts.js).
import postsData from '../data/posts-data.json';
import pagesData from '../data/pages-data.json';

// structure of items
type Items = {
  // each post has a parameter key that takes the value of a string
  [key: string]: string;
};

// structure of a post
type Post = {
  data: {
    // each post has a parameter key that takes the value of a string
    [key: string]: string;
  };
  // each post will include the post content associated with its parameter key
  content: string;
};

// structure of a page
type Page = {
  data: {
    [key: string]: string;
  };
  content: string;
};

type PrecomputedItem = {
  slug: string;
  data: { [key: string]: any };
  source: any;
};

const posts = postsData as unknown as PrecomputedItem[];
const pages = pagesData as unknown as PrecomputedItem[];

function findItem(items: PrecomputedItem[], slug: string): PrecomputedItem {
  const item = items.find((i) => i.slug === slug);
  if (!item) throw new Error(`No item found for slug "${slug}"`);
  return item;
}

// load the post items
function getItems(
  items: PrecomputedItem[],
  filePath: string,
  fields: string[] = []
): Items {
  // create a slug from the mdx file location
  const slug = filePath.replace(/\.mdx?$/, '');
  // get the front matter data
  const { data } = findItem(items, slug);

  const result: Items = {};

  // just load and include the content needed
  fields.forEach((field) => {
    // load the slug
    if (field === 'slug') {
      result[field] = slug;
    }
    // check if the above specified field exists on data
    if (data[field]) {
      // verify the fields has data
      result[field] = data[field];
    }
  });
  // return the post items
  return result;
}

export function getPostItems(filePath: string, fields: string[] = []): Items {
  return getItems(posts, filePath, fields);
}

export function getPageItems(filePath: string, fields: string[] = []): Items {
  return getItems(pages, filePath, fields);
}

// getting a single post
export function getPost(slug: string): Post {
  const { data } = findItem(posts, slug);
  // content is no longer shipped raw; the precomputed serialized source is used instead
  return { data, content: '' };
}

// getting a single page
export function getPage(slug: string): Page {
  const { data } = findItem(pages, slug);
  return { data, content: '' };
}

// getting all posts
export function getAllPosts(fields: string[]): Items[] {
  const filePaths = posts.map((p) => `${p.slug}.mdx`);
  // get the posts from the filepaths with the needed fields sorted by date
  const result = filePaths
    .map((filePath) => getPostItems(filePath, fields))
    .sort((post1, post2) => (post1.date < post2.date ? 1 : -1));
  // return the available posts
  return result;
}

// getting all pages
export function getAllPages(fields: string[]): Items[] {
  const filePaths = pages.map((p) => `${p.slug}.mdx`);
  // get the pages from the filepaths with the needed fields sorted by date
  const result = filePaths
    .map((filePath) => getPageItems(filePath, fields))
    .sort((page1, page2) => (page1.date < page2.date ? 1 : -1));
  // return the available pages
  return result;
}

// precomputed serialized MDX sources, keyed by slug
export function getPostSource(slug: string): unknown {
  return findItem(posts, slug).source;
}

export function getPageSource(slug: string): unknown {
  return findItem(pages, slug).source;
}
