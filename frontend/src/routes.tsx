import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { MasteryTracks } from './pages/MasteryTracks';
import { QuestBoard } from './pages/QuestBoard';
import { Analytics } from './pages/Analytics';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Toaster } from './components/ui/sonner';
import { BrowseHobbies } from './pages/BrowseHobbies';
import { Login } from './pages/Login';
import { apiUtils } from './utils/apiUtils';
import { Register } from './pages/Register';

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!apiUtils.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: ReactNode }) {
  if (apiUtils.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

function NotFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <RootLayout>
          <Dashboard />
        </RootLayout>
      </RequireAuth>
    ),
  },
  {
    path: '/browse',
    element: (
      <RequireAuth>
        <RootLayout><BrowseHobbies /></RootLayout>
      </RequireAuth>
    ),
  },
  {
    path: '/tracks',
    element: (
      <RequireAuth>
        <RootLayout>
          <MasteryTracks />
        </RootLayout>
      </RequireAuth>
    ),
  },
  {
    path: '/quests',
    element: (
      <RequireAuth>
        <RootLayout>
          <QuestBoard />
        </RootLayout>
      </RequireAuth>
    ),
  },
  {
    path: '/analytics',
    element: (
      <RequireAuth>
        <RootLayout>
          <Analytics />
        </RootLayout>
      </RequireAuth>
    ),
  },
  {
    path: '/login',
    element: (
      <RedirectIfAuth>
        <Login />
      </RedirectIfAuth>
    ),
  },
  {
    path: '/register',
    element: (
      <RedirectIfAuth>
        <Register />
      </RedirectIfAuth>
    ),
  },
  {
    path: '*',
    element: (
      <RequireAuth>
        <RootLayout>
          <NotFound />
        </RootLayout>
      </RequireAuth>
    ),
  },
]);
