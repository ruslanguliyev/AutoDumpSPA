import { useTranslation } from 'react-i18next';

import type { ListingDraft, SaveStatus } from '@/features/addItem/store/useAddItemStore';
import type { StepDefinition } from '@/features/addItem/utils/buildSteps';
import { validateDraft } from '@/features/addItem/utils/validateDraft';
import Button from '@/shared/ui/button';

type FooterActionsProps = {
  steps: StepDefinition[];
  stepIndex: number;
  draft: ListingDraft;
  saveStatus: SaveStatus;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
};

const FooterActions = ({
  steps,
  stepIndex,
  draft,
  saveStatus,
  canProceed,
  onBack,
  onNext,
  onSave,
  onPublish,
  isSaving,
  isPublishing,
}: FooterActionsProps) => {
  const { t } = useTranslation('addItem');
  const isFirst = stepIndex === 0;
  const isLast = stepIndex >= steps.length - 1;
  const canPublish = validateDraft(draft);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {t(`status.${saveStatus}`)}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="md" onClick={onBack} disabled={isFirst}>
          {t('buttons.back')}
        </Button>
        <Button variant="outline" size="md" onClick={onSave} disabled={isSaving}>
          {isSaving ? t('buttons.saving') : t('buttons.saveDraft')}
        </Button>
        {isLast ? (
          <Button
            size="lg"
            onClick={onPublish}
            disabled={!canPublish || isPublishing}
          >
            {isPublishing ? t('buttons.publishing') : t('buttons.submit')}
          </Button>
        ) : (
          <Button size="lg" onClick={onNext} disabled={!canProceed}>
            {t('buttons.next')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FooterActions;
