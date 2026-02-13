import { Body, Controller, Delete, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../common/guards/jwt.guard';
import { AircraftService } from './aircraft.service';

@Controller('aircraft')
@UseGuards(JwtGuard)
export class AircraftController {
  constructor(private service: AircraftService) {}

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.service.list(user.sub);
  }

  @Post('acquire')
  acquire(@CurrentUser() user: { sub: string }, @Body('modelId') modelId: string, @Headers('idempotency-key') idem?: string) {
    return this.service.acquire(user.sub, modelId, idem);
  }

  @Post('lease')
  lease(@CurrentUser() user: { sub: string }, @Body('modelId') modelId: string) {
    return this.service.lease(user.sub, modelId);
  }

  @Delete(':id')
  sell(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.service.sell(user.sub, id);
  }
}
