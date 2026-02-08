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
import { AudioBlogService } from './audio-blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('community/audio-blog')
export class AudioBlogController {
  constructor(private readonly audioBlogService: AudioBlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  async createAudioBlog(
    @Request() req,
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
    return this.audioBlogService.createAudioBlog(
      userId,
      body.languageCode,
      body.title,
      body.description || '',
      file.buffer,
      file.originalname,
      body.duration ? parseFloat(body.duration) : undefined,
    );
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
