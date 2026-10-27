import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      verify: jest.fn(),
    };

    const configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw ConflictException if email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com' });

      await expect(
        service.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create new user if email is unique', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        name: 'Test User',
        email: 'test@example.com',
        avatarUrl: null,
        createdAt: new Date(),
      });

      const result = await service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException with generic message if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hash = await bcrypt.hash('CorrectPassword', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: hash,
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('authenticateWithGoogle', () => {
    it('should create new user via Google auth in demo mode', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'g-u1',
        name: 'Demo Google',
        email: 'demo@gmail.com',
        googleId: 'google-demo-demo@gmail.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        authProvider: 'google',
        createdAt: new Date(),
      });

      const result = await service.authenticateWithGoogle({
        idToken: 'demo-token',
        demoUser: {
          email: 'demo@gmail.com',
          name: 'Demo Google',
          picture: 'https://example.com/avatar.jpg',
        },
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.email).toBe('demo@gmail.com');
      expect(result.accessToken).toBe('mock-token');
    });

    it('should log in existing user found by googleId', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'g-u1',
        name: 'Existing Google User',
        email: 'existing@gmail.com',
        googleId: 'google-demo-existing@gmail.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
      });

      const result = await service.authenticateWithGoogle({
        idToken: 'demo-token',
        demoUser: {
          email: 'existing@gmail.com',
          name: 'Existing Google User',
        },
      });

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(result.user.email).toBe('existing@gmail.com');
    });
  });
});

