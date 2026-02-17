import { useTranslation } from 'react-i18next';

import type { ListingDraft } from '@/features/addItem/store/useAddItemStore';
import type { StepDefinition } from '@/features/addItem/utils/buildSteps';
import { cn } from '@/shared/utils/cn';

type StepperProps = {
  steps: StepDefinition[];
  currentStepIndex: number;
  draft: ListingDraft;
  onStepChange: (index: number) => void;
};

const Stepper = ({ steps, currentStepIndex, draft, onStepChange }: StepperProps) => {
  const { t } = useTranslation('addItem');

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-center gap-3">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isComplete = step.validate(draft);
          const isClickable = step.isAvailable(draft) && index <= currentStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepChange(index)}
              className={cn(
                'flex items-center gap-3 rounded-full border px-3 py-2 text-sm transition',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted',
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                  isComplete
                    ? 'bg-success text-success-foreground'
                    : isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {index + 1}
              </span>
              <span className="whitespace-nowrap">{t(`steps.${step.id}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
