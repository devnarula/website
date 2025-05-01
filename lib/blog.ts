// lib/blog.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostMeta {
  title: string;
  date: string;  // always a string
}

export interface Post {
  slug: string;
  meta: PostMeta;
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export function getPostBySlug(slug: string): Post {
  const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const source   = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(source);

  const rawDate = (data.date as any);
  const date = rawDate instanceof Date
    ? rawDate.toISOString().split('T')[0]
    : String(rawDate);

  return {
    slug,
    meta: {
      title: String(data.title),
      date,
    },
    content,
  };
}

export function getAllPosts(): Post[] {
  return getAllSlugs().map(getPostBySlug);
}
