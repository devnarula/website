'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import type { Post } from '@/lib/blog';

export default function BlogSidebar({ posts }: { posts: Post[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-72 flex-shrink-0 border-r bg-background h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-5">
        <h2 className="text-xl font-semibold tracking-tight">Blog</h2>
        <p className="text-sm text-muted-foreground mt-1">Thoughts, tutorials, and insights</p>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-auto py-4 px-3">
        <div className="space-y-1">
          {posts.map(({ slug, meta }) => {
            const href = `/blog/${slug}`;
            const isActive = pathname === href;

            return (
              <Link
                key={slug}
                href={href}
                className={cn(
                  'block rounded-md px-3 py-2.5 transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-foreground'
                )}
              >
                <div className="font-medium line-clamp-1">{meta.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    <time dateTime={meta.date}>
                      {new Date(meta.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  {/* {meta.readingTime && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span>{meta.readingTime} min read</span>
                    </div>
                  )} */}
                </div>

                {/* {meta.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{meta.description}</p>
                )} */}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4 bg-background/95 backdrop-blur">
        <Link
          href="/blog"
          className={cn(
            'flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
            pathname === '/blog'
              ? 'bg-primary/10 text-primary hover:bg-primary/15'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {pathname === '/blog' ? 'Currently Viewing All Posts' : 'View All Posts'}
        </Link>
      </div>
    </aside>
  );
}
