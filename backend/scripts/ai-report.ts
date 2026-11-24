/**
 * Prints AI spend per day and the empty searches visitors ran in the assistant.
 *
 *   npm run ai:report            last 7 days
 *   npm run ai:report -- 30      last 30 days
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  const days = Math.min(Math.max(Number(process.argv[2]) || 7, 1), 90);
  const prisma = new PrismaClient();
  try {
    const usage = await prisma.aiUsageDay.findMany({ orderBy: { day: 'desc' }, take: days });
    console.log(`\nAI spend, last ${days} days (estimate from list prices)`);
    console.table(
      usage.map((row) => ({
        day: row.day,
        requests: row.requests,
        units: row.units,
        inputTokens: row.inputTokens,
        outputTokens: row.outputTokens,
        cacheRead: row.cacheReadTokens,
        usd: (row.costMicroUsd / 1e6).toFixed(4),
      })),
    );

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const misses = await prisma.aiSearchMiss.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 10_000,
    });
    const groups = new Map<string, { tool: string; filters: string; count: number }>();
    for (const row of misses) {
      const filters = JSON.stringify(row.filters);
      const key = `${row.tool}|${filters}`;
      const group = groups.get(key) ?? { tool: row.tool, filters, count: 0 };
      group.count += 1;
      groups.set(key, group);
    }
    console.log(`\nSearches that found nothing, last ${days} days (${misses.length} in total)`);
    console.table([...groups.values()].sort((a, b) => b.count - a.count).slice(0, 50));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
