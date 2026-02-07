import { TestsService } from './tests.service';

type AttemptStub = {
  id: string;
  testId: string;
  userId: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  version: number;
  test: { id: string; name: string; timeLimit: number; grade?: { name: string } };
  answers: [];
};

const baseAttempt = (overrides: Partial<AttemptStub> = {}): AttemptStub => ({
  id: 'attempt-1',
  testId: 'test-1',
  userId: 'user-1',
  status: 'IN_PROGRESS',
  startedAt: new Date('2026-02-06T10:00:00.000Z'),
  completedAt: null,
  createdAt: new Date('2026-02-06T10:00:00.000Z'),
  updatedAt: new Date('2026-02-06T10:00:00.000Z'),
  deletedAt: null,
  version: 1,
  test: { id: 'test-1', name: 'Sample', timeLimit: 30, grade: { name: 'HEO' } },
  answers: [],
  ...overrides,
});

describe('TestsService', () => {
  test('listAttempts marks expired attempts', async () => {
    const prisma = {
      testAttempt: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          baseAttempt({
            startedAt: new Date(Date.now() - 60 * 60 * 1000),
          }),
        ]),
        update: jest.fn().mockResolvedValue({}),
      },
    } as any;

    const service = new TestsService({} as any, {} as any, prisma);
    const result = await service.listAttempts('user-1');
    expect(result.items[0].status).toBe('EXPIRED');
    expect(prisma.testAttempt.update).toHaveBeenCalled();
  });

  test('computeAnswerScoring normalizes MCQ to 4', () => {
    const service = new TestsService({} as any, {} as any, {} as any);
    const result = (service as any).computeAnswerScoring(
      {
        type: 'MCQ',
        correctAnswer: 'A',
        metadata: {},
        behaviourLinks: [{ behaviourId: 'b1', behaviour: { name: 'Delivering at Pace' } }],
      },
      'A',
    );
    expect(result.awardedScore).toBe(4);
    expect(result.maxScore).toBe(4);
  });

  test('computeAnswerScoring supports rubric breakdown', () => {
    const service = new TestsService({} as any, {} as any, {} as any);
    const result = (service as any).computeAnswerScoring(
      {
        type: 'FREE_TEXT',
        metadata: {
          rubric: [
            { id: 'situation', max: 4 },
            { id: 'action', max: 4 },
          ],
        },
        behaviourLinks: [{ behaviourId: 'b1', behaviour: { name: 'Delivering at Pace' } }],
      },
      { rubricScores: { situation: 3, action: 4 } },
    );
    expect(result.rubricBreakdown).toBeTruthy();
    expect(result.awardedScore).toBeGreaterThan(0);
  });
});
