import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('community/forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('categories')
  async getCategories() {
    return this.forumService.getCategories();
  }

  @Get('posts')
  async getPosts(
    @Query('category') categoryId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.forumService.getPosts(
      categoryId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('posts/:id')
  async getPost(@Param('id') id: string) {
    return this.forumService.getPost(id);
  }

  @Get('posts/:id/replies')
  async getReplies(
    @Param('id') postId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.forumService.getReplies(
      postId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Request() req,
    @Body() body: { categoryId: string; title: string; content: string },
  ) {
    const userId = req.user.id;
    return this.forumService.createPost(
      userId,
      body.categoryId,
      body.title,
      body.content,
    );
  }

  @Post('posts/:id/replies')
  @UseGuards(JwtAuthGuard)
  async createReply(
    @Param('id') postId: string,
    @Request() req,
    @Body() body: { content: string },
  ) {
    const userId = req.user.id;
    return this.forumService.createReply(userId, postId, body.content);
  }
}
