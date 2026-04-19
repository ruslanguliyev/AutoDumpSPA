import { useTranslation } from 'react-i18next';

type RefineSearchToggleProps = {
  isExpanded: boolean;
  onToggle: () => void;
};

const RefineSearchToggle = ({ isExpanded, onToggle }: RefineSearchToggleProps) => {
  const { t } = useTranslation('vehicle');

  return (
    <button
      type="button"
      onClick={onToggle}
      className="mx-auto text-sm font-medium text-primary hover:underline"
      aria-expanded={isExpanded}
    >
      {t('searchBox.refine')}
    </button>
  );
};

export default RefineSearchToggle;
