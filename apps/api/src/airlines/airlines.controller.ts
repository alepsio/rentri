import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../common/guards/jwt.guard';
import { AirlinesService } from './airlines.service';

@Controller('airline')
@UseGuards(JwtGuard)
export class AirlinesController {
  constructor(private readonly airlines: AirlinesService) {}

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() body: unknown) {
    return this.airlines.create(user.sub, body);
  }

  @Get('me')
  me(@CurrentUser() user: { sub: string }) {
    return this.airlines.me(user.sub);
  }
}
