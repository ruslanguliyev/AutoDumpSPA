import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';

import { DashboardSidebar } from '@/dashboard/components/DashboardSidebar/DashboardSidebar';
import { DashboardTopbar } from '@/dashboard/components/DashboardTopbar/DashboardTopbar';
import { DashboardBottomNav } from '@/dashboard/components/DashboardBottomNav/DashboardBottomNav';
import { useDashboardUIStore } from '@/dashboard/store/useDashboardUIStore';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';

function DashboardContentFallback() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const sidebarCollapsed = useDashboardUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <div
        className={clsx(
          'flex flex-1 flex-col transition-[margin] duration-300 ease-in-out',
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'
        )}
      >
        <DashboardTopbar />

        <main className="flex-1 pb-20 p-4 md:pb-6 md:p-6 lg:p-8">
          <ErrorBoundary
            fallback={
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-destructive">
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1 text-sm opacity-80">
                  Please refresh the page or try again later.
                </p>
              </div>
            }
          >
            <Suspense fallback={<DashboardContentFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <DashboardBottomNav />
    </div>
  );
}
