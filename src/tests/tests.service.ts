import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitTestDto } from './dto/submit-test.dto';
import { TestAttemptsRepository } from './test-attempts.repository';
import { TestsRepository } from './tests.repository';

const SCORE_MAX = 4;

@Injectable()
export class TestsService {
  constructor(
    private readonly testsRepository: TestsRepository,
    private readonly testAttemptsRepository: TestAttemptsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async list() {
    const items = await this.testsRepository.findMany();
    return { items };
  }

  async start(testId: string, userId: string) {
    const test = await this.testsRepository.findWithQuestionsAndBehaviours(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const questionItems = test.questions.map((item) => item.question);
    if (questionItems.length === 0) {
      throw new NotFoundException('Test has no questions');
    }

    const randomized = this.shuffle(questionItems);

    const attempt = await this.prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.testAttempt.create({
        data: {
          test: { connect: { id: testId } },
          user: { connect: { id: userId } },
          startedAt: new Date(),
          status: 'IN_PROGRESS',
        },
      });

      await tx.answer.createMany({
        data: randomized.map((question, index) => ({
          attemptId: createdAttempt.id,
          questionId: question.id,
          order: index + 1,
          response: { value: null },
        })),
      });

      return createdAttempt;
    });

    return {
      testId,
      userId,
      attemptId: attempt.id,
      startedAt: attempt.startedAt.toISOString(),
      questionOrder: randomized.map((question) => question.id),
    };
  }

  async submit(testId: string, payload: SubmitTestDto) {
    const test = await this.testsRepository.findWithQuestionsAndBehaviours(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const attempt = await this.testAttemptsRepository.findById(payload.attemptId);
    if (!attempt || attempt.testId !== testId) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Attempt is not active');
    }

    if (this.isExpired(attempt.startedAt, test.timeLimit)) {
      await this.prisma.testAttempt.update({
        where: { id: attempt.id },
        data: { status: 'EXPIRED', completedAt: new Date() },
      });
      throw new BadRequestException('Attempt has expired');
    }

    const questionsById = new Map(
      test.questions.map((link) => [link.questionId, link.question]),
    );

    const scoreState = {
      earned: 0,
      possible: test.questions.length * SCORE_MAX,
    };

    const behaviourTotals = new Map<
      string,
      { name: string; earned: number; possible: number }
    >();

    await this.prisma.$transaction(async (tx) => {
      for (const answer of payload.answers) {
        const question = questionsById.get(answer.questionId);
        if (!question) {
          continue;
        }

        const scoring = this.computeAnswerScoring(question, answer.response);

        scoreState.earned += scoring.awardedScore;

        for (const contribution of scoring.behaviourContributions) {
          const entry =
            behaviourTotals.get(contribution.behaviourId) ??
            {
              name: contribution.behaviour,
              earned: 0,
              possible: 0,
            };
          entry.earned += contribution.awarded;
          entry.possible += contribution.max;
          behaviourTotals.set(contribution.behaviourId, entry);
        }

        await tx.answer.update({
          where: {
            attemptId_questionId: {
              attemptId: payload.attemptId,
              questionId: answer.questionId,
            },
          },
          data: {
            response: answer.response ?? { value: null },
            score: Math.round(scoring.awardedScore),
            awardedScore: scoring.awardedScore,
            maxScore: scoring.maxScore,
            behaviourContributions: scoring.behaviourContributions,
            rubricBreakdown: scoring.rubricBreakdown,
          },
        });
      }

      await tx.testAttempt.update({
        where: { id: payload.attemptId },
        data: {
          completedAt: new Date(),
          status: 'SUBMITTED',
          score: Math.round((scoreState.earned / scoreState.possible) * 100),
        },
      });
    });

    return {
      testId,
      attemptId: payload.attemptId,
      ...this.buildResults(scoreState, behaviourTotals, test.grade?.name),
    };
  }

  async results(testId: string) {
    const test = await this.testsRepository.findWithQuestionsAndBehaviours(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    return {
      testId,
      ...this.buildResults(
        { earned: 0, possible: test.questions.length * SCORE_MAX },
        new Map(),
        test.grade?.name,
      ),
    };
  }

  async resultsByAttempt(attemptId: string, includeAudit: boolean) {
    const attempt = await this.prisma.testAttempt.findFirst({
      where: { id: attemptId, deletedAt: null },
      include: {
        test: { include: { grade: true } },
        answers: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            question: {
              include: { behaviourLinks: { include: { behaviour: true } } },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    const scoreState = { earned: 0, possible: 0 };
    const behaviourTotals = new Map<
      string,
      { name: string; earned: number; possible: number }
    >();

    const auditDetails = attempt.answers.map((answer) => {
      const contributions = (answer.behaviourContributions ?? []) as Array<{
        behaviourId: string;
        behaviour: string;
        awarded: number;
        max: number;
      }>;

      const effectiveScore = this.resolveManualScore(answer);
      const scoreRatio = this.resolveScoreRatio(answer, effectiveScore, contributions);

      scoreState.earned += effectiveScore;
      scoreState.possible += answer.maxScore ?? SCORE_MAX;

      for (const contribution of contributions) {
        const entry =
          behaviourTotals.get(contribution.behaviourId) ??
          {
            name: contribution.behaviour,
            earned: 0,
            possible: 0,
          };
        entry.possible += contribution.max;
        entry.earned += contribution.awarded * scoreRatio;
        behaviourTotals.set(contribution.behaviourId, entry);
      }

      if (!includeAudit) {
        return undefined;
      }

      return {
        questionId: answer.questionId,
        order: answer.order,
        response: answer.response,
        awardedScore: answer.awardedScore,
        maxScore: answer.maxScore,
        manualOverride: answer.manualOverride,
        manualScore: answer.manualScore,
        behaviourContributions: contributions,
        rubricBreakdown: answer.rubricBreakdown,
      };
    });

    return {
      attemptId: attempt.id,
      testId: attempt.testId,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt?.toISOString(),
      ...this.buildResults(scoreState, behaviourTotals, attempt.test.grade?.name),
      audit: includeAudit ? auditDetails.filter(Boolean) : undefined,
    };
  }

  // Example query: fetch a test with ordered questions and linked behaviours.
  getTestWithQuestionsAndBehaviours(testId: string) {
    return this.testsRepository.findWithQuestionsAndBehaviours(testId);
  }

  private shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private isExpired(startedAt: Date, timeLimitMinutes: number) {
    // The time limit is stored in minutes and enforced on the server.
    const expiresAt = startedAt.getTime() + timeLimitMinutes * 60 * 1000;
    return Date.now() > expiresAt;
  }

  private computeAnswerScoring(
    question: {
      type: string;
      correctAnswer?: string | null;
      metadata?: Prisma.JsonValue;
      behaviourLinks?: Array<{ behaviourId: string; behaviour?: { name: string } | null }>;
    },
    response: unknown,
  ) {
    const metadata = (question.metadata ?? {}) as Record<string, unknown>;
    const base = this.scoreAnswer(question, response, metadata);

    const awardedScore = this.normalizeToFour(base.rawScore, base.maxScore);
    const maxScore = SCORE_MAX;

    const behaviourLinks = question.behaviourLinks ?? [];
    const behaviourCount = behaviourLinks.length || 1;

    const behaviourContributions = behaviourLinks.map((link) => ({
      behaviourId: link.behaviourId,
      behaviour: link.behaviour?.name ?? 'Behaviour',
      awarded: awardedScore / behaviourCount,
      max: maxScore / behaviourCount,
    }));

    return {
      awardedScore,
      maxScore,
      behaviourContributions,
      rubricBreakdown: base.rubricBreakdown ?? null,
    };
  }

  private normalizeToFour(rawScore: number, maxScore: number) {
    if (maxScore <= 0) return 0;
    const normalized = (rawScore / maxScore) * SCORE_MAX;
    return Math.max(0, Math.min(SCORE_MAX, normalized));
  }

  private scoreAnswer(
    question: { type: string; correctAnswer?: string | null },
    response: unknown,
    metadata: Record<string, unknown>,
  ) {
    switch (question.type) {
      case 'MCQ': {
        const correct = question.correctAnswer ?? '';
        const isCorrect = typeof response === 'string' && response === correct;
        return { rawScore: isCorrect ? 1 : 0, maxScore: 1 };
      }
      case 'NUMERICAL': {
        const correctValue = Number(question.correctAnswer);
        const responseValue = typeof response === 'number' ? response : Number(response);
        const tolerance = typeof metadata.tolerance === 'number' ? metadata.tolerance : 0;
        const isCorrect =
          Number.isFinite(correctValue) &&
          Number.isFinite(responseValue) &&
          Math.abs(correctValue - responseValue) <= tolerance;
        return { rawScore: isCorrect ? 1 : 0, maxScore: 1 };
      }
      case 'SJT': {
        const weights = (metadata.sjtWeights ?? {}) as Record<string, number>;
        const weightValues = Object.values(weights);
        const maxWeight = weightValues.length ? Math.max(...weightValues) : 0;
        // Weighted scoring awards partial credit for the quality of selected options.
        if (Array.isArray(response)) {
          const selected = response as string[];
          const rawScore = selected.reduce((sum, option) => sum + (weights[option] ?? 0), 0);
          const sorted = [...weightValues].sort((a, b) => b - a);
          const maxScore =
            sorted.slice(0, selected.length).reduce((sum, value) => sum + value, 0) || 1;
          return { rawScore, maxScore };
        }
        if (typeof response === 'string') {
          return { rawScore: weights[response] ?? 0, maxScore: maxWeight || 1 };
        }
        return { rawScore: 0, maxScore: maxWeight || 1 };
      }
      case 'FREE_TEXT': {
        if (response && typeof response === 'object') {
          const rubricScores = (response as { rubricScores?: Record<string, number>; score?: number })
            .rubricScores;
          if (rubricScores && metadata.rubric && Array.isArray(metadata.rubric)) {
            const rubric = metadata.rubric as Array<{ id: string; max?: number; label?: string }>;
            const maxScore = rubric.reduce((sum, item) => sum + (item.max ?? SCORE_MAX), 0);
            const rawScore = rubric.reduce(
              (sum, item) => sum + Math.min(rubricScores[item.id] ?? 0, item.max ?? SCORE_MAX),
              0,
            );
            return {
              rawScore,
              maxScore: maxScore || SCORE_MAX,
              rubricBreakdown: rubric.map((item) => ({
                id: item.id,
                label: item.label ?? item.id,
                score: Math.min(rubricScores[item.id] ?? 0, item.max ?? SCORE_MAX),
                max: item.max ?? SCORE_MAX,
              })),
            };
          }
          if (typeof (response as { score?: number }).score === 'number') {
            const rawScore = Math.max(0, Math.min(SCORE_MAX, (response as { score: number }).score));
            return { rawScore, maxScore: SCORE_MAX };
          }
        }
        return { rawScore: 0, maxScore: SCORE_MAX };
      }
      case 'TECHNICAL': {
        const expected = metadata.correctAnswer ?? question.correctAnswer;
        const isCorrect =
          expected !== undefined && JSON.stringify(expected) === JSON.stringify(response);
        return { rawScore: isCorrect ? 1 : 0, maxScore: 1 };
      }
      default:
        return { rawScore: 0, maxScore: 1 };
    }
  }

  private resolveManualScore(answer: {
    manualOverride: boolean;
    manualScore: number | null;
    awardedScore: number | null;
    maxScore: number | null;
  }) {
    if (answer.manualOverride && typeof answer.manualScore === 'number') {
      return Math.max(0, Math.min(answer.maxScore ?? SCORE_MAX, answer.manualScore));
    }
    return answer.awardedScore ?? 0;
  }

  private resolveScoreRatio(
    answer: { awardedScore: number | null; maxScore: number | null },
    effectiveScore: number,
    contributions: Array<{ awarded: number; max: number }>,
  ) {
    const storedAwarded = answer.awardedScore ?? 0;
    if (storedAwarded > 0) {
      return effectiveScore / storedAwarded;
    }

    const totalMax = contributions.reduce((sum, item) => sum + item.max, 0);
    if (totalMax > 0) {
      return effectiveScore / totalMax;
    }

    return 0;
  }

  private buildResults(
    scoreState: { earned: number; possible: number },
    behaviourTotals: Map<string, { name: string; earned: number; possible: number }>,
    gradeName?: string,
  ) {
    const overallScore =
      scoreState.possible > 0 ? Math.round((scoreState.earned / scoreState.possible) * 100) : 0;
    const behaviourScores = Array.from(behaviourTotals.values()).map((entry) => ({
      behaviour: entry.name,
      score:
        entry.possible > 0 ? Math.round((entry.earned / entry.possible) * SCORE_MAX * 100) / 100 : 0,
    }));

    return {
      overallScore,
      grade: gradeName,
      behaviourScores,
      recommendations: [],
    };
  }
}
