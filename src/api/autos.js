import { autos } from "../data/data";

export function getAutosByFilters(filters) {
  return autos.filter((car) => {
    if (filters.brand && car.brand !== filters.brand) return false;
    if (filters.model && !car.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
    if (filters.vehicleType && car.vehicleType !== filters.vehicleType) return false;
    return true;
  });
}
