import { IsArray, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  prompt: string;

  @IsString()
  type: string;

  @IsUUID()
  gradeId: string;

  @IsInt()
  difficulty: number;

  @IsOptional()
  @IsArray()
  behaviourIds?: string[];
}
