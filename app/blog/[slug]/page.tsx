// app/blog/[slug]/page.tsx
import { promises as fs } from 'fs'
import path                from 'path'
import matter              from 'gray-matter'
import { notFound }        from 'next/navigation'
import PostRenderer from '@/components/PostRender'

export async function generateStaticParams() {
  const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
  const files    = await fs.readdir(BLOG_DIR)
  return files
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => ({ slug: f.replace(/\.(md|mdx)$/, '') }))
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)  // or `.md`

  // 404 if missing
  try {
    await fs.access(filePath)
  } catch {
    return notFound()
  }

  // read and parse
  const source            = await fs.readFile(filePath, 'utf8')
  const { data, content } = matter(source)

  // normalize date
  const rawDate = (data.date as any)
  const dateString =
    rawDate instanceof Date
      ? rawDate.toISOString().split('T')[0]
      : String(rawDate)

  // pass everything down to the client renderer
  return (
    <article className="mx-auto max-w-3xl py-16">
      <h1 className="text-3xl font-bold mb-2">{String(data.title)}</h1>
      <time
        dateTime={dateString}
        className="block mb-6 text-sm text-muted-foreground"
      >
        {dateString}
      </time>
      <PostRenderer content={content} />
    </article>
  )
}
