import { Injectable } from '@nestjs/common';
import { Prisma, TestAttempt } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestAttemptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TestAttemptCreateInput): Promise<TestAttempt> {
    return this.prisma.testAttempt.create({ data });
  }

  findById(id: string): Promise<TestAttempt | null> {
    return this.prisma.testAttempt.findFirst({
      where: { id, deletedAt: null },
      include: { answers: true, test: true, user: true },
    });
  }

  update(id: string, data: Prisma.TestAttemptUpdateInput): Promise<TestAttempt> {
    return this.prisma.testAttempt.update({ where: { id }, data });
  }
}
