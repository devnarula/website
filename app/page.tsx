import Link from 'next/link';
import { Github, Linkedin, Mail, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SpotifyNowPlaying from '@/components/spotify-now-playing';
import ExperienceSection from '@/components/ui/ExperienceSection';
import ExperienceTimeline from '@/components/ui/ExperienceTimeline';
import CompetitiveProgrammingStats from '@/components/ui/CPStats';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Home() {
  const bitgoItems = [
    'Leveraged FP-TS to orchestrate off-exchange settlements with third-party venues ensuring referential transparency, composable validation, and safe side-effect handling.',
    'Engineered a dispute resolution engine for asset trading with external exchanges validating client deposits against internal ledgers, reducing transfer errors by 40%.',
    'Designed declarative business logic flows for net liability computation using functional composition and monadic chaining, reducing logic bugs in trade attribution.',
    'Implemented RESTful API endpoints in TypeScript to enable real-time asset settlement and trade timeline visualization, improving transaction transparency for 1.5k+ institutional clients.',
  ];
  const purolatorItems = [
    'Implemented a thread-safe caching solution for a high-traffic Java microservice, supporting 100K+ concurrent requests, leading to a 30% reduction in latency.',
    'Developed and fine-tuned AWS Lambda functions in Java to process 0.5M+ requests to generate real time shipment updates.',
    'Designed a relational database schema in PostgreSQL to model shipment data, utilizing normalization techniques to minimize redundancy and improve query performance by 25%.',
  ];
  const RBCItems = [
    'Built an ETL pipeline using clustering algorithms and BERT models, processing 1M+ time-series queries to detect trends in high-traffic topics, increasing trend detection accuracy by 25%.',
    'Developed an image processing pipeline using OpenCV to automate text extraction and real-time in-place translation, cutting processing time by 75% and streamlining workflows for international markets.',
    'Orchestrated automated containerization with Docker and Kubernetes, integrating Jenkins to streamline CI/CD pipelines, resulting in a 60% reduction in deployment times.',
  ];
  const platforms = [
    // {
    //   name: 'Codeforces',
    //   username: 'dev_narula',
    //   rating: 1842,
    //   rank: 'Expert',
    //   solved: 387,
    //   badge: 'Expert',
    //   color: '#3b5bdb',
    //   url: 'https://codeforces.com/profile/dev_narula',
    // },
    {
      name: 'LeetCode',
      username: 'devnarula',
      // rating: 2145,
      // rank: 'Guardian',
      solved: 597,
      totalSolved: 3535,
      // badge: 'Guardian',
      color: '#e67700',
      url: 'https://leetcode.com/devnarula/',
    },
    {
      name: 'DMOJ',
      username: 'devnarula',
      rating: 1531,
      rank: 'Expert',
      badge: 'Expert',
      solved: 243,
      totalSolved: 3000,
      color: '#0000ff', //blue
      url: 'https://dmoj.ca/user/devnarula',
    },
    {
      name: 'CSES',
      username: 'devnarula',
      solved: 55,
      totalSolved: 300,
      color: '#5f3dc4',
      url: 'https://cses.fi/user/26698',
    },
    // {
    //   name: 'AtCoder',
    //   username: 'dev_narula',
    //   rating: 1254,
    //   rank: 'Green',
    //   solved: 142,
    //   badge: 'Green',
    //   color: '#2b8a3e',
    //   url: 'https://atcoder.jp/users/dev_narula',
    // },
    // {
    //   name: 'HackerRank',
    //   username: 'dev_narula',
    //   rating: 1950,
    //   solved: 215,
    //   badge: '5★',
    //   color: '#5f3dc4',
    //   url: 'https://www.hackerrank.com/dev_narula',
    // },
  ];
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            Dev Narula
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="#about" className="transition-colors hover:text-primary">
              About
            </Link>
            <Link href="#competitive" className="transition-colors hover:text-primary">
              Competitive Programming
            </Link>
            <Link href="#projects" className="transition-colors hover:text-primary">
              Projects
            </Link>
            <Link href="#resume" className="transition-colors hover:text-primary">
              Resume
            </Link>
            <Link
              href="https://your-quartz-blog-url.com"
              target="_blank"
              className="transition-colors hover:text-primary flex items-center gap-1"
            >
              Blog <ExternalLink className="h-3 w-3" />
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Redesigned Hero Section */}
        <section className="py-20 md:py-32 flex flex-col">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              <span className="block text-primary">Hello, I'm Dev Narula.</span>
              <span className="block mt-2">A Computer Science Enthusiast</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-8">
              I'm passionate about building software that solves real problems. Currently studying
              at the University of Waterloo and exploring opportunities in Backend Engineering.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#projects">
                <Button className="group">
                  View My Projects
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#resume">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 border-t">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-start">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">About Me</h2>
              <p className="text-lg text-muted-foreground">
                I'm a Computer Science student passionate about solving puzzles with Mathematics and
                CS. Currently, I'm focusing on low level development and exploring opportunities in
                Backend Engineering.
              </p>
              <p className="text-lg text-muted-foreground">
                When I'm not coding, you can find me playing valorant or listening to music or
                solving random algorithmic problems.
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">What I'm Up To These Days</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="rounded-full h-2 w-2 mt-2.5 bg-primary"></span>
                    <span>Trying to fix my path tracer (ray tracing is hard).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="rounded-full h-2 w-2 mt-2.5 bg-primary"></span>
                    <span>Learning about Real Time Operating Systems.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="rounded-full h-2 w-2 mt-2.5 bg-primary"></span>
                    <span>Preparing to graduate soon (May 2026).</span>
                  </li>
                </ul>
              </div>
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-4">Currently Listening To</h3>
                <SpotifyNowPlaying />
              </div>
            </div>
          </div>
        </section>
        {/* Competitive Programming Section */}
        <section id="competitive" className="py-16 border-t">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Competitive Programming</h2>
          </div>

          <div>
            <CompetitiveProgrammingStats platforms={platforms} />
          </div>
        </section>
        {/* Projects Section */}
        <section id="projects" className="py-16 border-t">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Projects</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Project 1 */}
            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>CloudBoy</CardTitle>
                <CardDescription>Nintendo GameBoy Color Emulator</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built an emulator ground up in C++ to read GB gamefiles, emulate a CPU, stack and
                  MMU model with SDL2 allowing users to run retro games.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary">C++</Badge>
                  <Badge variant="secondary">SDL2</Badge>
                  <Badge variant="secondary">Assembly</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between mt-auto pt-6">
                <Link
                  href="https://github.com/yourusername/project"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </Link>
                {/* <Link href="https://project-demo.com" target="_blank" rel="noreferrer">
                  <Button size="sm">Live Demo</Button>
                </Link> */}
              </CardFooter>
            </Card>

            {/* Project 2 */}
            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>Ray Tracer</CardTitle>
                <CardDescription>C++ Ray Tracer for 3D Graphics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built a C++ Ray Tracer ground up with Phong Reflection Model and Lua for
                  modelling. Used Lambertian Reflection Models for approximation and multithreading
                  on kernel threads to improve image generation.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary">C++</Badge>
                  <Badge variant="secondary">Lua</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between mt-auto pt-6">
                <Link
                  href="https://github.com/yourusername/project"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </Link>
                {/* <Link href="https://project-demo.com" target="_blank" rel="noreferrer">
                  <Button size="sm">Live Demo</Button>
                </Link> */}
              </CardFooter>
            </Card>

            {/* Project 3 */}
            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>Optimizing Cache Policies</CardTitle>
                <CardDescription>
                  Research project to model policies with statistics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Research Project to model and try to optimize cache replacement policies with
                  Gaussian Mixture Models (Expectation-Maximization) and Bayesian Inferrence.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary">C++</Badge>
                  <Badge variant="secondary">Python</Badge>
                  <Badge variant="secondary">Statistics</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between mt-auto pt-6">
                <Link
                  href="https://github.com/yourusername/project"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </Link>
                {/* <Link href="https://project-demo.com" target="_blank" rel="noreferrer">
                  <Button size="sm">Live Demo</Button>
                </Link> */}
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Resume Section */}
        <section id="resume" className="py-16 border-t">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Resume</h2>
            <Link href="/resume.pdf" target="_blank">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Download Resume
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Education</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Bachelor of Computer Science</h4>
                    <p className="text-sm text-muted-foreground">
                      University of Waterloo • 2021 - 2026 (Anticipated)
                    </p>
                    <p className="text-sm mt-1">GPA: 87.77%</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>C++</Badge>
                  <Badge>Python</Badge>
                  <Badge>TypeScript (Fp-TS)</Badge>
                  <Badge>Kubernetes</Badge>
                  <Badge>AWS</Badge>
                  <Badge>Java</Badge>
                  <Badge>Docker</Badge>
                </div>
              </div>
              <div className="mt-8">
                <ExperienceTimeline
                  items={[
                    {
                      company: 'BitGo',
                      role: 'Software Engineering Intern',
                      period: 'Winter 2025',
                      logo: '/logos/bitgo.svg?height=32&width=32',
                      skills: ['Functional Programming', 'TypeScript', 'React'],
                    },
                    {
                      company: 'Purolator',
                      role: 'Software Engineering Intern',
                      period: 'Summer 2024',
                      logo: '/logos/purolator.png',
                      skills: ['Java', 'AWS', 'PostgreSQL'],
                    },
                    {
                      company: 'Royal Bank of Canada',
                      role: 'Software Engineering Intern',
                      period: 'Fall 2023',
                      logo: '/logos/rbc.png',
                      skills: ['Python', 'Docker', 'Kubernetes'],
                    },
                    {
                      company: 'BTNX',
                      role: 'Software Engineering Intern',
                      period: 'Winter 2023',
                      logo: '/logos/btnx.jpeg',
                      skills: ['C#', 'ASP.NET', 'Microsoft Blazor'],
                    },
                    {
                      company: 'Cynorix',
                      role: 'Software Engineering Intern',
                      period: 'Summer 2022',
                      logo: '/logos/cynorix.webp',
                      skills: ['Ruby on Rails', 'React', 'GCP'],
                    },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Experiences</h3>
              <div className="space-y-6">
                <div className="space-y-12">
                  <ExperienceSection
                    title="Software Engineering Intern"
                    subtitle="BitGo • Winter 2025"
                    items={bitgoItems}
                  />
                  <ExperienceSection
                    title="Software Engineering Intern"
                    subtitle="Purolator • Summer 2024"
                    items={purolatorItems}
                  />
                  <ExperienceSection
                    title="Software Engineering Intern"
                    subtitle="Royal Bank of Canada • Fall 2023"
                    items={RBCItems}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

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
    </div>
  );
}
