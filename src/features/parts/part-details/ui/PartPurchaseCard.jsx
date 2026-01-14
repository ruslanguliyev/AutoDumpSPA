import { useMemo, useState } from 'react';
import { Check, Heart, ShieldCheck, ShoppingCart } from 'lucide-react';
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

    const safeQty = clampQty(qty, maxQty);
    const payload = {
      id: part.id,
      productId: part.id,
      name: part.name,
      price: part.price ?? 0,
      currency: part.currency,
      imageUrl: part.imageUrl,
      sellerId: part?.seller?.id ?? null,
    };

    addToCart(payload, safeQty);
  };

  const onFav = () => {
    if (!part) return;
    onToggleFavorite?.();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-[157px]">
      <div className="space-y-4">
        {/* 1) Price block */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-center text-2xl font-black tracking-tight text-foreground">
              {priceLabel}
            </div>
            <div className="mt-1 text-center text-xs font-semibold text-emerald-600">
              {inStock ? `In stock: ${part.stock}` : 'Out of stock'}
            </div>
          </div>

          {/* 5) Favorites (secondary) */}
          <button
            type="button"
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50',
              isFavorited
                ? 'bg-primary/10 text-primary'
                : 'bg-transparent',
            ].join(' ')}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={Boolean(isFavorited)}
            onClick={onFav}
            disabled={!part?.id}
          >
            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* 2) Quantity selector */}
        <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
          <div className="text-center text-[11px] font-extrabold tracking-wide text-muted-foreground">
            QUANTITY
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border/60 bg-background text-base font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
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
              className="h-9 flex-1 rounded-lg border border-border/60 bg-background text-center text-sm font-extrabold"
              aria-label="Quantity"
              disabled={!inStock}
            />

            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-border/60 bg-background text-base font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
              onClick={onInc}
              disabled={!inStock || (maxQty > 0 && qty >= maxQty)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* 3) Primary action */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-4 py-3.5 text-sm font-black text-white shadow-md shadow-slate-900/20 transition hover:-translate-y-[1px] hover:from-slate-950 hover:via-slate-900 hover:to-slate-800 hover:shadow-lg hover:shadow-slate-900/25 active:translate-y-0 active:shadow-md disabled:opacity-50"
          onClick={onAdd}
          disabled={!inStock}
        >
          <ShoppingCart size={18} />
          Add to cart
        </button>

        {/* 4) Trust signals */}
        <div className="flex items-center justify-center gap-6 border-b border-border pb-3 text-[11px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-emerald-600" aria-hidden="true" />
            Free returns
          </span>
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-emerald-600" aria-hidden="true" />
            Secure checkout
          </span>
        </div>

        {/* 5) Seller card */}
        <PartSellerCard seller={part?.seller} />

        {/* 6) Protection / guarantees */}
        <div className="rounded-xl border border-border bg-secondary/10 p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-extrabold text-foreground">
            <ShieldCheck size={16} className="text-primary" aria-hidden="true" />
            Buyer protection
          </div>
          <div className="mt-2 flex flex-col gap-2 font-semibold">
            <span className="inline-flex items-center gap-2">
              <Check size={14} className="text-emerald-600" aria-hidden="true" />
              Verified seller
            </span>
            <span className="inline-flex items-center gap-2">
              <Check size={14} className="text-emerald-600" aria-hidden="true" />
              Secure payment
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


