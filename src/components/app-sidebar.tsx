'use client';

import { logoutDialogOpenAtom } from '@/atoms/ui-atoms';
import { PlaceholderLogo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUser } from '@/hooks/use-user';
import { getInitials } from '@/utils/utils';
import { useSetAtom } from 'jotai';
import {
  BrainIcon,
  CheckIcon,
  ClockPlusIcon,
  GoalIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  TrashIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

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

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const { user, isPending } = useUser();
  const setLogoutDialogOpen = useSetAtom(logoutDialogOpenAtom);
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 gap-0 border-b p-0">
        <PlaceholderLogo className="m-auto size-6" />
      </SidebarHeader>
      <SidebarContent className="mx-auto mt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/settings'}
                  tooltip="Settings"
                >
                  <Link href="/settings">
                    <SettingsIcon />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex h-16 items-center justify-center border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              {isPending ? (
                <Skeleton className="size-8 rounded-md" />
              ) : (
                <Avatar className="size-8 rounded-md">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || 'User'}
                  />
                  <AvatarFallback className="rounded-md">
                    {getInitials(user?.name || '')}
                  </AvatarFallback>
                </Avatar>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MonitorIcon className="mr-2 size-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => setTheme('light')}>
                  <SunIcon className="mr-2 size-4" />
                  <span>Light</span>
                  {theme === 'light' && (
                    <CheckIcon className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTheme('dark')}>
                  <MoonIcon className="mr-2 size-4" />
                  <span>Dark</span>
                  {theme === 'dark' && <CheckIcon className="ml-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTheme('system')}>
                  <MonitorIcon className="mr-2 size-4" />
                  <span>System</span>
                  {theme === 'system' && (
                    <CheckIcon className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem asChild>
              <Link href="/trash">
                <TrashIcon className="mr-2 size-4" />
                <span>Trash</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setLogoutDialogOpen(true)}
            >
              <LogOutIcon className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
