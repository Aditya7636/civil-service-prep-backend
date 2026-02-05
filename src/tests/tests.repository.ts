import { Injectable } from '@nestjs/common';
import { Prisma, Test } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(): Promise<Test[]> {
    return this.prisma.test.findMany({
      where: { deletedAt: null },
      include: { grade: true },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string): Promise<Test | null> {
    return this.prisma.test.findFirst({
      where: { id, deletedAt: null },
      include: { grade: true },
    });
  }

  findWithQuestionsAndBehaviours(id: string) {
    return this.prisma.test.findFirst({
      where: { id, deletedAt: null },
      include: {
        grade: true,
        questions: {
          orderBy: { order: 'asc' },
          include: {
            question: {
              include: {
                behaviourLinks: {
                  include: {
                    behaviour: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  create(data: Prisma.TestCreateInput): Promise<Test> {
    return this.prisma.test.create({ data });
  }
}
