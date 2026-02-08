import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('community/blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlogPost(
    @Request() req,
    @Body()
    body: {
      languageCode: string;
      script: string;
      title: string;
      content: string;
      excerpt?: string;
    },
  ) {
    const userId = req.user.id;
    return this.blogService.createBlogPost(
      userId,
      body.languageCode,
      body.script,
      body.title,
      body.content,
      body.excerpt,
    );
  }

  @Get(':languageCode/:script/:id')
  async getBlogPost(
    @Param('languageCode') languageCode: string,
    @Param('script') script: string,
    @Param('id') id: string,
  ) {
    return this.blogService.getBlogPost(id);
  }

  @Get(':languageCode/:script')
  async getBlogPosts(
    @Param('languageCode') languageCode: string,
    @Param('script') script: string,
    @Query('published') published?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.blogService.getBlogPosts(
      languageCode,
      script,
      published !== 'false',
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateBlogPost(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updates: {
      title?: string;
      content?: string;
      excerpt?: string;
      published?: boolean;
    },
  ) {
    const userId = req.user.id;
    return this.blogService.updateBlogPost(id, userId, updates);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBlogPost(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    await this.blogService.deleteBlogPost(id, userId);
    return { success: true };
  }
}
