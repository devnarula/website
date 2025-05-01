import React from 'react';
import ExperienceList from './ExperienceList';

interface ExperienceSectionProps {
  title: string;
  subtitle: string;
  items: string[];
}

export default function ExperienceSection({ title, subtitle, items }: ExperienceSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <ExperienceList items={items} />
    </div>
  );
}
