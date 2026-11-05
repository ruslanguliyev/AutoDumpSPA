export type StaticSpecEntry = {
  displacement: number | null;
  horsepower: number | null;
  fuelType: string | null;
  transmission: string | null;
  drive: string | null;
};

export const STATIC_SPECS: Record<string, StaticSpecEntry[]> = {};

const addRange = (
  make: string,
  model: string,
  startYear: number,
  endYear: number,
  spec: StaticSpecEntry
) => {
  for (let y = startYear; y <= endYear; y += 1) {
    STATIC_SPECS[`${make}|${model}|${y}`] = [spec];
  }
};

// BMW
addRange('BMW', 'M3', 2020, 2026, {
  displacement: 3.0,
  horsepower: 510,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('BMW', 'M4', 2020, 2026, {
  displacement: 3.0,
  horsepower: 510,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('BMW', 'M5', 2020, 2026, {
  displacement: 4.4,
  horsepower: 625,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('BMW', 'X5', 2020, 2026, {
  displacement: 3.0,
  horsepower: 340,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('BMW', 'X6', 2020, 2026, {
  displacement: 3.0,
  horsepower: 340,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('BMW', 'X7', 2020, 2026, {
  displacement: 3.0,
  horsepower: 381,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});

// Mercedes-Benz
addRange('Mercedes-Benz', 'S-Class', 2020, 2026, {
  displacement: 3.0,
  horsepower: 435,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Mercedes-Benz', 'E-Class', 2020, 2026, {
  displacement: 2.0,
  horsepower: 258,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'rwd',
});
addRange('Mercedes-Benz', 'C-Class', 2020, 2026, {
  displacement: 2.0,
  horsepower: 255,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'rwd',
});
addRange('Mercedes-Benz', 'G-Class', 2020, 2026, {
  displacement: 4.0,
  horsepower: 585,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: '4wd',
});
addRange('Mercedes-Benz', 'AMG C63', 2020, 2026, {
  displacement: 2.0,
  horsepower: 680,
  fuelType: 'hybrid',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Mercedes-Benz', 'AMG E63', 2020, 2026, {
  displacement: 4.0,
  horsepower: 612,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Mercedes-Benz', 'AMG GT 63', 2020, 2026, {
  displacement: 4.0,
  horsepower: 639,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Mercedes-Benz', 'AMG G63', 2020, 2026, {
  displacement: 4.0,
  horsepower: 585,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: '4wd',
});

// Toyota
addRange('Toyota', 'Camry', 2020, 2026, {
  displacement: 2.5,
  horsepower: 249,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'fwd',
});
addRange('Toyota', 'Land Cruiser', 2020, 2026, {
  displacement: 3.5,
  horsepower: 415,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: '4wd',
});
addRange('Toyota', 'Prado', 2020, 2026, {
  displacement: 2.8,
  horsepower: 204,
  fuelType: 'diesel',
  transmission: 'automatic',
  drive: '4wd',
});
addRange('Toyota', 'RAV4', 2020, 2026, {
  displacement: 2.5,
  horsepower: 222,
  fuelType: 'hybrid',
  transmission: 'cvt',
  drive: 'awd',
});
addRange('Toyota', 'Corolla', 2020, 2026, {
  displacement: 1.8,
  horsepower: 140,
  fuelType: 'gasoline',
  transmission: 'cvt',
  drive: 'fwd',
});
addRange('Toyota', 'Highlander', 2020, 2026, {
  displacement: 2.4,
  horsepower: 265,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});

// Hyundai
addRange('Hyundai', 'Elantra', 2020, 2026, {
  displacement: 1.6,
  horsepower: 128,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'fwd',
});
addRange('Hyundai', 'Sonata', 2020, 2026, {
  displacement: 2.5,
  horsepower: 180,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'fwd',
});
addRange('Hyundai', 'Tucson', 2020, 2026, {
  displacement: 1.6,
  horsepower: 180,
  fuelType: 'hybrid',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Hyundai', 'Santa Fe', 2020, 2026, {
  displacement: 2.5,
  horsepower: 281,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Hyundai', 'Palisade', 2020, 2026, {
  displacement: 3.8,
  horsepower: 295,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Hyundai', 'Creta', 2020, 2026, {
  displacement: 2.0,
  horsepower: 149,
  fuelType: 'gasoline',
  transmission: 'cvt',
  drive: 'fwd',
});

// Kia
addRange('Kia', 'K5', 2020, 2026, {
  displacement: 2.5,
  horsepower: 290,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'fwd',
});
addRange('Kia', 'Sportage', 2020, 2026, {
  displacement: 1.6,
  horsepower: 180,
  fuelType: 'hybrid',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Kia', 'Sorento', 2020, 2026, {
  displacement: 2.5,
  horsepower: 281,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Kia', 'Seltos', 2020, 2026, {
  displacement: 1.6,
  horsepower: 177,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Kia', 'Rio', 2020, 2026, {
  displacement: 1.6,
  horsepower: 123,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'fwd',
});
addRange('Kia', 'Carnival', 2020, 2026, {
  displacement: 3.5,
  horsepower: 290,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'fwd',
});

// Porsche
addRange('Porsche', 'Cayenne', 2020, 2026, {
  displacement: 3.0,
  horsepower: 353,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Porsche', '911', 2020, 2026, {
  displacement: 3.0,
  horsepower: 385,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'rwd',
});
addRange('Porsche', 'Macan', 2020, 2026, {
  displacement: 2.0,
  horsepower: 265,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Porsche', 'Panamera', 2020, 2026, {
  displacement: 2.9,
  horsepower: 330,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});

// Audi
addRange('Audi', 'A4', 2020, 2026, {
  displacement: 2.0,
  horsepower: 204,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Audi', 'A6', 2020, 2026, {
  displacement: 2.0,
  horsepower: 265,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Audi', 'Q5', 2020, 2026, {
  displacement: 2.0,
  horsepower: 249,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Audi', 'Q7', 2020, 2026, {
  displacement: 3.0,
  horsepower: 340,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Audi', 'R8', 2020, 2026, {
  displacement: 5.2,
  horsepower: 620,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Audi', 'Q8', 2020, 2026, {
  displacement: 3.0,
  horsepower: 340,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});

// Tesla (all main models)
addRange('Tesla', 'Model S', 2020, 2026, {
  displacement: 0,
  horsepower: 670,
  fuelType: 'electric',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Tesla', 'Model 3', 2020, 2026, {
  displacement: 0,
  horsepower: 283,
  fuelType: 'electric',
  transmission: 'automatic',
  drive: 'rwd',
});
addRange('Tesla', 'Model X', 2020, 2026, {
  displacement: 0,
  horsepower: 670,
  fuelType: 'electric',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Tesla', 'Model Y', 2020, 2026, {
  displacement: 0,
  horsepower: 384,
  fuelType: 'electric',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Tesla', 'Cybertruck', 2024, 2026, {
  displacement: 0,
  horsepower: 600,
  fuelType: 'electric',
  transmission: 'automatic',
  drive: 'awd',
});

// Lexus
addRange('Lexus', 'LX', 2020, 2026, {
  displacement: 3.5,
  horsepower: 409,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: '4wd',
});
addRange('Lexus', 'RX', 2020, 2026, {
  displacement: 2.4,
  horsepower: 279,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Lexus', 'ES', 2020, 2026, {
  displacement: 2.5,
  horsepower: 204,
  fuelType: 'hybrid',
  transmission: 'cvt',
  drive: 'fwd',
});
addRange('Lexus', 'GX', 2020, 2026, {
  displacement: 3.4,
  horsepower: 349,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: '4wd',
});

// Nissan
addRange('Nissan', 'Patrol', 2020, 2026, {
  displacement: 5.6,
  horsepower: 400,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: '4wd',
});
addRange('Nissan', 'Qashqai', 2020, 2026, {
  displacement: 1.3,
  horsepower: 158,
  fuelType: 'gasoline',
  transmission: 'cvt',
  drive: 'fwd',
});
addRange('Nissan', 'X-Trail', 2020, 2026, {
  displacement: 1.5,
  horsepower: 204,
  fuelType: 'hybrid',
  transmission: 'cvt',
  drive: 'awd',
});

// Volkswagen
addRange('Volkswagen', 'Touareg', 2020, 2026, {
  displacement: 3.0,
  horsepower: 286,
  fuelType: 'diesel',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Volkswagen', 'Tiguan', 2020, 2026, {
  displacement: 2.0,
  horsepower: 220,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'awd',
});
addRange('Volkswagen', 'Passat', 2020, 2026, {
  displacement: 2.0,
  horsepower: 190,
  fuelType: 'gasoline',
  transmission: 'automatic',
  drive: 'fwd',
});
