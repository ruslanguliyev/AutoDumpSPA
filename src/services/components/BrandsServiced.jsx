export default function BrandsServiced({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="service-detail-page__brands rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
      <h2 className="mb-3 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">Brands Serviced</h2>
      <div className="flex flex-wrap gap-3">
        {brands.map((brand) => (
          <div key={brand} className="brand-item">
            {brand}
          </div>
        ))}
      </div>
    </section>
  );
}
