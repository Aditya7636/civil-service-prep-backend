import { IsString, IsUUID } from 'class-validator';

export class SaveStatementDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;
}
