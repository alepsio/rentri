import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AirlinesController } from './airlines.controller';
import { AirlinesService } from './airlines.service';

@Module({ controllers: [AirlinesController], providers: [AirlinesService, PrismaService], exports: [AirlinesService] })
export class AirlinesModule {}
