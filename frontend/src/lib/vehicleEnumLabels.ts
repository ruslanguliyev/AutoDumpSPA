import type { TFunction } from 'i18next';

/** Splits the API engine summary on middle dots so the meta line can use one separator everywhere. */
export function splitEngineSummary(engine: string | null | undefined): string[] {
  if (!engine?.trim()) return [];
  return engine
  .split(/[•·]/)
  .map((part) => part.trim())
  .filter(Boolean);
}

type EnumGroup = 'transmission' | 'fuel';

/** Maps API enum strings (Automatic, Petrol, …) to az/ru/en labels under `vehicle:enums`. */
export function translateVehicleEnum(
  t: TFunction<'vehicle'>,
  group: EnumGroup,
  value: string | null | undefined,
): string | null {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  const key = `enums.${group}.${trimmed}`;
  return t(key, { defaultValue: trimmed });
}
