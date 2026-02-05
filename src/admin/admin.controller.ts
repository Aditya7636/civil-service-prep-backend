import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateBehaviourDto } from './dto/create-behaviour.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { OverrideAnswerScoreDto } from './dto/override-answer-score.dto';

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

  @Get('analytics')
  analytics() {
    return this.adminService.analytics();
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
