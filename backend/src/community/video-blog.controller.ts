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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoBlogService } from './video-blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('community/video-blog')
export class VideoBlogController {
  constructor(private readonly videoBlogService: VideoBlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
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
    return this.videoBlogService.createVideoBlog(
      userId,
      body.languageCode,
      body.title,
      body.description || '',
      file.buffer,
      file.originalname,
      body.thumbnailUrl,
      body.duration ? parseFloat(body.duration) : undefined,
    );
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
