import { Link } from 'react-router-dom';

export const PartSellerCard = ({ seller }) => {
  if (!seller?.id) return null;

  const name = seller?.name || 'Seller';
  const rating =
    Number.isFinite(Number(seller?.rating)) && seller?.rating != null ? Number(seller.rating) : null;
  const votes =
    Number.isFinite(Number(seller?.votes)) && seller?.votes != null ? Number(seller.votes) : null;
  const avatar = seller?.logo || seller?.avatarUrl || null;
  const type = seller?.type || null;

  return (
    <Link
      to={`/seller/${seller.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:bg-accent"
      aria-label={`Open seller ${name}`}
    >
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="h-14 w-14 rounded-xl border border-border bg-background object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-14 w-14 rounded-xl border border-border bg-secondary" />
      )}

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-extrabold text-foreground">{name}</div>
        {type ? (
          <div className="mt-0.5 text-xs font-semibold text-muted-foreground">{type}</div>
        ) : null}

        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          {rating != null ? (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">⭐</span>
              <span className="font-extrabold text-foreground">{rating.toFixed(1)}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">No rating</span>
          )}

          {votes != null ? <span className="text-muted-foreground">({votes})</span> : null}
        </div>
      </div>

      <div className="shrink-0 text-xs font-extrabold text-muted-foreground transition group-hover:text-foreground">
        View
      </div>
    </Link>
  );
};


