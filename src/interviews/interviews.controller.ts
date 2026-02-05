import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { StartInterviewDto } from './dto/start-interview.dto';
import { UploadInterviewDto } from './dto/upload-interview.dto';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('start')
  start(@Body() body: StartInterviewDto) {
    return this.interviewsService.start(body);
  }

  @Post('upload')
  upload(@Body() body: UploadInterviewDto) {
    return this.interviewsService.upload(body);
  }

  @Get(':id/feedback')
  feedback(@Param('id') id: string) {
    return this.interviewsService.feedback(id);
  }
}
