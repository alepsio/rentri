import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { TickService } from './tick.service';

@Module({ imports: [NotificationsModule], providers: [TickService, PrismaService], exports: [TickService] })
export class TickModule {}
