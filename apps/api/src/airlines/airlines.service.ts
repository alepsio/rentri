import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createAirlineSchema } from '@shared/index';

@Injectable()
export class AirlinesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: unknown) {
    const dto = createAirlineSchema.parse(input);
    const exists = await this.prisma.airline.findUnique({ where: { userId } });
    if (exists) throw new BadRequestException('Airline already exists');
    const airport = await this.prisma.airport.findUnique({ where: { id: dto.homeAirportId } });
    if (!airport) throw new BadRequestException('Invalid home airport');
    return this.prisma.airline.create({ data: { userId, ...dto } });
  }

  me(userId: string) {
    return this.prisma.airline.findUnique({ where: { userId }, include: { homeAirport: true, aircraft: { include: { model: true } }, routes: true } });
  }
}
