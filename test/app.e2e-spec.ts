import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestsController } from '../src/tests/tests.controller';
import { TestsService } from '../src/tests/tests.service';

const fakeService = {
  list: jest.fn().mockResolvedValue({ items: [] }),
  getTestMetadata: jest.fn().mockResolvedValue({
    id: 'test-1',
    name: 'Sample Test',
    timeLimit: 30,
    grade: 'HEO',
    questions: [{ id: 'q1', prompt: 'Question', type: 'MCQ', options: ['A', 'B'] }],
  }),
  start: jest.fn().mockResolvedValue({
    testId: 'test-1',
    userId: 'user-1',
    attemptId: 'attempt-1',
    startedAt: new Date().toISOString(),
    questionOrder: ['q1'],
  }),
  submit: jest.fn().mockResolvedValue({
    testId: 'test-1',
    attemptId: 'attempt-1',
    overallScore: 80,
    behaviourScores: [],
    recommendations: [],
  }),
  resultsByAttempt: jest.fn().mockResolvedValue({
    attemptId: 'attempt-1',
    testId: 'test-1',
    status: 'SUBMITTED',
    startedAt: new Date().toISOString(),
    overallScore: 80,
    behaviourScores: [],
    recommendations: [],
  }),
  results: jest.fn().mockResolvedValue({
    testId: 'test-1',
    overallScore: 80,
    behaviourScores: [],
    recommendations: [],
  }),
};

describe('Tests flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestsController],
      providers: [{ provide: TestsService, useValue: fakeService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('starts, submits, and fetches results', async () => {
    await request(app.getHttpServer()).get('/api/tests/test-1').expect(200);

    const startRes = await request(app.getHttpServer())
      .post('/api/tests/test-1/start')
      .send({ userId: 'user-1' })
      .expect(201);
    expect(startRes.body.attemptId).toBe('attempt-1');

    await request(app.getHttpServer())
      .post('/api/tests/test-1/submit')
      .send({ attemptId: 'attempt-1', answers: [{ questionId: 'q1', response: 'A' }] })
      .expect(201);

    const results = await request(app.getHttpServer())
      .get('/api/tests/attempts/attempt-1/results')
      .expect(200);
    expect(results.body.attemptId).toBe('attempt-1');
  });
});
