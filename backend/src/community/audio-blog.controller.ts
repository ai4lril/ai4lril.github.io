import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioBlogService } from './audio-blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QueueService } from '../queue/queue.service';
import { MediaUploadJobData } from '../queue/interfaces/media-upload-job.interface';
import { RequestUser } from '../common/request-user.types';

@Controller('community/audio-blog')
export class AudioBlogController {
  constructor(
    private readonly audioBlogService: AudioBlogService,
    private readonly queueService: QueueService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  @HttpCode(HttpStatus.ACCEPTED)
  async createAudioBlog(
    @Request() req: { user: RequestUser },
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      languageCode: string;
      title: string;
      description?: string;
      duration?: string;
    },
  ) {
    const userId = req.user.id;
    const format = file.originalname.split('.').pop() || 'webm';

    // Create job data
    const jobData: MediaUploadJobData = {
      userId,
      mediaBuffer: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype || `audio/${format}`,
      mediaType: 'audio',
      duration: body.duration ? parseFloat(body.duration) : undefined,
      languageCode: body.languageCode,
      title: body.title,
      description: body.description,
      priority: 5, // Default priority
    };

    // Add job to audio queue
    const job = await this.queueService.addAudioUploadJob(jobData);

    return {
      success: true,
      jobId: job.id,
      status: 'queued',
      message: 'Audio blog upload queued for processing',
    };
  }

  @Get('status/:jobId')
  async getAudioBlogStatus(@Param('jobId') jobId: string) {
    return this.queueService.getJobStatus(jobId);
  }

  @Get(':languageCode/:id')
  async getAudioBlog(
    @Param('languageCode') languageCode: string,
    @Param('id') id: string,
  ) {
    return this.audioBlogService.getAudioBlog(id);
  }

  @Get(':languageCode')
  async getAudioBlogs(
    @Param('languageCode') languageCode: string,
    @Query('published') published?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.audioBlogService.getAudioBlogs(
      languageCode,
      published !== 'false',
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }
}
