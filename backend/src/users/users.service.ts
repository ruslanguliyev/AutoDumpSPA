import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResult, AuthService } from '../auth/auth.service';
import { FailureLimiter } from '../common/utils/failure-limiter';
import { assertValidPassword, normalizeFullName } from '../auth/credentials';
import { ChangePasswordInput, UpdateProfileInput } from './user.types';

const SALT_ROUNDS = 10;
const PASSWORD_WINDOW_MS = 15 * 60 * 1000;
const MAX_WRONG_CURRENT_PASSWORDS = 5;

@Injectable()
export class UsersService {
  /** Someone with a stolen token must not be able to guess the current password. */
  private readonly wrongPasswords = new FailureLimiter(MAX_WRONG_CURRENT_PASSWORDS, PASSWORD_WINDOW_MS);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.fullName === undefined) {
      return this.getMe(userId);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { fullName: normalizeFullName(input.fullName) },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Changes the password and logs the account out everywhere else: the token version is bumped,
   * so every previously issued token stops working. Returns a fresh token for the current session.
   */
  async changePassword(userId: string, input: ChangePasswordInput): Promise<AuthResult> {
    if (this.wrongPasswords.isBlocked(userId)) {
      throw new HttpException(
        'Too many wrong attempts. Please try again in 15 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    assertValidPassword(input.newPassword);

    if (input.currentPassword === input.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      this.wrongPasswords.record(userId);
      throw new UnauthorizedException('Current password is incorrect');
    }
    this.wrongPasswords.reset(userId);

    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });

    return this.authService.issueAuthResult(updated);
  }
}
