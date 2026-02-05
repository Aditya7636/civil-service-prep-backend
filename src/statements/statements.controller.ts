import { Body, Controller, Post } from '@nestjs/common';
import { StatementsService } from './statements.service';
import { AnalyseStatementDto } from './dto/analyse-statement.dto';
import { SaveStatementDto } from './dto/save-statement.dto';

@Controller('statements')
export class StatementsController {
  constructor(private readonly statementsService: StatementsService) {}

  @Post('analyse')
  analyse(@Body() body: AnalyseStatementDto) {
    return this.statementsService.analyse(body);
  }

  @Post('save')
  save(@Body() body: SaveStatementDto) {
    return this.statementsService.save(body);
  }
}
