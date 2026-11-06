/**
 * Gives an existing account the ADMIN role (or removes it with --revoke).
 *
 *   npm run admin:grant -- someone@example.com
 *   npm run admin:grant -- someone@example.com --revoke
 *
 * Moderators are managed here on purpose: there is no way to become an admin through the API.
 */
import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';

async function main() {
  const [rawEmail, flag] = process.argv.slice(2);
  if (!rawEmail) {
    console.error('Usage: npm run admin:grant -- <email> [--revoke]');
    process.exit(1);
  }
  const email = rawEmail.trim().toLowerCase();
  const revoke = flag === '--revoke';

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
    if (!user) {
      console.error(`No user with email ${email}`);
      process.exit(1);
    }
    // Revoking returns the account to the role that matches its seller profile (or plain USER).
    const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
    const fallback: UserRole = seller
      ? seller.type === 'DEALER'
        ? UserRole.DEALER
        : seller.type === 'PARTS_DEALER'
          ? UserRole.PARTS_DEALER
          : UserRole.PRIVATE_SELLER
      : UserRole.USER;
    const role = revoke ? fallback : UserRole.ADMIN;
    await prisma.user.update({
      where: { id: user.id },
      // Bumping the token version makes the new role effective immediately everywhere.
      data: { role, tokenVersion: { increment: 1 } },
    });
    console.log(`${email}: role is now ${role}. Sign in again to pick it up.`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
