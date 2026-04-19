import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Wrench, Zap } from 'lucide-react';

import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

type QuickAction = {
  key: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  to: string;
};

const baseActions: QuickAction[] = [
  { key: 'quickActions.addVehicle', icon: Plus, to: '/add' },
  { key: 'quickActions.addService', icon: Wrench, to: '/add' },
  { key: 'quickActions.boostListing', icon: Zap, to: '/dashboard' },
];

type QuickActionsProps = {
  actions?: QuickAction[];
};

export function QuickActions({ actions = baseActions }: QuickActionsProps) {
  const { t } = useTranslation('dashboard');

  return (
    <CardWrapper className="p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">
        {t('quickActions.title')}
      </h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.key}
              to={a.to}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Icon size={18} className="text-primary" aria-hidden />
              {t(a.key)}
            </Link>
          );
        })}
      </div>
    </CardWrapper>
  );
}
