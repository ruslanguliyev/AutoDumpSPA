import './App.css';
import Layout from '@/shared/layout/Layout';
import ScrollToTop from 'react-scroll-to-top';

function App() {
  return (
    <>
      <Layout />
      <ScrollToTop
        smooth
        className="!bg-card !w-11 !h-11 !rounded-full !shadow-[var(--shadow)] !border !border-border !flex !items-center !justify-center
             hover:opacity-90 transition"
        component={<span className="text-foreground text-xl">↑</span>}
      />
    </>
  );
}

export default App;
