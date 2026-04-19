import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useDraft, useSaveDraft } from '@/features/addItem/api/useDraft';
import { usePublishDraft } from '@/features/addItem/api/usePublish';
import AddLayout from '@/features/addItem/components/AddLayout';
import FooterActions from '@/features/addItem/components/FooterActions';
import PreviewCard from '@/features/addItem/components/PreviewCard';
import Stepper from '@/features/addItem/components/Stepper';
import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import { buildSteps } from '@/features/addItem/utils/buildSteps';
import Button from '@/shared/ui/button';

const useDebouncedValue = <T,>(value: T, delay = 700) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const AddWizardPage = () => {
  const { t } = useTranslation('addItem');
  const { draftId } = useParams();
  const navigate = useNavigate();
  const draftQuery = useDraft(draftId);
  const saveDraft = useSaveDraft();
  const publishDraft = usePublishDraft();

  const draft = useAddItemStore((state) => state.draft);
  const stepIndex = useAddItemStore((state) => state.stepIndex);
  const dirty = useAddItemStore((state) => state.dirty);
  const saveStatus = useAddItemStore((state) => state.saveStatus);

  const setDraft = useAddItemStore((state) => state.setDraft);
  const syncDraft = useAddItemStore((state) => state.syncDraft);
  const setStepIndex = useAddItemStore((state) => state.setStepIndex);
  const nextStep = useAddItemStore((state) => state.nextStep);
  const prevStep = useAddItemStore((state) => state.prevStep);
  const setSaveStatus = useAddItemStore((state) => state.setSaveStatus);
  const markSaved = useAddItemStore((state) => state.markSaved);

  const didHydrate = useRef(false);

  useEffect(() => {
    didHydrate.current = false;
  }, [draftId]);

  useEffect(() => {
    if (draftQuery.data && !didHydrate.current) {
      setDraft(draftQuery.data);
      didHydrate.current = true;
    }
  }, [draftQuery.data, setDraft]);

  const steps = useMemo(() => buildSteps(draft), [draft]);
  const CurrentStep = steps[stepIndex]?.Component ?? null;
  const debouncedDraft = useDebouncedValue(draft, 800);

  useEffect(() => {
    if (!steps.length) return;
    if (stepIndex > steps.length - 1) {
      setStepIndex(steps.length - 1);
    }
  }, [steps.length, stepIndex, setStepIndex]);

  useEffect(() => {
    if (!draftId || !debouncedDraft || !dirty) return;
    setSaveStatus('saving');
    saveDraft.mutate(
      { draftId, patch: debouncedDraft },
      {
        onSuccess: (data) => {
          if (data) syncDraft(data);
          markSaved();
        },
        onError: () => setSaveStatus('error'),
      }
    );
  }, [
    debouncedDraft,
    dirty,
    draftId,
    markSaved,
    saveDraft,
    setSaveStatus,
    syncDraft,
  ]);

  const handleSave = () => {
    if (!draftId || !draft) return;
    setSaveStatus('saving');
    saveDraft.mutate(
      { draftId, patch: draft },
      {
        onSuccess: (data) => {
          if (data) syncDraft(data);
          markSaved();
        },
        onError: () => setSaveStatus('error'),
      }
    );
  };

  const handlePublish = () => {
    if (!draftId) return;
    publishDraft.mutate(draftId, {
      onSuccess: (data) => {
        if (data) syncDraft(data);
      },
    });
  };

  if (draftQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 text-sm text-muted-foreground">
        {t('loading.draft')}
      </div>
    );
  }

  if (draftQuery.error) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
          {t('errors.loadDraftFailed')}
        </div>
      </div>
    );
  }

  if (!draftQuery.data) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
          <h1 className="text-lg font-semibold text-foreground">{t('errors.draftNotFound')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('errors.draftNotFoundHint')}
          </p>
          <Button className="mt-4" onClick={() => navigate('/add')}>
            {t('buttons.startNewDraft')}
          </Button>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 text-sm text-muted-foreground">
        {t('loading.preparing')}
      </div>
    );
  }

  const canProceed = steps[stepIndex]?.validate(draft) ?? true;

  return (
    <AddLayout
      stepper={
        <Stepper
          steps={steps}
          currentStepIndex={stepIndex}
          draft={draft}
          onStepChange={setStepIndex}
        />
      }
      preview={<PreviewCard draft={draft} />}
      footer={
        <FooterActions
          steps={steps}
          stepIndex={stepIndex}
          draft={draft}
          saveStatus={saveStatus}
          onBack={prevStep}
          onNext={() => nextStep(steps.length)}
          onSave={handleSave}
          onPublish={handlePublish}
          isSaving={saveDraft.isPending}
          isPublishing={publishDraft.isPending}
          canProceed={canProceed}
        />
      }
    >
      {CurrentStep ? <CurrentStep /> : null}
    </AddLayout>
  );
};

export default AddWizardPage;
