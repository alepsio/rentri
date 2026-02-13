import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EconomyController } from './economy.controller';
import { EconomyService } from './economy.service';

@Module({ controllers: [EconomyController], providers: [EconomyService, PrismaService], exports: [EconomyService] })
export class EconomyModule {}
