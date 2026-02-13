import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RoutesService } from './routes.service';

@Controller('routes')
@UseGuards(JwtGuard)
export class RoutesController {
  constructor(private service: RoutesService) {}

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() body: unknown) {
    return this.service.create(user.sub, body);
  }

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.service.listMine(user.sub);
  }

  @Put(':id')
  update(@CurrentUser() user: { sub: string }, @Param('id') id: string, @Body() body: { ticketPrice?: number; frequencyPerDay?: number; active?: boolean }) {
    return this.service.update(user.sub, id, body);
  }
}
