import { IsInt, IsOptional, IsString } from 'class-validator';

export class OverrideAnswerScoreDto {
  @IsInt()
  manualScore: number;

  @IsOptional()
  @IsString()
  note?: string;
}
