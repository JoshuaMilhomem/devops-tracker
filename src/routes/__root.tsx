import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Analytics } from '@vercel/analytics/react';

import { AppHeader } from '@/components/layout/app-header';
import { GlobalTaskOverlay } from '@/components/layout/global-task-overlay';
import { AppStatusManager } from '@/components/shared/app-status-manager';
import { NotFound } from '@/components/shared/not-found';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  notFoundComponent: NotFound,

  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="devops-tracker-theme">
      <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/30 flex flex-col">
        <AppStatusManager />

        <AppHeader />
        <GlobalTaskOverlay />
        <main className="container mx-auto max-w-5xl p-4 py-8 flex-1">
          <Outlet />
        </main>

        <Toaster />
      </div>
    </ThemeProvider>
  ),
});
