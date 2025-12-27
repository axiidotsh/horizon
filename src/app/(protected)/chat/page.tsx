'use client';

import { PlaceholderLogo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import {
  BarChartIcon,
  BrainIcon,
  ChartSplineIcon,
  ClockIcon,
  FileTextIcon,
  GoalIcon,
  ListTodoIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useState } from 'react';
import { CategoryButton } from './components/category-button';
import { PromptCard } from './components/prompt-card';

type Category = 'Habits' | 'Tasks' | 'Focus' | 'Analysis';

const categories: Category[] = ['Habits', 'Tasks', 'Focus', 'Analysis'];

const promptsByCategory: Record<
  Category,
  Array<{ content: string; icon: typeof GoalIcon }>
> = {
  Habits: [
    {
      content: 'Which habits am I struggling with this month?',
      icon: GoalIcon,
    },
    {
      content: 'What are the best times for me to schedule my habits?',
      icon: ClockIcon,
    },
    {
      content: 'Compare my performance across different habit categories',
      icon: ChartSplineIcon,
    },
    {
      content: 'How are my habits contributing to my long-term goals?',
      icon: TargetIcon,
    },
  ],
  Tasks: [
    {
      content: 'What tasks do I tend to procrastinate on?',
      icon: ListTodoIcon,
    },
    {
      content: 'How can I improve my high-priority task execution?',
      icon: TrendingUpIcon,
    },
    {
      content: 'Show my task load trends and predict burnout periods',
      icon: BarChartIcon,
    },
    {
      content: 'Which recurring tasks could be automated or batched?',
      icon: SparklesIcon,
    },
  ],
  Focus: [
    {
      content: 'When are my most productive time blocks?',
      icon: ClockIcon,
    },
    {
      content: 'What distractions impact my deep work sessions most?',
      icon: BrainIcon,
    },
    {
      content: 'Create a focus strategy based on my energy levels',
      icon: TargetIcon,
    },
    {
      content: 'Show correlation between habits, tasks, and focus quality',
      icon: ChartSplineIcon,
    },
  ],
  Analysis: [
    {
      content: 'Generate a performance report for the last month',
      icon: FileTextIcon,
    },
    {
      content: 'What are my strongest productivity patterns?',
      icon: TrendingUpIcon,
    },
    {
      content: "Compare this month's performance against previous months",
      icon: BarChartIcon,
    },
    {
      content: 'Provide recommendations to optimize my routine',
      icon: SparklesIcon,
    },
  ],
};

export default function ChatPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Habits');

  return (
    <div className="flex size-full items-center justify-center">
      <div className="-mt-24 flex w-full max-w-2xl flex-col">
        <h1 className="flex items-start gap-3 font-mono text-xl sm:items-center">
          <PlaceholderLogo className="size-8 animate-[wiggle_3s_ease-in-out_infinite]" />
          Good morning, Aditya. How can I help you?
        </h1>
        <div className="mt-12 flex items-baseline gap-2">
          {categories.map((category) => (
            <CategoryButton
              key={category}
              content={category}
              isActive={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1">
          {promptsByCategory[selectedCategory].map((prompt, i) => (
            <>
              <PromptCard
                key={prompt.content}
                prompt={prompt.content}
                icon={prompt.icon}
              />
              {i !== promptsByCategory[selectedCategory].length - 1 && (
                <Separator className="my-1 opacity-50" />
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
