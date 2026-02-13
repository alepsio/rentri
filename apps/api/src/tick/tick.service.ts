import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class TickService implements OnModuleInit {
  constructor(private prisma: PrismaService, private notifications: NotificationsGateway) {}

  onModuleInit() {
    setInterval(() => this.runTick().catch(() => undefined), 5 * 60 * 1000);
  }

  private clamp(value: number, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
  }

  async runTick() {
    const routes = await this.prisma.route.findMany({ where: { active: true }, include: { aircraft: { include: { model: true } }, originAirport: true, destinationAirport: true, airline: true } });
    for (const route of routes) {
      const distance = route.distanceKm;
      const speed = route.aircraft.model.cruiseKmh;
      const flightTimeHours = distance / speed + route.aircraft.model.turnaroundMin / 60;
      const fuelUsedKg = distance * route.aircraft.model.fuelBurnKgKm;
      const fuelPrice = Number(route.originAirport.fuelPriceBase) * (0.9 + Math.random() * 0.2);
      const fuelCost = fuelUsedKg * fuelPrice;
      const normalizedPrice = Number(route.ticketPrice) / 250;
      const reputationFactor = 0.8 + route.airline.reputation / 250;
      const frequencyFactor = Math.min(1.25, 0.75 + route.frequencyPerDay * 0.06);
      const baseDemand = (route.originAirport.demandBase + route.destinationAirport.demandBase) * 1000;
      const demand = baseDemand * (1 - 0.35 * normalizedPrice) * reputationFactor * frequencyFactor;
      const seatsOffered = (route.aircraft.model.seatsEconomy + route.aircraft.model.seatsBusiness) * route.frequencyPerDay;
      const loadFactor = this.clamp(demand / seatsOffered, 0.35, 0.98);
      const pax = Math.floor(seatsOffered * loadFactor);
      const revenue = pax * Number(route.ticketPrice);
      const airportFees = Number(route.originAirport.landingFee) + Number(route.destinationAirport.landingFee) + pax * (Number(route.originAirport.passengerFee) + Number(route.destinationAirport.passengerFee));
      const crewCost = flightTimeHours * 1800 * route.frequencyPerDay;
      const maintenanceReserve = Number(route.aircraft.model.maintenanceCostHr) * flightTimeHours * route.frequencyPerDay;
      const costs = fuelCost + airportFees + crewCost + maintenanceReserve;
      const profit = revenue - costs;

      await this.prisma.$transaction(async (tx) => {
        await tx.ledgerEntry.create({
          data: {
            airlineId: route.airlineId,
            type: profit >= 0 ? 'REVENUE' : 'EXPENSE',
            amount: new Prisma.Decimal(Math.abs(profit)),
            description: `Tick result ${route.originAirport.iata}-${route.destinationAirport.iata}`,
            metadata: { loadFactor, pax, revenue, costs, fuelUsedKg },
          },
        });
        await tx.airline.update({
          where: { id: route.airlineId },
          data: {
            cash: new Prisma.Decimal(route.airline.cash).plus(profit),
            reputation: this.clamp(route.airline.reputation / 100 + (profit >= 0 ? 0.004 : -0.003), 0.1, 1) * 100,
            punctuality: this.clamp(route.airline.punctuality / 100 + (Math.random() > 0.9 ? -0.015 : 0.004), 0.35, 0.99) * 100,
          },
        });
      });
    }
    this.notifications.emitWorldTick({ tickAt: new Date().toISOString(), activeRoutes: routes.length });
  }
}
