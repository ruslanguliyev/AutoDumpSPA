import { useLocation, Outlet } from 'react-router-dom';

import MainLayout from '@/shared/layout/MainLayout';
import ScrollToTopOnRouteChange from '@/shared/hooks/ScrollToTopOnRouteChange';

const isDashboardPath = (pathname) =>
  /^(\/[a-z]{2})?\/dashboard(\/|$)/.test(pathname);

const LayoutRoute = () => {
  const location = useLocation();

  if (isDashboardPath(location.pathname)) {
    return (
      <>
        <ScrollToTopOnRouteChange />
        <Outlet />
      </>
    );
  }

  return (
    <>
      <ScrollToTopOnRouteChange />
      <MainLayout />
    </>
  );
};

export default LayoutRoute;
