import { Body, Controller, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('create')
  create(@Body() body: CreateSubscriptionDto) {
    return this.subscriptionsService.create(body);
  }

  @Post('webhook')
  webhook(@Body() body: unknown) {
    return this.subscriptionsService.webhook(body);
  }
}
