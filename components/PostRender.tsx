'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function PostRenderer({ content }: { content: string }) {
  const { theme } = useTheme();

  useEffect(() => {
    // remove any previously injected hljs styles
    Array.from(document.querySelectorAll('link[data-hljs]')).forEach((el) => el.remove());

    // choose the right CSS file
    const href =
      theme === 'dark'
        ? 'https://unpkg.com/highlight.js/styles/github-dark.css'
        : 'https://unpkg.com/highlight.js/styles/github.css';

    // inject a <link> into <head>
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('data-hljs', 'true');
    link.setAttribute('href', href);
    document.head.appendChild(link);

    // Fix for LaTeX equations on mobile
    const fixLatexOverflow = () => {
      // Target both inline and display math elements
      const mathElements = document.querySelectorAll<HTMLElement>('.katex-display, .katex');

      mathElements.forEach((element) => {
        // Check if the element is wider than its container
        const parentWidth = element.parentElement?.clientWidth || 0;
        const elementWidth = element.scrollWidth;

        if (elementWidth > parentWidth) {
          // For display math (block equations)
          if (element.classList.contains('katex-display')) {
            element.style.overflowX = 'auto';
            element.style.overflowY = 'hidden';
            element.style.maxWidth = '90%';
            element.style.padding = '0.5rem 0';
          }
          // For inline math
          else {
            element.classList.add('katex-inline-overflow');
          }
        }
      });
    };

    // Run once after render and then on window resize
    fixLatexOverflow();
    window.addEventListener('resize', fixLatexOverflow);

    return () => {
      window.removeEventListener('resize', fixLatexOverflow);
    };
  }, [theme, content]);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none latex-container">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
