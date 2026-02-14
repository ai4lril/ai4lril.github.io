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
import { VideoBlogService } from './video-blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QueueService } from '../queue/queue.service';
import { MediaUploadJobData } from '../queue/interfaces/media-upload-job.interface';

@Controller('community/video-blog')
export class VideoBlogController {
  constructor(
    private readonly videoBlogService: VideoBlogService,
    private readonly queueService: QueueService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  @HttpCode(HttpStatus.ACCEPTED)
  async createVideoBlog(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      languageCode: string;
      title: string;
      description?: string;
      thumbnailUrl?: string;
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
      contentType: file.mimetype || `video/${format}`,
      mediaType: 'video',
      duration: body.duration ? parseFloat(body.duration) : undefined,
      languageCode: body.languageCode,
      title: body.title,
      description: body.description,
      thumbnailUrl: body.thumbnailUrl,
      priority: 5, // Default priority
    };

    // Add job to video queue
    const job = await this.queueService.addVideoUploadJob(jobData);

    return {
      success: true,
      jobId: job.id,
      status: 'queued',
      message: 'Video blog upload queued for processing',
    };
  }

  @Get('status/:jobId')
  async getVideoBlogStatus(@Param('jobId') jobId: string) {
    return this.queueService.getJobStatus(jobId);
  }

  @Get(':languageCode/:id')
  async getVideoBlog(
    @Param('languageCode') languageCode: string,
    @Param('id') id: string,
  ) {
    return this.videoBlogService.getVideoBlog(id);
  }

  @Get(':languageCode')
  async getVideoBlogs(
    @Param('languageCode') languageCode: string,
    @Query('published') published?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.videoBlogService.getVideoBlogs(
      languageCode,
      published !== 'false',
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }
}
