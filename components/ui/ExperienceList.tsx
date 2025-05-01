import React from 'react';

interface ExperienceListProps {
  items: string[];
}

export default function ExperienceList({ items }: ExperienceListProps) {
  return (
    <ul className="list-disc list-inside marker:text-primary space-y-2 text-sm text-muted-foreground mt-3">
      {items.map((text, i) => (
        <li key={i}>{text}</li>
      ))}
    </ul>
  );
}
