import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import LayoutRoute from '@/routes/layout.route';
import LanguageRoute from '@/routes/LanguageRoute';
import RouteErrorBoundary from '@/routes/route-error-boundary';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

const Home = lazy(() => import('@/pages/home'));
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
const SpecialistsListPage = lazy(
  () => import('@/specialists/pages/SpecialistsListPage')
);
const SpecialistDetailPage = lazy(
  () => import('@/specialists/pages/SpecialistDetailPage')
);
const AddEntryPage = lazy(() => import('@/features/addItem/pages/AddEntryPage'));
const AddWizardPage = lazy(() => import('@/features/addItem/pages/AddWizardPage'));
const NotFound = lazy(() => import('@/app/pages/notFound/NotFound'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));

const DashboardLayout = lazy(() =>
  import('@/layouts/DashboardLayout').then((m) => ({ default: m.DashboardLayout }))
);
const DashboardOverviewPage = lazy(() =>
  import('@/dashboard/pages/DashboardOverviewPage').then((m) => ({ default: m.DashboardOverviewPage }))
);
const MyVehiclesPage = lazy(() =>
  import('@/dashboard/pages/MyVehiclesPage').then((m) => ({ default: m.MyVehiclesPage }))
);
const MyPartsPage = lazy(() =>
  import('@/dashboard/pages/MyPartsPage').then((m) => ({ default: m.MyPartsPage }))
);
const MyServicesPage = lazy(() =>
  import('@/dashboard/pages/MyServicesPage').then((m) => ({ default: m.MyServicesPage }))
);
const ModerationPage = lazy(() =>
  import('@/dashboard/pages/ModerationPage').then((m) => ({ default: m.ModerationPage }))
);
const InquiriesPage = lazy(() =>
  import('@/dashboard/pages/InquiriesPage').then((m) => ({ default: m.InquiriesPage }))
);
const FavoritesPage = lazy(() =>
  import('@/dashboard/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage }))
);
const SettingsPage = lazy(() =>
  import('@/dashboard/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const SellersPageRoute = () => {
  return <SellersPage />;
};

const SellerDetailPageRoute = () => {
  return <SellerDetailPage />;
};

const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardOverviewPage /> },
      { path: 'vehicles', element: <MyVehiclesPage /> },
      { path: 'parts', element: <MyPartsPage /> },
      { path: 'services', element: <MyServicesPage /> },
      { path: 'inquiries', element: <InquiriesPage /> },
      { path: 'moderation', element: <ModerationPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
];

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
  { path: 'specialists', element: <SpecialistsListPage /> },
  { path: 'specialists/:slug', element: <SpecialistDetailPage /> },
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
  { path: '*', element: <NotFound /> },
];

const router = createBrowserRouter([
  {
    element: <LayoutRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      ...createAppRoutes(),
      ...dashboardRoutes,
      {
        path: ':lang',
        element: <LanguageRoute />,
        children: [...createAppRoutes(), ...dashboardRoutes],
      },
    ],
  },
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
