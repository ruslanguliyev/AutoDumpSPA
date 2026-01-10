import { useMemo } from 'react';
import PartsSearchFilter from '@/components/PartsSearchFilter/PartsSearchFilter';
import { partsFilterConfig } from '@/components/PartsSearchFilter/config/partsFilterConfig';
import { useParts } from '@/hooks/useParts';

const PartCard = ({ part, onSelect }) => (
  <article
    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    onClick={() => onSelect(part.id)}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          {part.category}
        </p>
        <h3 className="text-lg font-semibold text-slate-900">{part.name}</h3>
        <p className="text-sm text-slate-600">{part.description}</p>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold text-slate-900">
          {part.currency} {part.price.toLocaleString()}
        </div>
        <p className="text-xs text-slate-500">Stock: {part.stock}</p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
      <span className="rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-700">
        {part.brand} {part.model}
      </span>
      {part.oemCode ? (
        <span className="rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-700">
          OEM: {part.oemCode}
        </span>
      ) : null}
      <span className="rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-700">
        {part.condition}
      </span>
      <span className="rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-700">
        {part.location}
      </span>
    </div>
  </article>
);

const PartsPage = () => {
  const {
    parts,
    total,
    filters,
    setFilter,
    resetFilters,
    isLoading,
    error,
    refetch,
    selectPart,
  } = useParts();

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : null;

  const filterOptions = useMemo(() => {
    const unique = (values) => [...new Set(values.filter(Boolean))].sort();
    const toOptions = (values) => unique(values).map((value) => ({ value, label: value }));
    const ensureSelected = (options, selectedValue) => {
      if (!selectedValue) return options;
      if (options.some((option) => option.value === selectedValue)) return options;
      return [{ value: selectedValue, label: selectedValue }, ...options];
    };

    const brands = ensureSelected(
      toOptions(parts.map((part) => part.brand)),
      filters.brand
    );

    const modelsSource = filters.brand
      ? parts.filter((part) => part.brand === filters.brand).map((part) => part.model)
      : parts.map((part) => part.model);
    const models = ensureSelected(toOptions(modelsSource), filters.model);

    const locations = ensureSelected(
      toOptions(parts.map((part) => part.location)),
      filters.location
    );

    return {
      ...partsFilterConfig,
      brands,
      models,
      locations,
    };
  }, [filters.brand, filters.model, filters.location, parts]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Parts marketplace
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          OEM & aftermarket parts with real inventory
        </h1>
        <p className="text-sm text-slate-600">
          Powered by a GraphQL backend. Swap the endpoint to go live.
        </p>
      </header>

      <PartsSearchFilter
        filters={filters}
        options={filterOptions}
        onChange={setFilter}
        onReset={resetFilters}
        onSubmit={refetch}
        isLoading={isLoading}
        total={total}
      />

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="font-semibold">Failed to load parts.</div>
          <div className="mt-1">
            {errorMessage ? (
              <span>
                {errorMessage}.{' '}
              </span>
            ) : null}
            Check <code className="rounded bg-red-100 px-1">VITE_GRAPHQL_ENDPOINT</code> or enable
            mocks with{' '}
            <code className="rounded bg-red-100 px-1">VITE_USE_PARTS_MOCKS=true</code>.
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        {isLoading && parts.length === 0 ? (
          <div className="col-span-full text-sm text-slate-500">
            Loading inventory…
          </div>
        ) : null}

        {!isLoading && parts.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-100 bg-white px-4 py-6 text-sm text-slate-600">
            No parts match these filters. Adjust search and try again.
          </div>
        ) : null}

        {parts.map((part) => (
          <PartCard key={part.id} part={part} onSelect={selectPart} />
        ))}
      </section>
    </div>
  );
};

export default PartsPage;

