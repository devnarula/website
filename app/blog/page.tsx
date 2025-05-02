import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';
import { CalendarIcon, Clock, ArrowRight } from 'lucide-react';

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Thoughts, tutorials, and insights on programming, technology, and more.
        </p>
      </div>

      <div className="grid gap-6 md:gap-8">
        {posts.map(({ slug, meta }) => (
          <article key={slug} className="group">
            <Link href={`/blog/${slug}`} className="block">
              <div className="space-y-2">
                <div>
                  {meta.tags && meta.tags.length > 0 && (
                    <div className="mb-1">
                      <span className="inline-block text-xs font-medium text-primary">
                        {meta.tags[0]}
                      </span>
                    </div>
                  )}
                  <h2 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">
                    {meta.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    <time dateTime={meta.date}>
                      {new Date(meta.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  {meta.readingTime && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{meta.readingTime} min read</span>
                    </div>
                  )}
                </div>

                {meta.description && <p className="text-muted-foreground">{meta.description}</p>}

                <div className="pt-1">
                  <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                    Read more <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
