import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async top() {
    const airlines = await this.prisma.airline.findMany({ include: { aircraft: true, routes: true }, take: 100 });
    return airlines
      .map((a) => ({
        airlineId: a.id,
        name: a.name,
        companyValue: Number(a.cash) + a.aircraft.length * 1000000 + a.routes.length * 120000,
        punctuality: a.punctuality,
        reputation: a.reputation,
      }))
      .sort((a, b) => b.companyValue - a.companyValue)
      .slice(0, 50);
  }
}
