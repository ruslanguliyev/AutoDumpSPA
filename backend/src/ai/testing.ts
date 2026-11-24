/** An in-memory stand-in for the two AI tables, for unit tests. */
export function fakeAiPrisma() {
  const days = new Map<string, Record<string, number | string>>();
  const misses: Array<{ tool: string; filters: unknown; language: string; createdAt: Date }> = [];
  return {
    misses,
    days,
    aiUsageDay: {
      findUnique: async ({ where }: { where: { day: string } }) => days.get(where.day) ?? null,
      findMany: async () => [...days.values()],
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { day: string };
        create: Record<string, number | string>;
        update: Record<string, { increment: number }>;
      }) => {
        const row = days.get(where.day);
        if (!row) {
          days.set(where.day, { ...create });
        } else {
          for (const [key, value] of Object.entries(update)) row[key] = Number(row[key] ?? 0) + value.increment;
        }
        return days.get(where.day);
      },
    },
    aiSearchMiss: {
      create: async ({ data }: { data: { tool: string; filters: unknown; language: string } }) => {
        misses.push({ ...data, createdAt: new Date() });
        return data;
      },
      findMany: async () => [...misses].reverse(),
    },
  };
}
