import { Badge } from '@/components/ui/badge';
import { CodeIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Platform {
  name: string;
  username: string;
  rating?: number;
  rank?: string;
  solved: number;
  totalSolved?: number;
  badge?: string;
  color: string;
  url: string;
}

interface CompetitiveProgrammingStatsProps {
  platforms: Platform[];
}

export default function CompetitiveProgrammingStats({
  platforms,
}: CompetitiveProgrammingStatsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Platforms & Profiles</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CodeIcon className="h-4 w-4" style={{ color: platform.color }} />
                  <h4 className="font-medium">{platform.name}</h4>
                </div>
                {platform.badge && (
                  <Badge
                    style={{
                      backgroundColor: platform.color,
                      color: '#fff',
                    }}
                  >
                    {platform.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">@{platform.username}</p>

              {platform.rating && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Rating: {platform.rating}</span>
                  {platform.rank && <span className="text-sm">{platform.rank}</span>}
                </div>
              )}

              <div className="flex items-center justify-between text-sm mb-3">
                <span>Problems Solved: {platform.solved}</span>
                {platform.totalSolved && (
                  <div className="w-24">
                    {/* Custom progress bar with platform color */}
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                      <div
                        className="h-full flex-1 transition-all"
                        style={{
                          width: `${(platform.solved / platform.totalSolved) * 100}%`,
                          backgroundColor: platform.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Link href={platform.url} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
