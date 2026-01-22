import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PUBLIC_SELLER_TYPES = new Set(['dealer', 'reseller']);

export const PartSellerCard = ({ seller }) => {
  const navigate = useNavigate();

  if (!seller?.id) return null;

  const name = seller?.name || 'Seller';
  const rating =
    Number.isFinite(Number(seller?.rating)) && seller?.rating != null ? Number(seller.rating) : null;
  const votes =
    Number.isFinite(Number(seller?.votes)) && seller?.votes != null ? Number(seller.votes) : null;
  const avatar = seller?.logo || seller?.avatarUrl || null;
  const type = seller?.type || null;

  const canOpenPublicPage =
    PUBLIC_SELLER_TYPES.has(seller?.type) && seller?.hasPublicPage === true;

  const openDealerPage = () => {
    if (!canOpenPublicPage || !seller?.id) return;
    navigate(`/sellers/${seller.id}`);
  };

  const onCardKeyDown = (e) => {
    if (!canOpenPublicPage) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDealerPage();
    }
  };

  return (
    <div
      className={[
        'group flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 transition',
        canOpenPublicPage ? 'cursor-pointer hover:bg-accent' : 'cursor-default',
      ].join(' ')}
      aria-label={canOpenPublicPage ? `Open seller ${name}` : 'Seller info'}
      onClick={canOpenPublicPage ? openDealerPage : undefined}
      onKeyDown={canOpenPublicPage ? onCardKeyDown : undefined}
      role={canOpenPublicPage ? 'button' : undefined}
      tabIndex={canOpenPublicPage ? 0 : undefined}
    >
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="h-10 w-10 rounded-full border border-border bg-secondary object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-10 w-10 rounded-full border border-border bg-secondary" />
      )}

      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-muted-foreground">Sold by</div>
        <div className="mt-0.5 truncate text-sm font-extrabold text-foreground">{name}</div>

        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          {rating != null ? (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">⭐</span>
              <span className="font-extrabold text-foreground">{rating.toFixed(1)}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">No rating</span>
          )}

          {votes != null ? <span className="text-muted-foreground">({votes})</span> : null}
          {type ? <span className="text-muted-foreground">·</span> : null}
          {type ? <span className="text-muted-foreground">{type}</span> : null}
        </div>
      </div>

      {canOpenPublicPage ? (
        <ChevronRight
          size={18}
          className="shrink-0 text-muted-foreground transition group-hover:text-foreground"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
};
