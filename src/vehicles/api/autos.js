import { autos } from "@/vehicles/api/data";

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const parseCurrency = (value) => {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
};

const shouldMatchRegion = (location, region) => {
  if (!region || region === "europe") return true;

  const regionMap = {
    germany: "germany",
    france: "france",
    italy: "italy",
    spain: "spain",
    uk: "united kingdom",
  };

  const regionLabel = regionMap[region] || region;
  return normalize(location).includes(regionLabel);
};

export const getAutos = () => autos;

export const getAutoById = (id) => {
  const safeId = String(id ?? '').trim();
  if (!safeId) return null;
  return autos.find((car) => String(car.id) === safeId) ?? null;
};

export function getAutosByFilters(filters) {
  const brand = normalize(filters.brand);
  const model = normalize(filters.model);
  const vehicleType = normalize(filters.vehicleType);
  const city = normalize(filters.city);
  const region = normalize(filters.region);
  const maxPrice = parseCurrency(filters.price);
  const yearFrom = Number(filters.registration);
  const hasYearFrom =
    Number.isFinite(yearFrom) && String(filters.registration ?? "").trim() !== "";

  return autos.filter((car) => {
    if (vehicleType && normalize(car.vehicleType) !== vehicleType) return false;

    if (brand && normalize(car.brand) !== brand) return false;

    if (model && !normalize(car.model).includes(model)) return false;

    if (maxPrice !== null && Number(car.price ?? 0) > maxPrice) return false;

    if (filters.registration === "Older") {
      if (Number(car.year ?? 0) >= 2015) return false;
    } else if (hasYearFrom) {
      if (Number(car.year ?? 0) < yearFrom) return false;
    }

    if (region && !shouldMatchRegion(car.location, region)) return false;

    if (city && !normalize(car.location).includes(city)) return false;

    return true;
  });
}
