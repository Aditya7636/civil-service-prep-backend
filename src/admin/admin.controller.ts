import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateBehaviourDto } from './dto/create-behaviour.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { OverrideAnswerScoreDto } from './dto/override-answer-score.dto';
import { CreateTestDto } from './dto/create-test.dto';
import { AddTestQuestionDto } from './dto/add-test-question.dto';
import { ListQuestionsQueryDto } from './dto/list-questions.dto';
import { ListTestsQueryDto } from './dto/list-tests.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('behaviours')
  createBehaviour(@Body() body: CreateBehaviourDto) {
    return this.adminService.createBehaviour(body);
  }

  @Post('questions')
  createQuestion(@Body() body: CreateQuestionDto) {
    return this.adminService.createQuestion(body);
  }

  @Get('questions')
  listQuestions(@Query() query: ListQuestionsQueryDto) {
    return this.adminService.listQuestions(query);
  }

  @Get('analytics')
  analytics() {
    return this.adminService.analytics();
  }

  @Get('tests')
  listTests(@Query() query: ListTestsQueryDto) {
    return this.adminService.listTests(query);
  }

  @Post('tests')
  createTest(@Body() body: CreateTestDto) {
    return this.adminService.createTest(body);
  }

  @Post('tests/:id/questions')
  addTestQuestion(@Param('id') id: string, @Body() body: AddTestQuestionDto) {
    return this.adminService.addTestQuestion(id, body);
  }

  @Post('tests/:id/publish')
  publishTest(@Param('id') id: string) {
    return this.adminService.publishTest(id);
  }

  @Post('tests/:id/unpublish')
  unpublishTest(@Param('id') id: string) {
    return this.adminService.unpublishTest(id);
  }

  @Post('tests/attempts/:attemptId/answers/:questionId/override')
  overrideAnswerScore(
    @Param('attemptId') attemptId: string,
    @Param('questionId') questionId: string,
    @Body() body: OverrideAnswerScoreDto,
  ) {
    return this.adminService.overrideAnswerScore(attemptId, questionId, body);
  }
}
