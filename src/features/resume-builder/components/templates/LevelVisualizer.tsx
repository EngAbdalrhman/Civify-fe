"use client";

import { SkillLevel } from '@/features/upload-cv/types';

interface LevelVisualizerProps {
  level: SkillLevel;
  style: 'dots' | 'bar' | 'text';
  color?: string;
}

const LEVEL_VALUES: Record<SkillLevel, number> = {
  expert: 5,
  advanced: 4,
  intermediate: 3,
  beginner: 2,
  none: 1,
};

const LEVEL_LABELS: Record<SkillLevel, string> = {
  expert: 'Expert',
  advanced: 'Advanced',
  intermediate: 'Intermediate',
  beginner: 'Beginner',
  none: '',
};

export function LevelVisualizer({ level, style, color = '#000' }: LevelVisualizerProps) {
  const value = LEVEL_VALUES[level] || 3;
  const maxDots = 5;

  if (style === 'text') {
    return (
      <span className="text-sm text-gray-600 italic">
        {LEVEL_LABELS[level]}
      </span>
    );
  }

  if (style === 'dots') {
    return (
      <div className="flex gap-1 items-center">
        {Array.from({ length: maxDots }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: i < value ? color : '#e5e7eb',
            }}
          />
        ))}
      </div>
    );
  }

  if (style === 'bar') {
    const percentage = (value / maxDots) * 100;
    return (
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    );
  }

  return null;
}
