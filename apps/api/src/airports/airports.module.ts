import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AirportsController } from './airports.controller';
import { AirportsService } from './airports.service';

@Module({ controllers: [AirportsController], providers: [AirportsService, PrismaService] })
export class AirportsModule {}
