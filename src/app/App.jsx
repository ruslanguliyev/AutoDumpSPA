import { Suspense } from 'react';
import ScrollToTop from 'react-scroll-to-top';
import AppRoutes from '@/routes';
import RouteFallback from '@/routes/route-fallback';

function App() {
  return (
    <>
      <ScrollToTop
        smooth
        className="!bg-card !w-11 !h-11 !rounded-full !shadow-[var(--shadow)] !border !border-border !flex !items-center !justify-center
             hover:opacity-90 transition"
        component={<span className="text-foreground text-xl">↑</span>}
      />
      <Suspense fallback={<RouteFallback />}>
        <AppRoutes />
      </Suspense>
    </>
  );
}

export default App;
