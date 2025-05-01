'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm     from 'remark-gfm'
import remarkMath    from 'remark-math'
import rehypeKatex   from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css';
import { useTheme }   from 'next-themes'
import { useEffect } from 'react'

// optional: import your Tailwind prose styles
// import '@/styles/globals.css'

export default function PostRenderer({ content }: { content: string }) {
  const { theme } = useTheme()

  useEffect(() => {
    // remove any previously injected hljs styles
    Array.from(document.querySelectorAll('link[data-hljs]')).forEach(el => el.remove())

    // choose the right CSS file
    const href =
      theme === 'dark'
        ? 'https://unpkg.com/highlight.js/styles/github-dark.css'
        : 'https://unpkg.com/highlight.js/styles/github.css'

    // inject a <link> into <head>
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('data-hljs', 'true')
    link.setAttribute('href', href)
    document.head.appendChild(link)
  }, [theme])

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )

}

