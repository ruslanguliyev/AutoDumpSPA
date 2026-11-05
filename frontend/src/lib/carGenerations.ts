export interface CarGeneration {
  generationName: string;
  yearFrom: number;
  yearTo: number | null;
  bodyStyle: string | null;
}

const genCache = new Map<string, CarGeneration[]>();

export async function fetchGenerations(
  make: string,
  model: string
): Promise<CarGeneration[]> {
  const key = `${make}|${model}`.toLowerCase();
  if (genCache.has(key)) return genCache.get(key) ?? [];
  if (genCache.size > 100) genCache.clear();

  const apiKey = import.meta.env.VITE_CAR_API_KEY as string | undefined;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      make: make.toLowerCase(),
      model: model.toLowerCase(),
    });
    const res = await fetch(`https://api.api-ninjas.com/v1/cartrims?${params.toString()}`, {
      headers: { 'X-Api-Key': apiKey },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<Record<string, unknown>>;

    const genMap = new Map<string, CarGeneration>();
    for (const item of data) {
      const rawName =
        typeof item.generation === 'string' && item.generation.trim()
          ? item.generation.trim()
          : 'Базовое поколение';
      if (!genMap.has(rawName)) {
        const from = parseInt(String(item.year_from ?? ''), 10);
        const toRaw = String(item.year_to ?? '').trim();
        const to = toRaw ? parseInt(toRaw, 10) : NaN;
        genMap.set(rawName, {
          generationName: rawName,
          yearFrom: Number.isFinite(from) ? from : 2000,
          yearTo: Number.isFinite(to) ? to : null,
          bodyStyle: typeof item.series === 'string' ? item.series : null,
        });
      }
    }

    const result = Array.from(genMap.values()).sort((a, b) => b.yearFrom - a.yearFrom);
    genCache.set(key, result);
    return result;
  } catch {
    return [];
  }
}

export function getGenerationPhotoUrl(make: string, model: string, year: number): string {
  const key = (import.meta.env.VITE_CARIMAGES_API_KEY as string | undefined) ?? '';
  return `https://api.carimagesapi.com/v1/image?make=${encodeURIComponent(
    make
  )}&model=${encodeURIComponent(model)}&year=${year}&apikey=${key}&format=webp&width=400`;
}
