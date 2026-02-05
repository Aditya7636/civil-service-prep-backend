import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionsService {
  create(payload: { userId: string; priceId: string }) {
    return {
      subscriptionId: 'stripe-placeholder',
      ...payload,
    };
  }

  webhook(payload: unknown) {
    return {
      received: true,
      payload,
    };
  }
}
