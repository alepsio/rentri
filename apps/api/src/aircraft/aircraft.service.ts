import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AircraftService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    const airline = await this.prisma.airline.findUniqueOrThrow({ where: { userId } });
    return this.prisma.aircraft.findMany({ where: { airlineId: airline.id }, include: { model: true } });
  }

  async acquire(userId: string, modelId: string, idempotencyKey?: string) {
    return this.prisma.$transaction(async (tx) => {
      if (idempotencyKey) {
        const exists = await tx.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
        if (exists) return exists.response as object;
      }
      const airline = await tx.airline.findUniqueOrThrow({ where: { userId } });
      const model = await tx.aircraftModel.findUniqueOrThrow({ where: { id: modelId } });
      const price = new Prisma.Decimal(model.purchasePrice);
      if (new Prisma.Decimal(airline.cash).lessThan(price)) throw new BadRequestException('Insufficient cash');

      const registrationCode = `SW-${Math.floor(Math.random() * 9000 + 1000)}`;
      const aircraft = await tx.aircraft.create({ data: { airlineId: airline.id, modelId, leased: false, registrationCode } });
      const cashAfter = new Prisma.Decimal(airline.cash).minus(price);
      await tx.airline.update({ where: { id: airline.id }, data: { cash: cashAfter } });
      await tx.ledgerEntry.create({ data: { airlineId: airline.id, type: 'EXPENSE', amount: price, description: `Aircraft purchase ${model.name}` } });
      const response = { aircraft, cashAfter };
      if (idempotencyKey) await tx.idempotencyKey.create({ data: { key: idempotencyKey, endpoint: '/aircraft/acquire', userId, response } });
      return response;
    });
  }

  async lease(userId: string, modelId: string) {
    const airline = await this.prisma.airline.findUniqueOrThrow({ where: { userId } });
    const model = await this.prisma.aircraftModel.findUniqueOrThrow({ where: { id: modelId } });
    return this.prisma.aircraft.create({ data: { airlineId: airline.id, modelId, leased: true, registrationCode: `LS-${Date.now().toString().slice(-6)}` } });
  }

  async sell(userId: string, aircraftId: string) {
    return this.prisma.$transaction(async (tx) => {
      const airline = await tx.airline.findUniqueOrThrow({ where: { userId } });
      const aircraft = await tx.aircraft.findFirstOrThrow({ where: { id: aircraftId, airlineId: airline.id }, include: { model: true } });
      const refund = new Prisma.Decimal(aircraft.model.purchasePrice).mul(0.55);
      await tx.airline.update({ where: { id: airline.id }, data: { cash: new Prisma.Decimal(airline.cash).plus(refund) } });
      await tx.aircraft.delete({ where: { id: aircraft.id } });
      await tx.ledgerEntry.create({ data: { airlineId: airline.id, type: 'REVENUE', amount: refund, description: `Aircraft sold ${aircraft.registrationCode}` } });
      return { ok: true, refund };
    });
  }
}
