'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import BlogSidebar from './BlogSideBar';
import type { Post } from '@/lib/blog';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './sheet';

export default function MobileBlogNav({ posts }: { posts: Post[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle blog navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80">
        <SheetTitle className="sr-only">Blog Navigation</SheetTitle>
        <BlogSidebar posts={posts} isMobile={true} onSelect={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
