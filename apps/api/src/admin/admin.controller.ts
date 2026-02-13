import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../common/guards/jwt.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtGuard)
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('users')
  users(@CurrentUser() user: { role: string }) {
    return this.service.users(user.role);
  }

  @Patch('users/:id/ban')
  ban(@CurrentUser() user: { sub: string; role: string }, @Param('id') id: string, @Body('days') days = 7) {
    return this.service.ban(user.sub, user.role, id, days);
  }

  @Patch('economy')
  patchEconomy(@CurrentUser() user: { sub: string; role: string }, @Body() body: { key: string; value: unknown }) {
    return this.service.patchEconomy(user.sub, user.role, body);
  }
}
