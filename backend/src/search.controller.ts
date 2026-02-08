import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

interface RequestWithUser {
  user?: {
    id: string;
  };
}

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get()
  async search(
    @Request() req: RequestWithUser,
    @Query('q') query?: string,
    @Query('types') types?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const { id: userId } = req.user as { id: string };
    const resourceTypes = types ? types.split(',') : [];
    return this.searchService.fullTextSearch(
      query,
      resourceTypes,
      userId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  async saveSearch(
    @Request() req: RequestWithUser,
    @Body()
    body: { name: string; query: string; filters?: Record<string, any> },
  ) {
    const { id: userId } = req.user as { id: string };
    return this.searchService.saveSearch(
      userId,
      body.name,
      body.query,
      body.filters,
    );
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  async getSavedSearches(@Request() req: RequestWithUser) {
    const { id: userId } = req.user as { id: string };
    return this.searchService.getSavedSearches(userId);
  }

  @Delete('saved/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSavedSearch(@Param('id') id: string, @Request() req: RequestWithUser) {
    const { id: userId } = req.user as { id: string };
    await this.searchService.deleteSavedSearch(userId, id);
    return { success: true };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getSearchHistory(@Request() req: RequestWithUser, @Query('limit') limit?: string) {
    const { id: userId } = req.user as { id: string };
    return this.searchService.getSearchHistory(
      userId,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
