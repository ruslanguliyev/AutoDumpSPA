import { getUrlParamsConfig } from '../config/url-params.config';
import { useFiltersUrlSync } from './useFiltersUrlSync';

export const useRentFiltersUrlSync = () => {
  useFiltersUrlSync('rent', getUrlParamsConfig('rent'));
};
