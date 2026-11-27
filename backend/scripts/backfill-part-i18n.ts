/**
 * Brings existing parts in line with the localized catalogue.
 *
 *   npm run parts:i18n                          dry run: what would change
 *   npm run parts:i18n -- --categories --apply  rewrite free-text categories as keys
 *   npm run parts:i18n -- --translations --apply  translate live parts into az/ru/en (paid AI calls)
 *
 * Categories: older parts hold text like "Масляные фильтры (картриджный и накручиваемый)";
 * they become the key ("filters") the site translates. Translations: every live part without
 * current translations gets them, one AI call per part, within the usual daily AI budget.
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ListingStatus, PrismaClient } from '@prisma/client';

import { AppModule } from '../src/app.module';
import { toPartCategoryKey } from '../src/parts/part-category';
import { PartTranslationService } from '../src/translations/part-translation.service';
import { parsePartTranslations, textHash } from '../src/translations/part-translations';

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const doCategories = args.has('--categories') || (!args.has('--translations') && !apply);
const doTranslations = args.has('--translations') || (!args.has('--categories') && !apply);

async function categories(prisma: PrismaClient) {
  const parts = await prisma.part.findMany({ select: { id: true, category: true } });
  const changes = parts
    .map((part) => ({ id: part.id, from: part.category, to: toPartCategoryKey(part.category) ?? 'other' }))
    .filter((change) => change.from !== change.to);
  console.log(`\nCategories: ${changes.length} of ${parts.length} parts need a key.`);
  const summary = new Map<string, number>();
  for (const change of changes) {
    const key = `${change.from}  ->  ${change.to}`;
    summary.set(key, (summary.get(key) ?? 0) + 1);
  }
  console.table([...summary].map(([change, count]) => ({ change, count })));
  if (!apply) return;
  for (const change of changes) {
    await prisma.part.update({ where: { id: change.id }, data: { category: change.to } });
  }
  console.log(`Rewrote ${changes.length} categories.`);
}

async function translations(prisma: PrismaClient) {
  const parts = await prisma.part.findMany({
    where: { listing: { status: ListingStatus.ACTIVE } },
    select: { id: true, name: true, description: true, translations: true },
  });
  const missing = parts.filter(
    (part) => part.name.trim() && parsePartTranslations(part.translations)?.hash !== textHash(part),
  );
  console.log(`\nTranslations: ${missing.length} of ${parts.length} live parts have none or stale ones.`);
  if (!apply || !missing.length) return;

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const service = app.get(PartTranslationService);
    let done = 0;
    for (const part of missing) {
      if (await service.refresh(part.id)) done += 1;
    }
    console.log(`Translated ${done} of ${missing.length}. The rest were skipped (AI off, paused or failed).`);
  } finally {
    await app.close();
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    if (!apply) console.log('Dry run. Add --apply to write.');
    if (doCategories) await categories(prisma);
    if (doTranslations) await translations(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
