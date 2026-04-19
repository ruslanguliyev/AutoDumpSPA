import { getUrlParamsConfig } from '../config/url-params.config';
import { useFiltersUrlSync } from './useFiltersUrlSync';

export const useSpecialistsFiltersUrlSync = () => {
  useFiltersUrlSync('specialists', getUrlParamsConfig('specialists'));
};
