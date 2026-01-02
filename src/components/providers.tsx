'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from 'lucide-react';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { Toaster } from './ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
      <Toaster
        icons={{
          success: <CircleCheckIcon className="size-4 text-green-500" />,
          error: <CircleXIcon className="size-4 text-red-500" />,
          info: <InfoIcon className="size-4 text-blue-500" />,
          warning: <TriangleAlertIcon className="size-4 text-yellow-500" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
      />
    </QueryClientProvider>
  );
}
