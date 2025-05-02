import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostMeta {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  readingTime?: number;
  coverImage?: string;
}

export interface Post {
  slug: string;
  meta: PostMeta;
}

export async function getAllPosts(): Promise<Post[]> {
  const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

  try {
    const files = await fs.readdir(BLOG_DIR);

    const posts = await Promise.all(
      files
        .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
        .map(async (file) => {
          const filePath = path.join(BLOG_DIR, file);
          const content = await fs.readFile(filePath, 'utf8');
          const { data } = matter(content);

          return {
            slug: file.replace(/\.(md|mdx)$/, ''),
            meta: {
              title: data.title || 'Untitled',
              date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
              description: data.description || '',
              tags: data.tags || [],
              readingTime: data.readingTime || calculateReadingTime(content),
              coverImage: data.coverImage || '',
            },
          };
        })
    );

    // Sort by date (newest first)
    return posts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return [];
  }
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
