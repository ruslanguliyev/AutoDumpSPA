import { autos } from "../api/autos";

export const makesByCategory = autos.reduce((acc, car) => {
  const type = car.vehicleType;

  if (!acc[type]) acc[type] = new Set();
  acc[type].add(car.brand);

  return acc;
}, {});

// Convert Set → Array and add "All Makes"
Object.keys(makesByCategory).forEach((type) => {
  makesByCategory[type] = ["All Makes", ...Array.from(makesByCategory[type])];
});
