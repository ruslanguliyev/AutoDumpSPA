import Layout from '@/shared/layout/Layout';
import ScrollToTopOnRouteChange from '@/shared/hooks/ScrollToTopOnRouteChange';

const LayoutRoute = () => {
  return (
    <>
      <ScrollToTopOnRouteChange />
      <Layout />
    </>
  );
};

export default LayoutRoute;
