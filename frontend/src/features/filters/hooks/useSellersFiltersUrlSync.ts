import { getUrlParamsConfig } from '../config/url-params.config';
import { useFiltersUrlSync } from './useFiltersUrlSync';

export const useSellersFiltersUrlSync = () => {
  useFiltersUrlSync('sellers', getUrlParamsConfig('sellers'));
};
