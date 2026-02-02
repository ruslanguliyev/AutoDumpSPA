import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';

const VehicleSpecs = ({ car }) => {
  const { t } = useTranslation('vehicle');
  const locale = i18n.language || 'en';

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      return new Intl.DateTimeFormat(locale).format(new Date(value));
    } catch {
      return '—';
    }
  };

  return (
    <>
      {/* ХАРАКТЕРИСТИКИ */}
      <div className="vehicle-specs-section">
        <h2>{t('specs.title')}</h2>

        <div className="specs-grid">
          <div className="spec-row">
            <span className="spec-name">{t('specs.brand')}:</span>
            <span className="spec-value">{car.brand}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.model')}:</span>
            <span className="spec-value">{car.model}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.version')}:</span>
            <span className="spec-value">{car.version}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.code')}:</span>
            <span className="spec-value">{car.code}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.year')}:</span>
            <span className="spec-value">{car.year}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.engine')}:</span>
            <span className="spec-value">{car.engine}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.transmission')}:</span>
            <span className="spec-value">{car.transmission}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.drive')}:</span>
            <span className="spec-value">{car.drive}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.mileage')}:</span>
            <span className="spec-value">
              {car.mileage} {t('specs.km')}
            </span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.location')}:</span>
            <span className="spec-value">{car.location}</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">{t('specs.owners')}:</span>
            <span className="spec-value">{car.owners || '—'}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.financed')}:</span>
            <span className="spec-value">{car.isFinanced ? t('specs.yes') : t('specs.no')}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.postedAt')}:</span>
            <span className="spec-value">
              {formatDate(car.postedAt)}
            </span>
          </div>

          <div className="spec-row">
            <span className="spec-name">{t('specs.views')}:</span>
            <span className="spec-value">{car.views || 0}</span>
          </div>
        </div>
      </div>

      {car.sellerNote && (
        <div className="owner-note">
          <h3>{t('specs.ownerComment')}</h3>
          <p>{car.sellerNote}</p>
        </div>
      )}
    </>
  );
};

export default VehicleSpecs;
