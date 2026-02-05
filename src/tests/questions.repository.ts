import { Injectable } from '@nestjs/common';
import { Prisma, Question } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Question | null> {
    return this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: { grade: true, behaviourLinks: { include: { behaviour: true } } },
    });
  }

  findManyByTest(testId: string): Promise<Question[]> {
    return this.prisma.question.findMany({
      where: {
        deletedAt: null,
        testLinks: { some: { testId } },
      },
      include: { behaviourLinks: { include: { behaviour: true } } },
    });
  }

  create(data: Prisma.QuestionCreateInput): Promise<Question> {
    return this.prisma.question.create({ data });
  }
}
