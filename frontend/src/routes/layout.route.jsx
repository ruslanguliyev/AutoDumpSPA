import { useLocation, Outlet } from 'react-router-dom';

import MainLayout from '@/shared/layout/MainLayout';
import ScrollToTopOnRouteChange from '@/shared/hooks/ScrollToTopOnRouteChange';
import RouteTitle from '@/routes/RouteTitle';

const isDashboardPath = (pathname) =>
  /^(\/[a-z]{2})?\/dashboard(\/|$)/.test(pathname);

const LayoutRoute = () => {
  const location = useLocation();

  if (isDashboardPath(location.pathname)) {
    return (
      <>
        <ScrollToTopOnRouteChange />
        <RouteTitle />
        <Outlet />
      </>
    );
  }

  return (
    <>
      <ScrollToTopOnRouteChange />
      <RouteTitle />
      <MainLayout />
    </>
  );
};

export default LayoutRoute;
