import { getUrlParamsConfig } from '../config/url-params.config';
import { useFiltersUrlSync } from './useFiltersUrlSync';

export const usePartsFiltersUrlSync = () => {
  useFiltersUrlSync('parts', getUrlParamsConfig('parts'));
};
