import { Module } from '@nestjs/common';
import { BehavioursController } from './behaviours.controller';
import { BehavioursService } from './behaviours.service';
import { BehavioursRepository } from './behaviours.repository';

@Module({
  controllers: [BehavioursController],
  providers: [BehavioursService, BehavioursRepository],
})
export class BehavioursModule {}
