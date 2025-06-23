import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink, Github } from 'lucide-react'

interface ProjectCardProps {
  title: string
  description: string
  href: string
  icon?: React.ReactNode
  tags?: string[]
  isExternal?: boolean
  githubUrl?: string
  image?: string
}

export default function ProjectCard({
  title,
  description,
  href,
  icon,
  tags,
  isExternal = false,
  githubUrl,
  image,
}: ProjectCardProps) {
  const LinkComponent = isExternal ? "a" : Link
  const linkProps = isExternal ? { href, target: "_blank", rel: "noopener noreferrer" } : { href }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <CardTitle className="group-hover:text-primary transition-colors">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {image && (
        <CardContent className="pt-0">
          <div className="relative w-full h-40 bg-muted/50 rounded-md overflow-hidden">
            <img
              src={image || "/placeholder.svg"}
              alt={`${title} preview`}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        </CardContent>
      )}

      <CardContent className={`${image ? "pt-4" : ""} flex-grow`}>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 mt-auto">
        <LinkComponent {...linkProps} className="flex-1">
          <Button className="w-full gap-2">
            <span>View Project</span>
            {isExternal ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        </LinkComponent>

        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="icon">
              <Github className="h-4 w-4" />
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  )
}
