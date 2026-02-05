import { Injectable } from '@nestjs/common';
import { TestAttemptsRepository } from './test-attempts.repository';

@Injectable()
export class TestAttemptsService {
  constructor(private readonly testAttemptsRepository: TestAttemptsRepository) {}

  getById(id: string) {
    return this.testAttemptsRepository.findById(id);
  }
}
