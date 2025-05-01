import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface TimelineItem {
  company: string;
  role: string;
  period: string;
  logo: string;
  skills?: string[];
}

interface ExperienceTimelineProps {
  items: TimelineItem[];
}

export default function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Work Timeline</h3>
      <div className="relative space-y-0">
        {/* Vertical line */}
        <div className="absolute left-6 top-6 bottom-6 w-px bg-border" />

        {items.map((item, index) => (
          <div key={index} className="relative pl-16 pb-8 group">
            {/* Logo circle */}
            <div className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full border-2 border-muted bg-background z-10 group-hover:border-primary transition-colors duration-300">
              <Image
                src={item.logo || '/placeholder.svg'}
                alt={`${item.company} logo`}
                width={28}
                height={28}
                className="rounded-sm"
              />
            </div>

            {/* Content */}
            <div className="p-4 rounded-lg border border-border bg-background group-hover:border-primary/30 group-hover:bg-accent/20 transition-all duration-300">
              <h4 className="font-medium text-base">{item.role}</h4>
              <p className="text-sm text-muted-foreground">{item.company}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.period}</p>

              {item.skills && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
