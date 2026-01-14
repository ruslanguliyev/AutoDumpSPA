import { useMemo, useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { PartSellerCard } from '@/features/parts/part-details/ui/PartSellerCard';

const clampQty = (value, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  const safe = Math.trunc(parsed);
  if (safe < 1) return 1;
  if (Number.isFinite(max) && max > 0) return Math.min(safe, max);
  return safe;
};

export const PartPurchaseCard = ({ part, isFavorited, onToggleFavorite }) => {
  const addToCart = useCartStore((s) => s.addToCart);

  const maxQty = useMemo(() => {
    const stock = Number(part?.stock ?? 0);
    return Number.isFinite(stock) ? stock : 0;
  }, [part?.stock]);

  const [qty, setQty] = useState(1);

  const inStock = (part?.stock ?? 0) > 0;
  const priceLabel =
    part?.price != null ? `${Number(part.price).toFixed(2)} ${part?.currency ?? ''}` : '—';

  const onDec = () => setQty((v) => clampQty(v - 1, maxQty));
  const onInc = () => setQty((v) => clampQty(v + 1, maxQty));

  const onAdd = () => {
    if (!part) return;
    if (!inStock) return;
    addToCart(part, clampQty(qty, maxQty));
  };

  const onFav = () => {
    if (!part) return;
    onToggleFavorite?.();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm lg:sticky lg:top-[90px]">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-lg font-extrabold tracking-tight">{priceLabel}</div>
          <div className="mt-1 text-xs font-semibold text-muted-foreground">
            {inStock ? `In stock: ${part.stock}` : 'Out of stock'}
          </div>
        </div>

        <div className="rounded-xl bg-secondary p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Quantity
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-xl border border-border bg-background text-lg font-bold transition hover:bg-accent disabled:opacity-50"
              onClick={onDec}
              disabled={!inStock || qty <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <input
              value={qty}
              onChange={(e) => setQty(clampQty(e.target.value, maxQty))}
              inputMode="numeric"
              className="h-10 w-20 rounded-xl border border-border bg-background text-center text-sm font-bold"
              aria-label="Quantity"
              disabled={!inStock}
            />

            <button
              type="button"
              className="h-10 w-10 rounded-xl border border-border bg-background text-lg font-bold transition hover:bg-accent disabled:opacity-50"
              onClick={onInc}
              disabled={!inStock || (maxQty > 0 && qty >= maxQty)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            onClick={onAdd}
            disabled={!inStock}
          >
            <ShoppingCart size={18} />
            Add to cart
          </button>

          <button
            type="button"
            className={[
              'inline-flex w-12 items-center justify-center rounded-xl border text-foreground transition disabled:opacity-50',
              isFavorited
                ? 'border-primary/30 bg-primary/10 text-primary'  
                : 'border-border bg-background hover:bg-accent',
            ].join(' ')}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            onClick={onFav}
            disabled={!part?.id}
          >
            <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>

        <PartSellerCard seller={part?.seller} />
      </div>
    </div>
  );
};


