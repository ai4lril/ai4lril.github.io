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
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser {
  user?: {
    id: string;
  };
}

@ApiTags('search')
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
    @Query('languageCode') languageCode?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('orderBy') orderBy?: 'relevance' | 'date',
  ) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const userId = (req.user as { id?: string })?.id;
    const resourceTypes = types ? types.split(',') : [];
    const filters =
      languageCode || dateFrom || dateTo || orderBy
        ? {
          ...(languageCode && { languageCode }),
          ...(dateFrom && { dateFrom: new Date(dateFrom) }),
          ...(dateTo && { dateTo: new Date(dateTo) }),
          ...(orderBy && { orderBy }),
        }
        : undefined;
    return this.searchService.fullTextSearch(
      query,
      resourceTypes,
      userId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
      filters,
    );
  }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  async saveSearch(
    @Request() req,
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
  async getSavedSearches(@Request() req) {
    const { id: userId } = req.user as { id: string };
    return this.searchService.getSavedSearches(userId);
  }

  @Delete('saved/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSavedSearch(@Param('id') id: string, @Request() req) {
    const { id: userId } = req.user as { id: string };
    await this.searchService.deleteSavedSearch(userId, id);
    return { success: true };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getSearchHistory(@Request() req, @Query('limit') limit?: string) {
    const { id: userId } = req.user as { id: string };
    return this.searchService.getSearchHistory(
      userId,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
