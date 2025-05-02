import type React from 'react';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import BlogSidebar from '@/components/ui/BlogSideBar';
import MobileBlogNav from '@/components/ui/mobile-blog-nav';

export const metadata: Metadata = {
  title: 'Blog | Dev Narula',
  description: 'Thoughts, tutorials, and insights',
};

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row">
        {/* Mobile Navigation */}
        <div className="md:hidden sticky top-0 z-30 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            {/* <h2 className="font-semibold">Blog</h2> */}
            <MobileBlogNav posts={posts} />
          </div>
        </div>

        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0">
          <Suspense fallback={<div className="w-64 lg:w-72 h-screen bg-muted/20 animate-pulse" />}>
            <BlogSidebar posts={posts} />
          </Suspense>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 border-l border-border/40">
          <div className="px-4 md:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
