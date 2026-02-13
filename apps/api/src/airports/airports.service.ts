import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AirportsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.airport.findMany({ orderBy: { city: 'asc' } });
  }

  details(id: string) {
    return this.prisma.airport.findUnique({ where: { id } });
  }
}
