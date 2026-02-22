import { Suspense } from 'react';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import Skeleton from '@/shared/ui/Skeleton';
import {
  FeaturedCategories,
  SponsoredProducts,
  YouMayAlsoLike,
  FeaturedVehicles,
  TopServices,
  TopSpecialists,
} from './sections';

const SectionFallback = () => (
  <div className="py-8">
    <Skeleton className="mb-6 h-8 w-48" />
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[300px] w-full" />
      ))}
    </div>
  </div>
);

const HomePage = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <FeaturedCategories />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <SponsoredProducts />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <YouMayAlsoLike />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <FeaturedVehicles />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <TopServices />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <TopSpecialists />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default HomePage;
