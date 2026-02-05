import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  createBehaviour(payload: { name: string; description: string; gradeId: string }) {
    return {
      id: 'behaviour-placeholder',
      ...payload,
    };
  }

  createQuestion(payload: {
    prompt: string;
    type: string;
    gradeId: string;
    difficulty: number;
    behaviourIds?: string[];
  }) {
    return {
      id: 'question-placeholder',
      ...payload,
    };
  }

  analytics() {
    return {
      users: 0,
      testsCompleted: 0,
      conversionRate: 0,
    };
  }

  async overrideAnswerScore(
    attemptId: string,
    questionId: string,
    payload: { manualScore: number; note?: string },
  ) {
    return this.prisma.answer.update({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      data: {
        manualOverride: true,
        manualScore: payload.manualScore,
        rubricBreakdown: payload.note ? { note: payload.note } : undefined,
      },
    });
  }
}
