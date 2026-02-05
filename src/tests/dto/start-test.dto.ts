import { IsUUID } from 'class-validator';

export class StartTestDto {
  @IsUUID()
  userId: string;
}
