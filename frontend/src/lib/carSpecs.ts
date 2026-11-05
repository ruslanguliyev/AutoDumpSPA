import { STATIC_SPECS } from '@/lib/carSpecsData';

export interface CarSpecs {
  displacement: number | null;
  horsepower: number | null;
  cylinders: number | null;
  fuelType: string | null;
  transmission: string | null;
  drive: string | null;
}

const specsCache = new Map<string, CarSpecs | null>();

export const mapFuelType = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  return (
    {
      gasoline: 'Petrol',
      gas: 'Petrol',
      diesel: 'Diesel',
      electric: 'Electric',
      hybrid: 'Hybrid',
    }[normalized] ?? 'Petrol'
  );
};

export const mapTransmission = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  return (
    {
      automatic: 'Automatic',
      manual: 'Manual',
      'semi-automatic': 'Semi-Automatic',
      cvt: 'Semi-Automatic',
    }[normalized] ?? 'Automatic'
  );
};

export const mapDrivetrain = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  return (
    {
      fwd: 'FWD',
      rwd: 'RWD',
      awd: 'AWD',
      '4wd': 'AWD',
      '4x4': 'AWD',
    }[normalized] ?? 'FWD'
  );
};

async function fetchFromApiNinjas(
  make: string,
  model: string,
  year: string
): Promise<CarSpecs | null> {
  const key = import.meta.env.VITE_CAR_API_KEY as string | undefined;
  if (!key) {
    console.warn('VITE_CAR_API_KEY not set');
    return null;
  }

  try {
    const params = new URLSearchParams({ make, model, year });
    const res = await fetch(`https://api.api-ninjas.com/v1/cars?${params.toString()}`, {
      headers: { 'X-Api-Key': key },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Array<Record<string, unknown>>;
    if (!data.length) return null;
    const car = data[0];

    return {
      displacement:
        typeof car.displacement === 'number' ? car.displacement : Number(car.displacement) || null,
      horsepower: typeof car.horsepower === 'number' ? car.horsepower : Number(car.horsepower) || null,
      cylinders: typeof car.cylinders === 'number' ? car.cylinders : Number(car.cylinders) || null,
      fuelType: typeof car.fuel_type === 'string' ? car.fuel_type : null,
      transmission: typeof car.transmission === 'string' ? car.transmission : null,
      drive: typeof car.drive === 'string' ? car.drive : null,
    };
  } catch {
    return null;
  }
}

const setCached = (key: string, value: CarSpecs | null) => {
  if (specsCache.size > 200) specsCache.clear();
  specsCache.set(key, value);
};

const getStaticSpecs = (make: string, model: string, year: string): CarSpecs | null => {
  const entry = STATIC_SPECS[`${make}|${model}|${year}`]?.[0];
  if (!entry) return null;
  return {
    displacement: entry.displacement,
    horsepower: entry.horsepower,
    cylinders: null,
    fuelType: entry.fuelType,
    transmission: entry.transmission,
    drive: entry.drive,
  };
};

export async function fetchCarSpecs(
  make: string,
  model: string,
  year: string
): Promise<CarSpecs | null> {
  if (!make || !model || !year) return null;
  const cacheKey = `${make}|${model}|${year}`.toLowerCase();
  if (specsCache.has(cacheKey)) return specsCache.get(cacheKey) ?? null;

  // Layer 1 — static dataset
  const staticMatch = getStaticSpecs(make, model, year);
  if (staticMatch) {
    setCached(cacheKey, staticMatch);
    return staticMatch;
  }

  // Layer 2 — API Ninjas
  const apiMatch = await fetchFromApiNinjas(make, model, year);
  if (apiMatch) {
    setCached(cacheKey, apiMatch);
    return apiMatch;
  }

  // Layer 3 — year fallback for recent models
  const yearNum = parseInt(year, 10);
  if (Number.isFinite(yearNum) && yearNum >= 2024) {
    for (const y of [yearNum - 1, yearNum - 2]) {
      const staticFallback = getStaticSpecs(make, model, String(y));
      if (staticFallback) {
        setCached(cacheKey, staticFallback);
        return staticFallback;
      }
      const apiFallback = await fetchFromApiNinjas(make, model, String(y));
      if (apiFallback) {
        setCached(cacheKey, apiFallback);
        return apiFallback;
      }
    }
  }

  setCached(cacheKey, null);
  return null;
}
