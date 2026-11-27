import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { isTokenExpired } from '@/lib/authToken';

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  // A token can run out while the tab stays open: treat it as logged out.
  const expired = isAuthenticated && isTokenExpired(accessToken);

  useEffect(() => {
    if (expired) logout();
  }, [expired, logout]);

  if (!isAuthenticated || expired) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
