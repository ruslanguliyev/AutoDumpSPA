import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useCreateDraft } from '@/features/addItem/api/useDraft';
import type { ListingType } from '@/features/addItem/store/useAddItemStore';
import Button from '@/shared/ui/button';

const cardClass =
  'flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]';

const AddEntryPage = () => {
  const { t } = useTranslation('addItem');
  const navigate = useNavigate();
  const createDraft = useCreateDraft();

  const handleSelect = (type: ListingType) => {
    createDraft.mutate(type, {
      onSuccess: (draft) => {
        navigate(`/add/${draft.id}`);
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className={cardClass}>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t('entry.vehicle.title')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('entry.vehicle.description')}
            </p>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={() => handleSelect('vehicle')}
            disabled={createDraft.isPending}
          >
            {t('entry.vehicle.button')}
          </Button>
        </div>
        <div className={cardClass}>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t('entry.part.title')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('entry.part.description')}
            </p>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={() => handleSelect('part')}
            disabled={createDraft.isPending}
          >
            {t('entry.part.button')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryPage;
