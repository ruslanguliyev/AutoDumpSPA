import { useVehicleStore } from '@/vehicles/store/vehicleStore';
import styles from './VehicleSelector.module.css';

const VehicleSelector = () => {
  const vehicle = useVehicleStore((state) => state.vehicle);
  const setVehicle = useVehicleStore((state) => state.setVehicle);

  const updateField = (field) => (event) => {
    setVehicle({ ...vehicle, [field]: event.target.value });
  };

  return (
    <section className={styles.section} aria-labelledby="vehicle-selector-title">
      <h2 id="vehicle-selector-title" className={styles.title}>
        Vehicle Selector
      </h2>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="vehicle-vin">
          VIN
        </label>
        <input
          id="vehicle-vin"
          className={styles.input}
          type="text"
          inputMode="text"
          placeholder="Enter VIN"
          value={vehicle.vin}
          onChange={updateField('vin')}
        />
      </div>
      <div className={styles.or}>or</div>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="vehicle-brand">
            Brand
          </label>
          <input
            id="vehicle-brand"
            className={styles.input}
            type="text"
            placeholder="Brand"
            value={vehicle.brand}
            onChange={updateField('brand')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="vehicle-model">
            Model
          </label>
          <input
            id="vehicle-model"
            className={styles.input}
            type="text"
            placeholder="Model"
            value={vehicle.model}
            onChange={updateField('model')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="vehicle-engine">
            Engine
          </label>
          <input
            id="vehicle-engine"
            className={styles.input}
            type="text"
            placeholder="Engine"
            value={vehicle.engine}
            onChange={updateField('engine')}
          />
        </div>
      </div>
    </section>
  );
};

export default VehicleSelector;
