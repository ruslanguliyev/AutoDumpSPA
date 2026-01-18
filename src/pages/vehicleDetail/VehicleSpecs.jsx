const VehicleSpecs = ({ car }) => {
  return (
    <>
      {/* ХАРАКТЕРИСТИКИ */}
      <div className="vehicle-specs-section">
        <h2>Характеристики</h2>

        <div className="specs-grid">
          <div className="spec-row">
            <span className="spec-name">Марка:</span>
            <span className="spec-value">{car.brand}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Модель:</span>
            <span className="spec-value">{car.model}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Версия:</span>
            <span className="spec-value">{car.version}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Код авто:</span>
            <span className="spec-value">{car.code}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Год выпуска:</span>
            <span className="spec-value">{car.year}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Мотор:</span>
            <span className="spec-value">{car.engine}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Коробка передач:</span>
            <span className="spec-value">{car.transmission}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Привод:</span>
            <span className="spec-value">{car.drive}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Пробег:</span>
            <span className="spec-value">{car.mileage} km</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Локация:</span>
            <span className="spec-value">{car.location}</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Количество владельцев:</span>
            <span className="spec-value">{car.owners || "—"}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">В кредите:</span>
            <span className="spec-value">{car.isFinanced ? "Да" : "Нет"}</span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Дата публикации:</span>
            <span className="spec-value">
              {car.postedAt ? new Date(car.postedAt).toLocaleDateString() : "—"}
            </span>
          </div>

          <div className="spec-row">
            <span className="spec-name">Просмотры:</span>
            <span className="spec-value">{car.views || 0}</span>
          </div>
        </div>
      </div>

      {car.sellerNote && (
        <div className="owner-note">
          <h3>Комментарий владельца</h3>
          <p>{car.sellerNote}</p>
        </div>
      )}
    </>
  );
};

export default VehicleSpecs;

