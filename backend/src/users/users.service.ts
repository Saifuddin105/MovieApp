import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            watchlist: true,
            watched: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      watchlistCount: user._count.watchlist,
      watchedCount: user._count.watched,
    };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl.trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getUserStats(userId: string) {
    const [watchlistCount, watchedCount, recentWatched] = await Promise.all([
      this.prisma.watchlistItem.count({ where: { userId } }),
      this.prisma.watchedMovie.count({ where: { userId } }),
      this.prisma.watchedMovie.findMany({
        where: { userId },
        orderBy: { watchedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      watchlistCount,
      watchedCount,
      recentWatched,
    };
  }
}

