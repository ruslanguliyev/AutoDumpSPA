import { getUrlParamsConfig } from '../config/url-params.config';
import { useFiltersUrlSync } from './useFiltersUrlSync';

export const useServicesFiltersUrlSync = () => {
  useFiltersUrlSync('services', getUrlParamsConfig('services'));
};
