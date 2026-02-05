import { Injectable } from '@nestjs/common';

@Injectable()
export class StatementsService {
  analyse(payload: { content: string; grade?: string }) {
    return {
      grade: payload.grade,
      summary: 'Analysis placeholder',
      recommendations: [],
    };
  }

  save(payload: { userId: string; title: string; content: string }) {
    return {
      id: 'statement-placeholder',
      ...payload,
    };
  }
}
