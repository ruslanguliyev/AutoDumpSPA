import Header from '@/shared/layout/Header/Header';
import Footer from '@/shared/layout/Footer/Footer';
import { Outlet } from 'react-router-dom';

const AdSlot = () => {
  return (
    <div className="sticky top-24">
      <div className="flex h-[calc(100vh-144px)] min-h-[600px] items-center justify-center rounded-2xl border border-dashed border-foreground/15 bg-card/30 p-4 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">
        Ad Space
      </div>
    </div>
  );
};

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex-1">
        <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[220px_minmax(0,1fr)_220px]">
          <aside className="hidden xl:block" aria-label="Left advertisement">
            <AdSlot />
          </aside>
          <main className="min-w-0">
            <Outlet />
          </main>
          <aside className="hidden xl:block" aria-label="Right advertisement">
            <AdSlot />
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
    