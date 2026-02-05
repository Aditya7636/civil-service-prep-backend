import { Controller, Get, Param, Query } from '@nestjs/common';
import { BehavioursService } from './behaviours.service';
import { ListBehavioursQueryDto } from './dto/list-behaviours.dto';

@Controller('behaviours')
export class BehavioursController {
  constructor(private readonly behavioursService: BehavioursService) {}

  @Get()
  list(@Query() query: ListBehavioursQueryDto) {
    return this.behavioursService.list(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.behavioursService.getById(id);
  }
}
