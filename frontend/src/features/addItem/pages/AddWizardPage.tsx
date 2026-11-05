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
import { getDraftTitle } from '@/features/addItem/utils/validateDraft';
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
  const saveDraftMutation = useSaveDraft();
  const publishDraftMutation = usePublishDraft();

  // Destructure the stable `mutate` references — useMutation returns a new object
  // on every render (state changes), so using the whole object in effect deps
  // causes an infinite mutation loop. The `mutate` function itself IS stable
  // (useCallback([observer]) inside TanStack Query).
  const doSaveDraft = saveDraftMutation.mutate;
  const doPublishDraft = publishDraftMutation.mutate;

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
  const setCommonField = useAddItemStore((state) => state.setCommonField);

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

  useEffect(() => {
    const current = useAddItemStore.getState().draft;
    if (!current) return;
    const nextTitle = getDraftTitle(current);
    if (current.common.title !== nextTitle) {
      setCommonField('title', nextTitle);
    }
  }, [
    draft?.id,
    draft?.type,
    draft?.vehicle?.brand,
    draft?.vehicle?.model,
    draft?.part?.brand,
    draft?.part?.name,
    draft?.part?.partNumber,
    setCommonField,
  ]);

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
    // Published listings are saved explicitly so half-typed edits never go live.
    if (debouncedDraft.status === 'published') return;
    const snapshot = debouncedDraft;
    setSaveStatus('saving');
    doSaveDraft(
      { draftId, patch: snapshot },
      {
        onSuccess: (data) => {
          const current = useAddItemStore.getState().draft;
          const isStillCurrentSnapshot = current === snapshot;
          if (isStillCurrentSnapshot) {
            if (data) syncDraft(data);
            markSaved();
            return;
          }
          // A newer edit happened while this autosave request was in flight.
          // Do not overwrite store with stale payload or clear `dirty`.
          setSaveStatus('idle');
        },
        onError: () => setSaveStatus('error'),
      }
    );
  }, [
    debouncedDraft,
    dirty,
    draftId,
    markSaved,
    doSaveDraft,
    setSaveStatus,
    syncDraft,
  ]);

  const handleSave = () => {
    if (!draftId || !draft) return;
    setSaveStatus('saving');
    doSaveDraft(
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
    doPublishDraft(draftId, {
      onSuccess: (data) => {
        if (data) syncDraft(data);
        markSaved();
        navigate(data?.type === 'part' ? '/dashboard/parts' : '/dashboard/vehicles');
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
          isSaving={saveDraftMutation.isPending}
          isPublishing={publishDraftMutation.isPending}
          canProceed={canProceed}
        />
      }
    >
      {CurrentStep ? <CurrentStep /> : null}
    </AddLayout>
  );
};

export default AddWizardPage;
