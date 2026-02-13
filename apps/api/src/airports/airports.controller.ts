import { Controller, Get, Param } from '@nestjs/common';
import { AirportsService } from './airports.service';

@Controller('airports')
export class AirportsController {
  constructor(private readonly airports: AirportsService) {}

  @Get()
  list() {
    return this.airports.list();
  }

  @Get(':id')
  details(@Param('id') id: string) {
    return this.airports.details(id);
  }
}
