import { IsInt, IsString, IsUUID, Min } from 'class-validator';

export class CreateTestDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(1)
  timeLimit: number;

  @IsUUID()
  gradeId: string;
}
