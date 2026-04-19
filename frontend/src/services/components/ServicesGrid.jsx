import { useTranslation } from 'react-i18next';
import ServiceCard from './ServiceCard';

const ServicesGrid = ({ services, isLoading }) => {
  const { t } = useTranslation('services');

  if (isLoading && services.length === 0) {
    return (
      <div className="col-span-full text-sm text-muted-foreground">
        {t('list.loading')}
      </div>
    );
  }

  if (!isLoading && services.length === 0) {
    return (
      <div className="col-span-full rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        {t('list.empty')}
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </section>
  );
};

export default ServicesGrid;
