import { IsOptional, IsString } from 'class-validator';

export class AnalyseStatementDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  grade?: string;
}
