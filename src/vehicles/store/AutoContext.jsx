import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { autos } from '@/vehicles/api/data';

const AutoContext = createContext();

export const AutoProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    vehicleType: 'car',
    make: '',
    model: '',
    price: '',
    registration: '',
    region: 'europe',
    city: '',
  });

  // Функция фильтрации автомобилей
  const filterAutos = useCallback((filterParams) => {
    return autos.filter((auto) => {
      // Фильтр по типу транспорта
      if (filterParams.vehicleType && auto.vehicleType !== filterParams.vehicleType) {
        return false;
      }

      // Фильтр по марке
      if (filterParams.make && auto.brand !== filterParams.make) {
        return false;
      }

      // Фильтр по модели (частичное совпадение, case-insensitive)
      if (
        filterParams.model &&
        !auto.model.toLowerCase().includes(filterParams.model.toLowerCase())
      ) {
        return false;
      }

      // Дополнительные фильтры можно добавить здесь
      // (цена, регистрация, регион, город и т.д.)

      return true;
    });
  }, []);

  // Мемоизированные отфильтрованные результаты
  const filteredAutos = useMemo(() => {
    return filterAutos(filters);
  }, [filters, filterAutos]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Мемоизируем значение контекста, чтобы избежать ненужных ре-рендеров
  const value = useMemo(
    () => ({
      autos,
      filteredAutos,
      filters,
      updateFilters,
    }),
    [filteredAutos, filters, updateFilters]
  );

  return (
    <AutoContext.Provider value={value}>
      {children}
    </AutoContext.Provider>
  );
};

export const useAuto = () => {
  const context = useContext(AutoContext);
  if (!context) {
    throw new Error('useAuto must be used within AutoProvider');
  }
  return context;
};
