import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import PostRenderer from '@/components/PostRender';
import { CalendarIcon, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
  try {
    const files = await fs.readdir(BLOG_DIR);
    return files
      .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
      .map((f) => ({ slug: f.replace(/\.(md|mdx)$/, '') }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BlogPost({ params }: { params: Params }) {
  // 1) unwrap slug
  const { slug } = await params;

  // 2) locate the file
  const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);

  let filePath;

  // Try both .mdx and .md extensions
  try {
    await fs.access(mdxPath);
    filePath = mdxPath;
  } catch {
    try {
      await fs.access(mdPath);
      filePath = mdPath;
    } catch {
      return notFound();
    }
  }

  // 3) read + parse front-matter
  const source = await fs.readFile(filePath, 'utf8');
  const { data, content } = matter(source);

  // 4) normalize date
  const rawDate = data.date as unknown;
  const dateString =
    rawDate instanceof Date ? rawDate.toISOString().split('T')[0] : String(rawDate);

  // Format date for display
  const displayDate = new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 5) render title/date + markdown body
  return (
    <article className="py-8 md:py-16">
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{String(data.title)}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CalendarIcon className="mr-1 h-4 w-4" />
            <time dateTime={dateString}>{displayDate}</time>
          </div>

          {data.readingTime && (
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{data.readingTime} min read</span>
            </div>
          )}
        </div>

        {data.tags && (
          <div className="flex flex-wrap gap-2 mt-4">
            {data.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {data.coverImage && (
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <img
            src={data.coverImage || '/placeholder.svg'}
            alt={`Cover image for ${data.title}`}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <div className="blog-content">
        <PostRenderer content={content} />
      </div>

      <div className="mt-16 pt-8 border-t">
        <Link href="/blog">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Button>
        </Link>
      </div>
    </article>
  );
}
