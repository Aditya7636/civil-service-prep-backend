import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AddTestQuestionDto {
  @IsUUID()
  questionId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}
