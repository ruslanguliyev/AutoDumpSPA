import { createContext, useContext } from 'react';
import { autos } from '../data/data.js';

const AutoContext = createContext();

export const AutoProvider = ({ children }) => {
  return (
    <AutoContext.Provider value={{ autos }}>
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

