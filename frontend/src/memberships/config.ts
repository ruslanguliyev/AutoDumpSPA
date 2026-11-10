/** Memberships have no backend yet. Mock rows are off unless this is exactly `true`. */
export function membershipsEnabled(): boolean {
  return String(import.meta.env.VITE_USE_MEMBERSHIPS_MOCKS) === 'true';
}
