import ServiceCard from './ServiceCard';

const ServicesGrid = ({ services, isLoading }) => {
  if (isLoading && services.length === 0) {
    return (
      <div className="col-span-full text-sm text-muted-foreground">
        Loading services…
      </div>
    );
  }

  if (!isLoading && services.length === 0) {
    return (
      <div className="col-span-full rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        No services match these filters. Adjust search and try again.
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
