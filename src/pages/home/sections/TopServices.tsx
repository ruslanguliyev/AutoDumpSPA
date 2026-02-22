import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useServices } from '@/services/hooks/useServices';
import ServiceCard from '@/services/components/ServiceCard';
import SectionHeader from '@/shared/ui/SectionHeader';
import Skeleton from '@/shared/ui/Skeleton';

const SERVICES_LIMIT = 4;

const TopServices = () => {
  const { t } = useTranslation('home');
  const { services, isLoading } = useServices();

  const topServices = useMemo(() => {
    return services.slice(0, SERVICES_LIMIT);
  }, [services]);

  if (isLoading) {
    return (
      <section className="py-8">
        <SectionHeader title={t('sections.topAutoServices', 'Top Auto Services')} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: SERVICES_LIMIT }).map((_, i) => (
            <Skeleton key={i} className="h-[380px] w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (topServices.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <SectionHeader
        title={t('sections.topAutoServices', 'Top Auto Services')}
        linkText={t('common.findServices', 'Find Services')}
        linkHref="/services"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {topServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
};

export default TopServices;
