import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TestsService } from './tests.service';
import { AttemptResultsQueryDto } from './dto/attempt-results-query.dto';
import { ListAttemptsQueryDto } from './dto/list-attempts.dto';
import { StartTestDto } from './dto/start-test.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  list() {
    return this.testsService.list();
  }

  @UseGuards(JwtAuthGuard)
  @Get('attempts')
  listAttempts(
    @Query() query: ListAttemptsQueryDto,
    @Req() req: { user?: { id?: string; role?: string } },
  ) {
    const isAdmin = req.user?.role === 'ADMIN';
    const userId = isAdmin ? query.userId ?? req.user?.id : req.user?.id;
    return this.testsService.listAttempts(
      userId,
      query.status,
      query.page ?? 1,
      query.pageSize ?? 20,
    );
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.testsService.getTestMetadata(id);
  }

  @Post(':id/start')
  start(@Param('id') id: string, @Body() body: StartTestDto) {
    return this.testsService.start(id, body.userId);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() body: SubmitTestDto) {
    return this.testsService.submit(id, body);
  }

  @Get('attempts/:id/results')
  resultsByAttempt(
    @Param('id') id: string,
    @Query() query: AttemptResultsQueryDto,
    @Req() req: { user?: { role?: string } },
  ) {
    const isAdmin = req.user?.role === 'ADMIN' || query.admin === 'true';
    return this.testsService.resultsByAttempt(id, isAdmin);
  }

  @Get(':id/results')
  results(@Param('id') id: string) {
    return this.testsService.results(id);
  }
}
