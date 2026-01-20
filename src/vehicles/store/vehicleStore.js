import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const EMPTY_VEHICLE = {
  vin: '',
  brand: '',
  model: '',
  generation: '',
  engine: '',
  yearFrom: null,
  yearTo: null,
};

export const useVehicleStore = create(
  persist(
    (set) => ({
      vehicle: { ...EMPTY_VEHICLE },
      setVehicle: (vehicle) => set({ vehicle: { ...vehicle } }),
      clearVehicle: () => set({ vehicle: { ...EMPTY_VEHICLE } }),
    }),
    {
      name: 'avtobaz-vehicle',
    }
  )
);
