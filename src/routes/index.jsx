import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import LayoutRoute from '@/routes/layout.route';
import LanguageRoute from '@/routes/LanguageRoute';
import RouteErrorBoundary from '@/routes/route-error-boundary';
import { fetchParts } from '@/parts/api/parts.api';
import { PARTS_DEFAULT_FILTER } from '@/parts/utils/parts.constants';
import { getAutos } from '@/vehicles/api/autos';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

const Home = lazy(() => import('@/vehicles/pages/home/Home'));
const About = lazy(() => import('@/app/pages/about/About'));
const AutoSearchResults = lazy(
  () => import('@/vehicles/pages/AutoSearchResults/AutoSearchResults')
);
const VehicleDetail = lazy(
  () => import('@/vehicles/pages/vehicleDetail/VehicleDetail')
);
const PartsPage = lazy(() => import('@/parts/pages/PartsPage'));
const PartDetailsPage = lazy(() => import('@/parts/pages/PartDetailsPage'));
const SellersPage = lazy(() => import('@/sellers/pages/SellersPage'));
const SellerDetailPage = lazy(() => import('@/sellers/pages/SellerDetailPage'));
const ServicesListPage = lazy(() => import('@/services/pages/ServicesListPage'));
const ServiceDetailPage = lazy(
  () => import('@/services/pages/ServiceDetailPage')
);
const AddEntryPage = lazy(() => import('@/features/addItem/pages/AddEntryPage'));
const AddWizardPage = lazy(() => import('@/features/addItem/pages/AddWizardPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));

const AUTOS_QUERY_KEY = 'autos';
const PARTS_QUERY_KEY = 'parts';
const EMPTY_LIST = [];

const useAutosListQuery = () =>
  useQuery({
    queryKey: [AUTOS_QUERY_KEY, 'all'],
    queryFn: getAutos,
    staleTime: 30_000,
    initialData: getAutos(),
  });

const useSellersPartsQuery = () =>
  useQuery({
    queryKey: [PARTS_QUERY_KEY, 'sellers'],
    queryFn: () =>
      fetchParts({ ...PARTS_DEFAULT_FILTER, limit: 10_000, offset: 0 }),
    staleTime: 30_000,
  });

const SellersPageRoute = () => {
  const { t } = useTranslation('sellers');
  const autosQuery = useAutosListQuery();
  const partsQuery = useSellersPartsQuery();
  const autosItems = autosQuery.data ?? EMPTY_LIST;
  const partsItems = partsQuery.data?.items ?? EMPTY_LIST;

  try {
    return (
      <SellersPage
        vehicles={autosItems}
        parts={partsItems}
        isPartsLoading={partsQuery.isLoading}
      />
    );
  } catch (error) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
            <div className="font-semibold">{t('errors.loadFailed')}</div>
            <div className="mt-1">{error?.message || String(error)}</div>
          </div>
        </div>
      </div>
    );
  }
};

const SellerDetailPageRoute = () => {
  const autosQuery = useAutosListQuery();
  const partsQuery = useSellersPartsQuery();
  const autosItems = autosQuery.data ?? EMPTY_LIST;
  const partsItems = partsQuery.data?.items ?? EMPTY_LIST;

  return <SellerDetailPage vehicles={autosItems} parts={partsItems} />;
};

const createAppRoutes = () => [
  { index: true, element: <Home /> },
  { path: 'about', element: <About /> },
  { path: 'autosearch', element: <AutoSearchResults /> },
  { path: 'parts', element: <PartsPage /> },
  { path: 'parts/:id', element: <PartDetailsPage /> },
  { path: 'vehicles/:id', element: <VehicleDetail /> },
  { path: 'sellers', element: <SellersPageRoute /> },
  { path: 'sellers/:sellerId', element: <SellerDetailPageRoute /> },
  { path: 'dealers', element: <SellersPageRoute /> },
  { path: 'dealers/:sellerId', element: <SellerDetailPageRoute /> },
  { path: 'services', element: <ServicesListPage /> },
  { path: 'services/:idOrSlug', element: <ServiceDetailPage /> },
  {
    path: 'add',
    element: (
      <ProtectedRoute>
        <AddEntryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'add/:draftId',
    element: (
      <ProtectedRoute>
        <AddWizardPage />
      </ProtectedRoute>
    ),
  },
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
];

const router = createBrowserRouter([
  {
    element: <LayoutRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      ...createAppRoutes(),
      {
        path: ':lang',
        element: <LanguageRoute />,
        children: createAppRoutes(),
      },
    ],
  },
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
