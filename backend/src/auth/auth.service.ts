import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Use generic error message to prevent user enumeration
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account was created with Google. Please use "Sign in with Google" to continue.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async authenticateWithGoogle(dto: GoogleAuthDto) {
    let payload: {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: boolean | string;
    };

    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    // Handle development demo fallback if idToken is demo token or GOOGLE_CLIENT_ID not set
    if (
      dto.idToken.startsWith('demo-') ||
      (dto.demoUser && (!googleClientId || process.env.NODE_ENV !== 'production'))
    ) {
      this.logger.log('Authenticating via Google demo mode for local development');
      const demoEmail = dto.demoUser?.email || 'demo.google@example.com';
      payload = {
        sub: `google-demo-${demoEmail}`,
        email: demoEmail,
        name: dto.demoUser?.name || 'Google Demo User',
        picture:
          dto.demoUser?.picture ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        email_verified: true,
      };
    } else {
      // Verify real Google ID Token via Google's tokeninfo endpoint
      try {
        const response = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.idToken}`,
          { timeout: 8000 },
        );
        payload = response.data;
      } catch (err: any) {
        this.logger.error('Google token verification failed', err.response?.data || err.message);
        throw new UnauthorizedException('Invalid or expired Google authentication credential');
      }

      if (payload.email_verified !== 'true' && payload.email_verified !== true) {
        throw new UnauthorizedException('Google email address has not been verified');
      }

      if (googleClientId && (payload as any).aud !== googleClientId) {
        this.logger.warn(`Google token aud mismatch: expected ${googleClientId}, received ${(payload as any).aud}`);
        throw new UnauthorizedException('Google token was not issued for this application');
      }
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture || null;

    // 1. Look for existing user by Google sub ID
    let user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // 2. Check if user with this email already exists (e.g. registered with password)
      user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Link Google ID to existing user account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            authProvider: user.passwordHash ? 'both' : 'google',
            ...(!user.avatarUrl && avatarUrl ? { avatarUrl } : {}),
          },
        });
        this.logger.log(`Linked Google account to existing user: ${user.email}`);
      } else {
        // 3. Create new user via Google Sign Up
        user = await this.prisma.user.create({
          data: {
            name,
            email,
            googleId,
            avatarUrl,
            authProvider: 'google',
            passwordHash: null,
          },
        });
        this.logger.log(`Created new account via Google OAuth: ${user.email}`);
      }
    } else if (avatarUrl && !user.avatarUrl) {
      // Update avatar if not yet set
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret-fallback',
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const hashed = this.hashToken(refreshToken);

    const existingToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash: hashed,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!existingToken) {
      throw new UnauthorizedException('Refresh token has been revoked or expired');
    }

    // Revoke old token as part of rotation
    await this.prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const newTokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...newTokens,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const hashed = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          tokenHash: hashed,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoke all active tokens for this user
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'Successfully logged out' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            watchlist: true,
            watched: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      stats: {
        watchlistCount: user._count.watchlist,
        watchedCount: user._count.watched,
      },
    };
  }

  private async generateTokens(userId: string, email: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'default-access-secret-fallback';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret-fallback';
    const accessExpires = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpires = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: accessSecret, expiresIn: accessExpires },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: refreshSecret, expiresIn: refreshExpires },
      ),
    ]);

    // Save hashed refresh token to DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

