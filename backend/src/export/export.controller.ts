import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExportService } from './export.service';
import { DatasetExportService } from './dataset-export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/rbac.guard';
import { RequestUser } from '../common/request-user.types';

@Controller('export')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly datasetExportService: DatasetExportService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createExport(
    @Request() req: { user: RequestUser },
    @Body()
    body: {
      type: string;
      format: 'csv' | 'json' | 'zip';
      filters?: Record<string, any>;
    },
  ) {
    const userId = req.user.id;
    const jobId = await this.exportService.createExportJob(
      userId,
      body.type,
      body.format,
      body.filters,
    );
    return { jobId, status: 'pending' };
  }

  @Get('job/:id')
  @UseGuards(JwtAuthGuard)
  async getExportJob(@Param('id') id: string) {
    return this.exportService.getExportJob(id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getExportHistory(
    @Request() req: { user: RequestUser },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user.id;
    return this.exportService.getExportHistory(
      userId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Post('dataset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async exportDataset(
    @Body()
    filters: {
      languageCode?: string;
      validated?: boolean;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const fileUrl = await this.datasetExportService.exportDataset({
      languageCode: filters.languageCode,
      validated: filters.validated,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    });
    return { fileUrl };
  }
}
