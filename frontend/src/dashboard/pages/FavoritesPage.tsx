import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { useFavoritesStore } from '@/shared/store/favoritesStore';

type FavoriteItem = {
  key: string;
  id: string;
  type: 'vehicle' | 'part';
  title: string;
  thumbnail: string | null;
};

export function FavoritesPage() {
  const { t } = useTranslation('dashboard');
  const items = useFavoritesStore((s) => s.items) as FavoriteItem[];
  const remove = useFavoritesStore((s) => s.removeFromFavorites);

  return (
    <div className="space-y-8">
      <DashboardHeader title={t('favorites.title')} subtitle={t('favorites.subtitle')} />

      {items.length === 0 ? (
        <CardWrapper className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">{t('favorites.empty')}</p>
        </CardWrapper>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const thumb = resolveMediaUrl(item.thumbnail);
            const href = item.type === 'vehicle' ? `/vehicles/${item.id}` : `/parts/${item.id}`;
            return (
              <li key={item.key}>
                <CardWrapper className="flex items-center gap-3 p-3">
                  <Link to={href} className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {thumb ? (
                        <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t(`favorites.type.${item.type}`)}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.type, item.id)}
                    aria-label={t('favorites.remove')}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-destructive"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </CardWrapper>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
