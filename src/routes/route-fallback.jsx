const RouteFallback = () => {
  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading…
        </div>
      </div>
    </div>
  );
};

export default RouteFallback;
