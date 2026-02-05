import { IsUUID } from 'class-validator';

export class StartInterviewDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  gradeId: string;
}
