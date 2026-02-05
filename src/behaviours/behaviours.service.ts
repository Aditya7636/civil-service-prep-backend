import { Injectable } from '@nestjs/common';
import { ListBehavioursQueryDto } from './dto/list-behaviours.dto';
import { BehavioursRepository } from './behaviours.repository';

@Injectable()
export class BehavioursService {
  constructor(private readonly behavioursRepository: BehavioursRepository) {}

  async list(query: ListBehavioursQueryDto) {
    const items = await this.behavioursRepository.findMany({ gradeName: query.grade });
    return { items };
  }

  getById(id: string) {
    return this.behavioursRepository.findById(id);
  }
}
