/**
 * `SpecialistObject.supportedVehicles` exists in `backend/src/schema.gql`.
 * The vehicles brand filter is only offered against the real API, not mocks.
 */
export function specialistsVehicleFilterSupported(): boolean {
  const flag = import.meta.env.VITE_USE_SPECIALISTS_MOCKS;
  if (flag !== undefined) return String(flag) === 'false';
  return true;
}
