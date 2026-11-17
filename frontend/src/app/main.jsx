import '@fontsource-variable/inter';
// Initialize theme BEFORE React renders to prevent FOUC
import '@/shared/utils/theme-init';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// Initialize i18next (must be imported before components that use it)
import '@/i18n';
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Default bottom-right sits on the detail-page call bar. */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
    </QueryClientProvider>
  </StrictMode>
);
