import { Injectable } from '@nestjs/common';
import { Behaviour, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BehavioursRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { gradeName?: string }): Promise<Behaviour[]> {
    return this.prisma.behaviour.findMany({
      where: {
        deletedAt: null,
        grade: params.gradeName ? { name: params.gradeName } : undefined,
      },
      include: { grade: true, examples: true },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string): Promise<Behaviour | null> {
    return this.prisma.behaviour.findFirst({
      where: { id, deletedAt: null },
      include: { grade: true, examples: true },
    });
  }

  create(data: Prisma.BehaviourCreateInput): Promise<Behaviour> {
    return this.prisma.behaviour.create({ data });
  }
}
