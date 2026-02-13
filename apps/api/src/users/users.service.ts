import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getMe(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, displayName: true, role: true, createdAt: true, airline: true } });
  }

  async updateMe(userId: string, body: { displayName?: string; timezone?: string; language?: string }) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { displayName: body.displayName } });
    if (body.timezone || body.language) {
      await this.prisma.airline.updateMany({ where: { userId }, data: { timezone: body.timezone, language: body.language } });
    }
    return user;
  }
}
