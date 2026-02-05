import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BehavioursModule } from './behaviours/behaviours.module';
import { TestsModule } from './tests/tests.module';
import { StatementsModule } from './statements/statements.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AdminModule } from './admin/admin.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BehavioursModule,
    TestsModule,
    StatementsModule,
    InterviewsModule,
    AdminModule,
    SubscriptionsModule,
    UsersModule,
  ],
})
export class AppModule {}
