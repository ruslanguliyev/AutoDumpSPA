import MainLayout from '@/shared/layout/MainLayout';
import ScrollToTopOnRouteChange from '@/shared/hooks/ScrollToTopOnRouteChange';

const LayoutRoute = () => {
  return (
    <>
      <ScrollToTopOnRouteChange />
      <MainLayout />
    </>
  );
};

export default LayoutRoute;
