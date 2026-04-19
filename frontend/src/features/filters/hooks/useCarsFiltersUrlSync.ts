import { getUrlParamsConfig } from '../config/url-params.config';
import { useFiltersUrlSync } from './useFiltersUrlSync';

export const useCarsFiltersUrlSync = () => {
  useFiltersUrlSync('cars', getUrlParamsConfig('cars'));
};
