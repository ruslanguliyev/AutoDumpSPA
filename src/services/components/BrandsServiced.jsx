export default function BrandsServiced({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="service-detail-page__brands rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Brands Serviced</h2>
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
