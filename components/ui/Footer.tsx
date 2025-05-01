// components/Footer.tsx
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Dev Narula. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="https://github.com" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <Link href="https://linkedin.com" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </Link>
          <Link href="mailto:your-email@example.com">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Mail className="h-4 w-4" />
              <span className="sr-only">Email</span>
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
