// app/blog/[slug]/page.tsx
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import PostRenderer from '@/components/PostRender';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
  const files = await fs.readdir(BLOG_DIR);
  return files
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => ({ slug: f.replace(/\.(md|mdx)$/, '') }));
}

export default async function BlogPost({ params }: { params: Params }) {
  // 1) unwrap slug
  const { slug } = await params;

  // 2) locate the file
  const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  // 3) 404 if missing
  try {
    await fs.access(filePath);
  } catch {
    return notFound();
  }

  // 4) read + parse front-matter
  const source = await fs.readFile(filePath, 'utf8');
  const { data, content } = matter(source);

  // 5) normalize date
  const rawDate = data.date as unknown;
  const dateString =
    rawDate instanceof Date ? rawDate.toISOString().split('T')[0] : String(rawDate);

  // 6) render title/date + markdown body
  return (
    <article className="mx-auto max-w-3xl py-16">
      <h1 className="text-3xl font-bold mb-2">{String(data.title)}</h1>
      <time dateTime={dateString} className="block mb-6 text-sm text-muted-foreground">
        {dateString}
      </time>
      <PostRenderer content={content} />
    </article>
  );
}
