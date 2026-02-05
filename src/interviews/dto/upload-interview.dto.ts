import { IsString, IsUUID } from 'class-validator';

export class UploadInterviewDto {
  @IsUUID()
  interviewId: string;

  @IsString()
  videoUrl: string;
}
