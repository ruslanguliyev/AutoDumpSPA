import '@fontsource-variable/inter';
// Initialize theme BEFORE React renders to prevent FOUC
import '@/shared/utils/theme-init';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Initialize i18next (must be imported before components that use it)
import { i18nReady } from '@/i18n';
import App from '@/app/App.jsx';
import '@/app/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Dynamic import so the production build drops the module entirely.
// A static import would still be tree-shaken today (the package no-ops outside
// development), but the package would stay a reason to install it for the build.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((mod) => ({
        default: mod.ReactQueryDevtools,
      })),
    )
  : null;

// Render once the active language bundle is in; useSuspense is off, so rendering
// earlier would flash raw translation keys.
const renderApp = () =>
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV && ReactQueryDevtools ? (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        ) : null}
      </QueryClientProvider>
    </StrictMode>
  );

i18nReady
  .catch((error) => console.error('Failed to load translations:', error))
  .finally(renderApp);
