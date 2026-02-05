import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { QuestionsRepository } from './questions.repository';
import { TestAttemptsRepository } from './test-attempts.repository';
import { TestsRepository } from './tests.repository';
import { QuestionsService } from './questions.service';
import { TestAttemptsService } from './test-attempts.service';

@Module({
  controllers: [TestsController],
  providers: [
    TestsService,
    TestsRepository,
    QuestionsRepository,
    TestAttemptsRepository,
    QuestionsService,
    TestAttemptsService,
  ],
})
export class TestsModule {}
