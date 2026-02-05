import { Injectable } from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  getById(id: string) {
    return this.questionsRepository.findById(id);
  }

  listByTest(testId: string) {
    return this.questionsRepository.findManyByTest(testId);
  }
}
