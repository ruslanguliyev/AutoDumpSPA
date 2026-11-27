/**
 * Brings existing cars, service centers and masters in line with the localized site.
 * The parts' own version is backfill-part-i18n.ts (npm run parts:i18n).
 *
 *   npm run listings:i18n                            dry run: what would change
 *   npm run listings:i18n -- --categories --apply    rewrite service categories as keys
 *   npm run listings:i18n -- --translations --apply  translate into az/ru/en (paid AI calls)
 *   add --only=vehicle,serviceCenter,specialist      to limit the translations to some kinds
 *
 * Categories: older service centers hold text like "Шиномонтаж" or "Maintenance"; they become
 * the key ("tires", "maintenance") the site translates, in the profile and in its price list.
 * Translations: every live car with a description, and every service center and master with
 * text, gets them when it has none or stale ones; one AI call each, within the daily AI budget.
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ListingStatus, PrismaClient } from '@prisma/client';

import { AppModule } from '../src/app.module';
import { toServiceCategoryKey, toServiceCategoryKeys } from '../src/service-centers/service-category';
import {
  isTranslatableKind,
  TextTranslationService,
  TRANSLATABLE_KINDS,
  TranslatableKind,
} from '../src/translations/text-translation.service';
import {
  fieldsHash,
  parseTextTranslations,
  serviceCenterTextFields,
  specialistTextFields,
  TextFields,
  vehicleTextFields,
} from '../src/translations/text-translations';

const argv = process.argv.slice(2);
const args = new Set(argv);
const apply = args.has('--apply');
const doCategories = args.has('--categories') || (!args.has('--translations') && !apply);
const doTranslations = args.has('--translations') || (!args.has('--categories') && !apply);
const onlyArg = argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length);
const kinds: TranslatableKind[] = onlyArg
  ? onlyArg.split(',').map((kind) => kind.trim()).filter(isTranslatableKind)
  : [...TRANSLATABLE_KINDS];

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((value, i) => value === b[i]);

async function categories(prisma: PrismaClient) {
  const centers = await prisma.serviceCenter.findMany({ select: { id: true, name: true, categories: true } });
  const centerChanges = centers
    .map((center) => ({ ...center, to: toServiceCategoryKeys(center.categories) }))
    .filter((center) => !sameList(center.categories, center.to));
  const items = await prisma.serviceCenterService.findMany({ select: { id: true, category: true } });
  const itemChanges = items
    .map((item) => ({ ...item, to: toServiceCategoryKey(item.category) ?? 'other' }))
    .filter((item) => item.category !== item.to);

  console.log(`\nService centers: ${centerChanges.length} of ${centers.length} need category keys.`);
  console.table(centerChanges.map((c) => ({ name: c.name, from: c.categories.join(', '), to: c.to.join(', ') })));
  console.log(`Price-list items: ${itemChanges.length} of ${items.length} need a category key.`);
  const summary = new Map<string, number>();
  for (const change of itemChanges) {
    const key = `${change.category}  ->  ${change.to}`;
    summary.set(key, (summary.get(key) ?? 0) + 1);
  }
  console.table([...summary].map(([change, count]) => ({ change, count })));
  if (!apply) return;

  for (const change of centerChanges) {
    await prisma.serviceCenter.update({ where: { id: change.id }, data: { categories: change.to } });
  }
  for (const change of itemChanges) {
    await prisma.serviceCenterService.update({ where: { id: change.id }, data: { category: change.to } });
  }
  console.log(`Rewrote ${centerChanges.length} profiles and ${itemChanges.length} price-list items.`);
}

const needs = (fields: TextFields, stored: unknown) =>
  Object.keys(fields).length > 0 && parseTextTranslations(stored)?.hash !== fieldsHash(fields);

async function pending(prisma: PrismaClient, kind: TranslatableKind): Promise<{ total: number; ids: string[] }> {
  if (kind === 'vehicle') {
    const rows = await prisma.vehicle.findMany({
      where: { listing: { status: ListingStatus.ACTIVE } },
      select: { id: true, description: true, translations: true },
    });
    return { total: rows.length, ids: rows.filter((r) => needs(vehicleTextFields(r), r.translations)).map((r) => r.id) };
  }
  if (kind === 'serviceCenter') {
    const rows = await prisma.serviceCenter.findMany({
      select: { id: true, description: true, translations: true, services: { select: { code: true, title: true } } },
    });
    return {
      total: rows.length,
      ids: rows.filter((r) => needs(serviceCenterTextFields(r), r.translations)).map((r) => r.id),
    };
  }
  const rows = await prisma.specialist.findMany({ select: { id: true, bio: true, translations: true } });
  return { total: rows.length, ids: rows.filter((r) => needs(specialistTextFields(r), r.translations)).map((r) => r.id) };
}

async function translations(prisma: PrismaClient) {
  const work: Array<[TranslatableKind, string[]]> = [];
  for (const kind of kinds) {
    const { total, ids } = await pending(prisma, kind);
    console.log(`\nTranslations, ${kind}: ${ids.length} of ${total} have none or stale ones.`);
    work.push([kind, ids]);
  }
  const count = work.reduce((sum, [, ids]) => sum + ids.length, 0);
  if (!apply || !count) return;

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const service = app.get(TextTranslationService);
    let done = 0;
    for (const [kind, ids] of work) {
      for (const id of ids) {
        if (await service.refresh(kind, id)) done += 1;
      }
    }
    console.log(`Translated ${done} of ${count}. The rest were skipped (AI off, paused or failed).`);
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
