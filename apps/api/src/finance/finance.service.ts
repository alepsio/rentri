import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async summary(userId: string) {
    const airline = await this.prisma.airline.findUniqueOrThrow({ where: { userId } });
    const last30 = await this.prisma.ledgerEntry.findMany({ where: { airlineId: airline.id, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } });
    const revenue = last30.filter((x) => x.type === 'REVENUE').reduce((a, b) => a + Number(b.amount), 0);
    const expenses = last30.filter((x) => x.type === 'EXPENSE').reduce((a, b) => a + Number(b.amount), 0);
    return { cash: airline.cash, debt: airline.debt, revenue30d: revenue, expenses30d: expenses, net30d: revenue - expenses };
  }

  async ledger(userId: string) {
    const airline = await this.prisma.airline.findUniqueOrThrow({ where: { userId } });
    return this.prisma.ledgerEntry.findMany({ where: { airlineId: airline.id }, orderBy: { createdAt: 'desc' }, take: 200 });
  }
}
