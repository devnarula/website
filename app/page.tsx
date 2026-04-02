import Link from 'next/link';
import { FileText, ArrowRight, Lock, Cpu, Box, FileCode2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import SpotifyNowPlaying from '@/components/spotify-now-playing';
import ExperienceSection from '@/components/ui/ExperienceSection';
import ExperienceTimeline from '@/components/ui/ExperienceTimeline';
import CompetitiveProgrammingStats from '@/components/ui/CPStats';
import ProjectCard from "@/components/project-card"

export default function Home() {
  const projects = [
    {
      title: "Cipher Decryption Tool",
      description:
        "A tool for decrypting and encrypting text using classical ciphers like Caesar, Vigenère, Substitution, and Affine.",
      href: "/projects/cipher-tool",
      icon: <Lock className="h-6 w-6 text-muted-foreground/70" />,
      tags: ["Cryptography", "C++","Algorithm"],
    },
    {
      title: "Optimizing Cache Policies",
      description:
        "Research Project to model and try to optimize cache replacement policies with Gaussian Mixture Models (Expectation-Maximization) and Bayesian Inferrence.",
      href: "/projects/cipher-tool",
      icon: <Cpu className="h-6 w-6 text-muted-foreground/70" />,
      tags: ["Microarchitecture", "C++", "Cache Policies"],
    },
    {
      title: "Java 1.3 Compiler",
      description:
        "A sandboxed multi-file Java workspace that compiles with joosc and lets you browse generated assembly files in a dedicated explorer view.",
      href: "/projects/java-compiler",
      icon: <FileCode2 className="h-6 w-6 text-muted-foreground/70" />,
      tags: ["Java", "joosc", "Compiler"],
    },
    {
      title: "Distributed File Storage",
      description:
        "Developed a file storage infrastructure with a compute (C++) and storage layer (oracle cloud) allowing data encryption, chunking, metadata indexing.",
      href: "/projects/mydrive",
      icon: <Box className="h-6 w-6 text-muted-foreground/70" />,
      tags: ["Distributed Systems", "Infrastructure", "C++"],
    },
  ];

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
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Projects</h2>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
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
                      company: 'Meta',
                      role: 'Software Engineering Intern',
                      period: 'Fall 2025',
                      logo: '/logos/meta.png?height=32&width=32',
                      skills: ['Software Development'],
                    },
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
    </div>
  );
}
