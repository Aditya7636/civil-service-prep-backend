import { IsString, IsUUID } from 'class-validator';

export class CreateBehaviourDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsUUID()
  gradeId: string;
}
