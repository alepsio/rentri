import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AirlinesModule } from './airlines/airlines.module';
import { AirportsModule } from './airports/airports.module';
import { AircraftModule } from './aircraft/aircraft.module';
import { RoutesModule } from './routes/routes.module';
import { FinanceModule } from './finance/finance.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { EconomyModule } from './economy/economy.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TickModule } from './tick/tick.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AuthModule,
    UsersModule,
    AirlinesModule,
    AirportsModule,
    AircraftModule,
    RoutesModule,
    FinanceModule,
    LeaderboardModule,
    EconomyModule,
    AdminModule,
    NotificationsModule,
    TickModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
