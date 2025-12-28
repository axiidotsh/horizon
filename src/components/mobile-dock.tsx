'use client';

import { useActiveSession } from '@/app/(protected)/(main)/focus/hooks/queries/use-active-session';
import { commandMenuOpenAtom } from '@/atoms/command-menu-atoms';
import { cn } from '@/utils/utils';
import { useAtom } from 'jotai';
import {
  BrainIcon,
  ClockPlusIcon,
  GoalIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  SearchIcon,
} from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FocusTimerWidget } from './focus-timer-widget';

const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Chat',
    url: '/chat',
    icon: BrainIcon,
  },
  {
    title: 'Focus',
    url: '/focus',
    icon: ClockPlusIcon,
  },
  {
    title: 'Tasks',
    url: '/tasks',
    icon: LayoutListIcon,
  },
  {
    title: 'Habits',
    url: '/habits',
    icon: GoalIcon,
  },
];

export const MobileDock = () => {
  const pathname = usePathname();
  const [commandMenuOpen, setCommandMenuOpen] = useAtom(commandMenuOpenAtom);
  const { data: session } = useActiveSession();

  return (
    <LayoutGroup>
      <div
        data-mobile-dock
        className="fixed inset-x-0 bottom-3 z-60 flex items-center justify-center gap-2 md:hidden"
      >
        <motion.div
          layout
          className="bg-sidebar/60 flex h-14 items-center gap-1 rounded-full border px-2 shadow-lg backdrop-blur-md"
        >
          {navItems.map((item) => {
            const isActive = !commandMenuOpen && pathname === item.url;
            const Icon = item.icon;

            return (
              <Link
                key={item.url}
                href={item.url}
                onClick={() => setCommandMenuOpen(false)}
                className={cn(
                  'flex size-10 items-center justify-center rounded-full transition-colors',
                  isActive
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted-foreground hover:bg-foreground/10 hover:text-accent-foreground'
                )}
              >
                <Icon className="size-5" />
                <span className="sr-only">{item.title}</span>
              </Link>
            );
          })}
        </motion.div>
        <AnimatePresence mode="popLayout">
          {session && <FocusTimerWidget />}
        </AnimatePresence>
        <motion.div
          layout
          className="bg-sidebar/60 flex h-14 items-center rounded-full border px-2 shadow-lg backdrop-blur-md"
        >
          <button
            onClick={() => setCommandMenuOpen((prev) => !prev)}
            className={cn(
              'text-muted-foreground hover:bg-foreground/10 hover:text-accent-foreground flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors',
              commandMenuOpen && 'bg-foreground/10 text-foreground'
            )}
          >
            <SearchIcon className="size-5" />
            <span className="sr-only">Search</span>
          </button>
        </motion.div>
      </div>
    </LayoutGroup>
  );
};
