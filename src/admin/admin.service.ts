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

  async listTests(query: { q?: string; published?: boolean; page?: number; pageSize?: number }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      deletedAt: null,
      ...(typeof query.published === 'boolean' ? { isPublished: query.published } : {}),
      ...(query.q
        ? {
            name: {
              contains: query.q,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const total = await this.prisma.test.count({ where });
    const items = await this.prisma.test.findMany({
      where,
      include: { grade: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map((test) => ({
        id: test.id,
        name: test.name,
        type: test.type,
        grade: test.grade?.name,
        timeLimit: test.timeLimit,
        isPublished: test.isPublished,
      })),
      page,
      pageSize,
      total,
    };
  }

  async listQuestions(query: {
    q?: string;
    type?: string;
    gradeId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      deletedAt: null,
      ...(query.type ? { type: query.type as never } : {}),
      ...(query.gradeId ? { gradeId: query.gradeId } : {}),
      ...(query.q
        ? {
            prompt: {
              contains: query.q,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const total = await this.prisma.question.count({ where });
    const items = await this.prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        type: question.type,
        gradeId: question.gradeId,
        difficulty: question.difficulty,
      })),
      page,
      pageSize,
      total,
    };
  }

  async createTest(payload: { name: string; type: string; timeLimit: number; gradeId: string }) {
    return this.prisma.test.create({
      data: {
        name: payload.name,
        type: payload.type as never,
        timeLimit: payload.timeLimit,
        grade: { connect: { id: payload.gradeId } },
      },
    });
  }

  async publishTest(testId: string) {
    return this.prisma.test.update({
      where: { id: testId },
      data: { isPublished: true },
    });
  }

  async unpublishTest(testId: string) {
    return this.prisma.test.update({
      where: { id: testId },
      data: { isPublished: false },
    });
  }

  async addTestQuestion(
    testId: string,
    payload: { questionId: string; order?: number },
  ) {
    return this.prisma.testQuestion.upsert({
      where: {
        testId_questionId: {
          testId,
          questionId: payload.questionId,
        },
      },
      create: {
        testId,
        questionId: payload.questionId,
        order: payload.order ?? null,
      },
      update: {
        order: payload.order ?? null,
      },
    });
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
