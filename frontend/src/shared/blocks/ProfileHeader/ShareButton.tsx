import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { shareOrCopyUrl } from '@/lib/share';
import Button from '@/shared/ui/button';

type ShareButtonProps = {
  title: string;
  url?: string;
  /** Icon-only square. The labelled button stays the default for other profile pages. */
  iconOnly?: boolean;
};

/** Shared “share this page” control for profile headers. 44px target. */
export function ShareButton({ title, url, iconOnly = false }: ShareButtonProps) {
  const { t } = useTranslation('common');
  const [notice, setNotice] = useState<string | null>(null);

  const onShare = async () => {
    const result = await shareOrCopyUrl({
      title,
      url: url ?? window.location.href,
    });
    if (result === 'copied') setNotice(t('share.copied'));
    else if (result === 'failed') setNotice(t('share.failed'));
    else setNotice(null);
  };

  if (iconOnly) {
    return (
      <span className="inline-flex shrink-0">
        <Button
          type="button"
          variant="icon"
          size="icon"
          aria-label={t('share.aria')}
          title={notice ?? t('share.action')}
          onClick={onShare}
        >
          <Share2 size={18} aria-hidden="true" />
        </Button>
        <span className="sr-only" role="status">
          {notice ?? ''}
        </span>
      </span>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
      <Button
        type="button"
        variant="secondary"
        className="min-h-11 gap-2"
        aria-label={t('share.aria')}
        onClick={onShare}
      >
        <Share2 size={18} aria-hidden="true" />
        <span className="hidden sm:inline">{t('share.action')}</span>
      </Button>
      {notice ? (
        <p className="text-[13px] text-muted-foreground" role="status">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
