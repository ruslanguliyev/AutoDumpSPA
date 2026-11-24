import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import Header from '@/shared/layout/Header/Header';
import Footer from '@/shared/layout/Footer/Footer';
import { AdRails } from '@/shared/layout/AdRails';
import { AiChatWidget } from '@/features/ai/chat/AiChatWidget';
import RouteFallback from '@/routes/route-fallback';

/**
 * The shell every public page sits in. AdRails reserves the two 160px columns at
 * 1440px and wider and does nothing at all below that; no page passes ad content yet.
 */
const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex-1">
        <AdRails>
          <main className="min-w-0">
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </main>
        </AdRails>
      </div>
      <Footer />
      <AiChatWidget />
    </div>
  );
};

export default MainLayout;
