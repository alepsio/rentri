import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EconomyService {
  constructor(private prisma: PrismaService) {}

  config() {
    return this.prisma.economyConfig.findMany();
  }
}
