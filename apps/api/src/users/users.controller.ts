import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../common/guards/jwt.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  me(@CurrentUser() user: { sub: string }) {
    return this.users.getMe(user.sub);
  }

  @UseGuards(JwtGuard)
  @Put('me')
  updateMe(@CurrentUser() user: { sub: string }, @Body() body: { displayName?: string; timezone?: string; language?: string }) {
    return this.users.updateMe(user.sub, body);
  }
}
