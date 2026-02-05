import { Injectable } from '@nestjs/common';

@Injectable()
export class InterviewsService {
  start(payload: { userId: string; gradeId: string }) {
    return {
      id: 'interview-placeholder',
      ...payload,
    };
  }

  upload(payload: { interviewId: string; videoUrl: string }) {
    return {
      ...payload,
      status: 'uploaded',
    };
  }

  feedback(interviewId: string) {
    return {
      interviewId,
      scorecards: [],
    };
  }
}
