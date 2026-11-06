import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { FailureLimiter } from '../common/utils/failure-limiter';
import { assertValidPassword, normalizeFullName } from './credentials';

const SALT_ROUNDS = 10;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS_PER_EMAIL = 10;
const MAX_FAILED_LOGINS_PER_IP = 50;

export interface AuthResult {
  accessToken: string;
  user: Omit<User, 'passwordHash'>;
}

export function normalizeEmail(email: string): string {
  return (email ?? '').trim().toLowerCase();
}

@Injectable()
export class AuthService {
  private readonly emailFailures = new FailureLimiter(MAX_FAILED_LOGINS_PER_EMAIL, LOGIN_WINDOW_MS);
  private readonly ipFailures = new FailureLimiter(MAX_FAILED_LOGINS_PER_IP, LOGIN_WINDOW_MS);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    rawEmail: string,
    password: string,
    rawFullName: string,
  ): Promise<AuthResult> {
    const email = normalizeEmail(rawEmail);

    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
      throw new BadRequestException('Invalid email address');
    }
    assertValidPassword(password);
    const fullName = normalizeFullName(rawFullName);

    const existing = await this.findUserByEmail(email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: UserRole.USER,
      },
    });

    return this.buildAuthResult(user);
  }

  async login(email: string, password: string, ip?: string): Promise<AuthResult> {
    const emailKey = normalizeEmail(email);
    const ipKey = ip ?? 'unknown';

    if (this.emailFailures.isBlocked(emailKey) || this.ipFailures.isBlocked(ipKey)) {
      throw new HttpException(
        'Too many failed login attempts. Please try again in 15 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      const user = await this.validateCredentials(email, password);
      this.emailFailures.reset(emailKey);
      return this.buildAuthResult(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.emailFailures.record(emailKey);
        this.ipFailures.record(ipKey);
      }
      throw error;
    }
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.findUserByEmail(normalizeEmail(email));
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async validateUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /** Case-insensitive lookup so accounts created before normalisation still work. */
  private findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
  }

  /** Signs a token for the user's current token version. */
  issueAuthResult(user: User): AuthResult {
    return this.buildAuthResult(user);
  }

  private buildAuthResult(user: User): AuthResult {
    const { passwordHash: _, ...userWithoutPassword } = user;
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tv: user.tokenVersion,
    });
    return {
      accessToken,
      user: userWithoutPassword,
    };
  }
}
