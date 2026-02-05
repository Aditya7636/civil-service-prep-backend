import { IsOptional, IsString } from 'class-validator';

export class ListBehavioursQueryDto {
  @IsOptional()
  @IsString()
  grade?: string;
}
