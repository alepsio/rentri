import { Controller, Get } from '@nestjs/common';
import { EconomyService } from './economy.service';

@Controller('economy')
export class EconomyController {
  constructor(private readonly service: EconomyService) {}

  @Get('config')
  config() {
    return this.service.config();
  }
}
