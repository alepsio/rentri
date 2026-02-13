import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createRouteSchema } from '@shared/index';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async create(userId: string, payload: unknown) {
    const dto = createRouteSchema.parse(payload);
    const airline = await this.prisma.airline.findUniqueOrThrow({ where: { userId } });
    const origin = await this.prisma.airport.findUniqueOrThrow({ where: { id: dto.originAirportId } });
    const destination = await this.prisma.airport.findUniqueOrThrow({ where: { id: dto.destinationAirportId } });
    const aircraft = await this.prisma.aircraft.findFirstOrThrow({ where: { id: dto.aircraftId, airlineId: airline.id }, include: { model: true } });
    const distanceKm = this.haversine(origin.lat, origin.lon, destination.lat, destination.lon);
    if (distanceKm > aircraft.model.rangeKm) throw new BadRequestException('Aircraft range insufficient');

    return this.prisma.route.create({
      data: {
        airlineId: airline.id,
        originAirportId: origin.id,
        destinationAirportId: destination.id,
        aircraftId: aircraft.id,
        ticketPrice: new Prisma.Decimal(dto.ticketPrice),
        frequencyPerDay: dto.frequencyPerDay,
        distanceKm,
      },
      include: { originAirport: true, destinationAirport: true, aircraft: { include: { model: true } } },
    });
  }

  async listMine(userId: string) {
    const airline = await this.prisma.airline.findUniqueOrThrow({ where: { userId } });
    return this.prisma.route.findMany({ where: { airlineId: airline.id }, include: { originAirport: true, destinationAirport: true, aircraft: { include: { model: true } } } });
  }

  async update(userId: string, routeId: string, body: { ticketPrice?: number; frequencyPerDay?: number; active?: boolean }) {
    const airline = await this.prisma.airline.findUniqueOrThrow({ where: { userId } });
    return this.prisma.route.update({ where: { id: routeId, airlineId: airline.id }, data: { ticketPrice: body.ticketPrice, frequencyPerDay: body.frequencyPerDay, active: body.active } as any });
  }
}
