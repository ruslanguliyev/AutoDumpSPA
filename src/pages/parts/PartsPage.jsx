import PartsSearchFilter from '@/components/PartsSearchFilter/PartsSearchFilter';
import { partsFilterConfig } from '@/components/PartsSearchFilter/config/partsFilterConfig';
import PartCard from '@/components/PartCard/PartCard.jsx';
import { useParts } from '@/hooks/useParts';

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
    selectOptions,
  } = useParts();

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : null;

  const filterOptions = {
    ...partsFilterConfig,
    ...selectOptions,
  };

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

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
          <PartCard key={part.id} part={part} />
        ))}
      </section>
    </div>
  );
};

export default PartsPage;

