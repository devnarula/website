// app/blog/layout.tsx (server)
import { getAllPosts } from '@/lib/blog';
import BlogSidebar from '@/components/ui/BlogSideBar';

export const dynamic = 'force-static';

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const posts = (await getAllPosts()).sort((a, b) => (a.meta.date > b.meta.date ? -1 : 1));

  return (
    <div className="flex">
      {/* Sidebar is a client component */}
      <BlogSidebar posts={posts} />
      <section className="flex-1 p-8">{children}</section>
    </div>
  );
}
