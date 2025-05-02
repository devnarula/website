// components/Header.tsx
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          Dev Narula
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/#about" className="transition-colors hover:text-primary">
            About
          </Link>
          <Link href="/#competitive" className="transition-colors hover:text-primary">
            Competitive Programming
          </Link>
          <Link href="/#projects" className="transition-colors hover:text-primary">
            Projects
          </Link>
          <Link href="/#resume" className="transition-colors hover:text-primary">
            Resume
          </Link>
          <Link
            href="/blog"
            className="transition-colors hover:text-primary flex items-center gap-1"
          >
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/blog">
            <Button variant="ghost" size="icon" className="rounded-full md:hidden">
              <BookOpen className="h-4 w-4" />
              <span className="sr-only">Blog</span>
            </Button>
          </Link>
          <Link href="https://github.com/devnarula" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <Link href="https://www.linkedin.com/in/dev-narula/" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </Link>
          <Link href="mailto:d3narula@uwaterloo.ca">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Mail className="h-4 w-4" />
              <span className="sr-only">Email</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
