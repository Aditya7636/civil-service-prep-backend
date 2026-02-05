import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';

export class SubmitTestAnswerDto {
  @IsUUID()
  questionId: string;

  response: unknown;
}

export class SubmitTestDto {
  @IsUUID()
  attemptId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitTestAnswerDto)
  answers: SubmitTestAnswerDto[];
}
