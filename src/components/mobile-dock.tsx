'use client';

import { useActiveSession } from '@/app/(protected)/(main)/focus/hooks/queries/use-active-session';
import {
  commandMenuOpenAtom,
  commandSearchValueAtom,
  selectedItemAtom,
} from '@/atoms/command-menu-atoms';
import { cn } from '@/utils/utils';
import { useAtom } from 'jotai';
import {
  BrainIcon,
  ChevronLeftIcon,
  ClockPlusIcon,
  GoalIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
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
  const [searchValue, setSearchValue] = useAtom(commandSearchValueAtom);
  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom);
  const { data: session } = useActiveSession();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="h-12 w-full md:hidden" />
      <LayoutGroup>
        <div
          data-mobile-dock
          className="fixed inset-x-0 bottom-3 z-60 flex items-center justify-center gap-2 px-5 md:hidden"
        >
          <motion.div
            layout
            className="bg-sidebar/60 dark:bg-accent/60 border-border/50 flex h-14 w-full items-center gap-1 rounded-full border px-2 shadow-lg backdrop-blur-md"
          >
            <AnimatePresence mode="wait" initial={false}>
              {commandMenuOpen ? (
                <motion.div
                  key="search-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex w-full items-center gap-2 px-1"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {selectedItem ? (
                      <motion.button
                        key="back-button"
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        onClick={() => {
                          setSelectedItem(null);
                        }}
                        className="text-foreground hover:bg-foreground/10 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
                      >
                        <ChevronLeftIcon className="size-5" />
                      </motion.button>
                    ) : (
                      <motion.div
                        key="search-icon-left"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="text-muted-foreground flex size-8 shrink-0 items-center justify-center"
                      >
                        <SearchIcon className="size-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for items..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    autoFocus
                    className="text-foreground placeholder:text-muted-foreground h-10 w-full bg-transparent text-sm outline-none"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="nav-items"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex w-full items-center gap-1"
                >
                  {navItems.map((item) => {
                    const isActive = pathname === item.url;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className={cn(
                          'flex h-10 w-full items-center justify-center rounded-full transition-colors',
                          isActive
                            ? 'bg-foreground/10 text-foreground'
                            : 'text-foreground hover:bg-foreground/10 hover:text-accent-foreground'
                        )}
                      >
                        <Icon className="size-5" />
                        <span className="sr-only">{item.title}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence mode="popLayout">
            {session && !commandMenuOpen && <FocusTimerWidget />}
          </AnimatePresence>
          <motion.div
            layout
            className="bg-sidebar/60 border-border/50 dark:bg-accent/60 flex h-14 items-center rounded-full border px-2 shadow-lg backdrop-blur-md"
          >
            <button
              onClick={() => {
                setCommandMenuOpen((prev) => !prev);
                if (commandMenuOpen) {
                  setSearchValue('');
                  setSelectedItem(null);
                }
              }}
              className="text-foreground hover:bg-foreground/10 hover:text-accent-foreground flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {commandMenuOpen ? (
                  <motion.div
                    key="close-icon"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <XIcon className="size-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search-icon"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <SearchIcon className="size-5" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">
                {commandMenuOpen ? 'Close' : 'Search'}
              </span>
            </button>
          </motion.div>
        </div>
      </LayoutGroup>
    </>
  );
};
