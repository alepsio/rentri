import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../common/guards/jwt.guard';
import { FinanceService } from './finance.service';

@Controller('finance')
@UseGuards(JwtGuard)
export class FinanceController {
  constructor(private service: FinanceService) {}

  @Get('summary')
  summary(@CurrentUser() user: { sub: string }) {
    return this.service.summary(user.sub);
  }

  @Get('ledger')
  ledger(@CurrentUser() user: { sub: string }) {
    return this.service.ledger(user.sub);
  }
}
