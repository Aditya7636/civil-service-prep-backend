import { IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  userId: string;

  @IsString()
  priceId: string;
}
