import { autos } from "@/vehicles/api/data";

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const parseCurrency = (value) => {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
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
  const color = normalize(filters.color);
  const marketRegion = normalize(filters.marketRegion);
  const condition = normalize(filters.condition);
  const status = normalize(filters.status);
  const fuel = Array.isArray(filters.fuel)
    ? filters.fuel.map((value) => normalize(value))
    : [];
  const transmission = Array.isArray(filters.transmission)
    ? filters.transmission.map((value) => normalize(value))
    : [];

  const priceFrom = toNumber(filters.priceFrom);
  const priceTo = toNumber(filters.priceTo) ?? parseCurrency(filters.price);

  const yearFrom = toNumber(filters.yearFrom);
  const yearTo = toNumber(filters.yearTo);
  const registrationYear = Number(filters.registration);
  const hasRegistrationYear =
    Number.isFinite(registrationYear) &&
    String(filters.registration ?? "").trim() !== "";

  const engineVolumeFrom = toNumber(filters.engineVolumeFrom);
  const engineVolumeTo = toNumber(filters.engineVolumeTo);
  const powerFrom = toNumber(filters.powerFrom);
  const powerTo = toNumber(filters.powerTo);
  const mileageFrom = toNumber(filters.mileageFrom);
  const mileageTo = toNumber(filters.mileageTo);
  const ownersCount = toNumber(filters.ownersCount);
  const seatsCount = toNumber(filters.seatsCount);

  return autos.filter((car) => {
    if (vehicleType && normalize(car.vehicleType) !== vehicleType) return false;

    if (brand && normalize(car.brand) !== brand) return false;

    if (model && !normalize(car.model).includes(model)) return false;

    if (priceFrom !== null && Number(car.price ?? 0) < priceFrom) return false;
    if (priceTo !== null && Number(car.price ?? 0) > priceTo) return false;

    if (condition && condition !== "all") {
      if (normalize(car.condition) !== condition) return false;
    }

    if (filters.isCredit && !car.isCreditAvailable) return false;

    if (filters.isBarter && !car.isBarterAvailable) return false;

    if (fuel.length && !fuel.includes(normalize(car.fuel))) return false;

    if (transmission.length && !transmission.includes(normalize(car.transmission)))
      return false;

    if (
      engineVolumeFrom !== null &&
      Number(car.engineVolume ?? 0) < engineVolumeFrom
    )
      return false;
    if (
      engineVolumeTo !== null &&
      Number(car.engineVolume ?? 0) > engineVolumeTo
    )
      return false;

    if (powerFrom !== null && Number(car.power ?? 0) < powerFrom) return false;
    if (powerTo !== null && Number(car.power ?? 0) > powerTo) return false;

    if (mileageFrom !== null && Number(car.mileage ?? 0) < mileageFrom)
      return false;
    if (mileageTo !== null && Number(car.mileage ?? 0) > mileageTo) return false;

    if (
      ownersCount !== null &&
      Number(car.ownersCount ?? car.owners ?? 0) !== ownersCount
    )
      return false;

    if (seatsCount !== null && Number(car.seatsCount ?? 0) !== seatsCount)
      return false;

    if (marketRegion && normalize(car.marketRegion) !== marketRegion) return false;

    if (color && normalize(car.color) !== color) return false;

    if (filters.hasNoDamage && car.hasDamage !== false) return false;

    if (filters.isUnpainted && car.isRepainted !== false) return false;

    if (filters.isAccidentedOnly && car.wasInAccident !== true) return false;

    if (status && status !== "all" && normalize(car.status) !== status)
      return false;

    const carYear = Number(car.year ?? 0);
    const hasYearRange = yearFrom !== null || yearTo !== null;

    if (hasYearRange) {
      if (yearFrom !== null && carYear < yearFrom) return false;
      if (yearTo !== null && carYear > yearTo) return false;
    } else if (filters.registration === "Older") {
      if (carYear >= 2015) return false;
    } else if (hasRegistrationYear) {
      if (carYear < registrationYear) return false;
    }

    if (region && !shouldMatchRegion(car.location, region)) return false;

    if (city && !normalize(car.location).includes(city)) return false;

    return true;
  });
}
