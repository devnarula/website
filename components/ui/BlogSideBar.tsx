'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CalendarIcon, BookOpen } from 'lucide-react';
import type { Post } from '@/lib/blog';

interface BlogSidebarProps {
  posts: Post[];
  isMobile?: boolean;
  onSelect?: () => void;
}

export default function BlogSidebar({ posts, isMobile = false, onSelect }: BlogSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'bg-background flex flex-col',
        isMobile
          ? 'h-[100dvh]'
          : 'w-64 lg:w-72 border-r h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="border-b px-4 py-4">
        <h2 className="text-xl font-semibold tracking-tight">Blogs</h2>
        <p className="text-sm text-muted-foreground mt-1">Thoughts, tutorials, and insights</p>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-auto py-2 px-2">
        <div className="space-y-1">
          {posts.map(({ slug, meta }) => {
            const href = `/blog/${slug}`;
            const isActive = pathname === href;

            return (
              <Link
                key={slug}
                href={href}
                className={cn(
                  'block rounded-md px-2 py-2 transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-foreground'
                )}
                onClick={onSelect}
              >
                <div className="font-medium line-clamp-1">{meta.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    <time dateTime={meta.date}>
                      {new Date(meta.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  {meta.readingTime && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span>{meta.readingTime} min</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-3 bg-background/95 backdrop-blur">
        <Link
          href="/blog"
          className={cn(
            'flex w-full items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium',
            pathname === '/blog'
              ? 'bg-primary/10 text-primary hover:bg-primary/15'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
          onClick={onSelect}
        >
          {pathname === '/blog' ? 'Currently Viewing All Posts' : 'View All Posts'}
        </Link>
      </div>
    </aside>
  );
}
