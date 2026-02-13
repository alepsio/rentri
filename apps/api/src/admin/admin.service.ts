import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private assertAdmin(role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();
  }

  users(role: string) {
    this.assertAdmin(role);
    return this.prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true, lockedUntil: true } });
  }

  async ban(actorId: string, role: string, targetId: string, days: number) {
    this.assertAdmin(role);
    const lockedUntil = new Date(Date.now() + days * 86400000);
    const user = await this.prisma.user.update({ where: { id: targetId }, data: { lockedUntil } });
    await this.prisma.auditLog.create({ data: { userId: actorId, action: 'BAN_USER', entityType: 'User', entityId: targetId, meta: { days } } });
    return user;
  }

  async patchEconomy(actorId: string, role: string, body: { key: string; value: unknown }) {
    this.assertAdmin(role);
    const cfg = await this.prisma.economyConfig.upsert({ where: { key: body.key }, update: { value: body.value as object }, create: { key: body.key, value: body.value as object } });
    await this.prisma.auditLog.create({ data: { userId: actorId, action: 'PATCH_ECONOMY', entityType: 'EconomyConfig', entityId: cfg.id } });
    return cfg;
  }
}
