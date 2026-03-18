import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { MasteryTracks } from './pages/MasteryTracks';
import { QuestBoard } from './pages/QuestBoard';
import { Analytics } from './pages/Analytics';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Toaster } from './components/ui/sonner';
import { BrowseHobbies } from './pages/BrowseHobbies';

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
      <RootLayout>
        <Dashboard />
      </RootLayout>
    ),
  },
  {
    path: '/browse',
    element: <RootLayout><BrowseHobbies /></RootLayout>,
  },
  {
    path: '/tracks',
    element: (
      <RootLayout>
        <MasteryTracks />
      </RootLayout>
    ),
  },
  {
    path: '/quests',
    element: (
      <RootLayout>
        <QuestBoard />
      </RootLayout>
    ),
  },
  {
    path: '/analytics',
    element: (
      <RootLayout>
        <Analytics />
      </RootLayout>
    ),
  },
  {
    path: '*',
    element: (
      <RootLayout>
        <NotFound />
      </RootLayout>
    ),
  },
]);
