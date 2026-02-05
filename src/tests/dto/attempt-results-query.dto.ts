import { IsOptional, IsString } from 'class-validator';

export class AttemptResultsQueryDto {
  @IsOptional()
  @IsString()
  admin?: string;
}
