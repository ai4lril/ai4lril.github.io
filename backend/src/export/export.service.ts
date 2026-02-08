import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { join } from 'path';
import { createObjectCsvWriter } from 'csv-writer';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async createExportJob(
    userId: string | null,
    type: string,
    format: 'csv' | 'json' | 'zip',
    filters?: Record<string, any>,
  ): Promise<string> {
    try {
      const job = await this.prisma.exportJob.create({
        data: {
          userId,
          type,
          format,
          filters: filters || {},
          status: 'pending',
        },
      });

      // Process export asynchronously
      this.processExport(job.id).catch((error) => {
        this.logger.error(`Export job ${job.id} failed: ${error.message}`);
      });

      return job.id;
    } catch (error) {
      this.logger.error(`Failed to create export job: ${error.message}`);
      throw error;
    }
  }

  private async processExport(jobId: string): Promise<void> {
    try {
      const job = await this.prisma.exportJob.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error('Export job not found');
      }

      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: 'processing',
          startedAt: new Date(),
        },
      });

      let filePath: string;
      let fileSize: number;

      switch (job.type) {
        case 'contributions':
          ({ filePath, fileSize } = await this.exportContributions(job));
          break;
        case 'users':
          ({ filePath, fileSize } = await this.exportUsers(job));
          break;
        case 'analytics':
          ({ filePath, fileSize } = await this.exportAnalytics(job));
          break;
        default:
          throw new Error(`Unknown export type: ${job.type}`);
      }

      // Upload to MinIO
      const fs = await import('fs');
      const fileBuffer = fs.readFileSync(filePath);
      const contentType =
        job.format === 'csv' ? 'text/csv' : 'application/json';
      const fileUrl = await this.storageService.uploadMedia(
        fileBuffer,
        `exports/${jobId}.${job.format}`,
        contentType,
        'audio', // Using 'audio' as mediaType, though it's not really audio
      );

      // Calculate expiration date
      const retentionDays = parseInt(
        process.env.EXPORT_RETENTION_DAYS || '90',
        10,
      );
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + retentionDays);

      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          fileUrl,
          fileSize,
          completedAt: new Date(),
          expiresAt,
        },
      });

      // Create export file record
      await this.prisma.exportFile.create({
        data: {
          exportJobId: jobId,
          fileName: `export_${job.type}_${new Date().toISOString().split('T')[0]}.${job.format}`,
          fileUrl,
          fileSize,
          mimeType: job.format === 'csv' ? 'text/csv' : 'application/json',
        },
      });

      this.logger.log(`Export job ${jobId} completed successfully`);
    } catch (error) {
      this.logger.error(`Export job ${jobId} failed: ${error.message}`);
      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error.message,
          completedAt: new Date(),
        },
      });
    }
  }

  private async exportContributions(
    job: any,
  ): Promise<{ filePath: string; fileSize: number }> {
    const contributions = await this.prisma.contribution.findMany({
      where: job.filters || {},
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (job.format === 'csv') {
      const filePath = join('/tmp', `export_${job.id}.csv`);
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'id', title: 'ID' },
          { id: 'userId', title: 'User ID' },
          { id: 'username', title: 'Username' },
          { id: 'type', title: 'Type' },
          { id: 'language', title: 'Language' },
          { id: 'status', title: 'Status' },
          { id: 'createdAt', title: 'Created At' },
        ],
      });

      await csvWriter.writeRecords(
        contributions.map((c) => ({
          id: c.id,
          userId: c.userId,
          username: c.user.username,
          type: c.type,
          language: c.language,
          status: c.status,
          createdAt: c.createdAt.toISOString(),
        })),
      );

      const fs = await import('fs');
      const stats = fs.statSync(filePath);
      return { filePath, fileSize: stats.size };
    } else {
      // JSON format
      const filePath = join('/tmp', `export_${job.id}.json`);
      const fs = await import('fs');
      fs.writeFileSync(filePath, JSON.stringify(contributions, null, 2));
      const stats = fs.statSync(filePath);
      return { filePath, fileSize: stats.size };
    }
  }

  private async exportUsers(
    job: any,
  ): Promise<{ filePath: string; fileSize: number }> {
    const users = await this.prisma.user.findMany({
      where: job.filters || {},
      select: {
        id: true,
        username: true,
        email: true,
        display_name: true,
        first_language: true,
        points: true,
        level: true,
        tier: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (job.format === 'csv') {
      const filePath = join('/tmp', `export_${job.id}.csv`);
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'id', title: 'ID' },
          { id: 'username', title: 'Username' },
          { id: 'email', title: 'Email' },
          { id: 'displayName', title: 'Display Name' },
          { id: 'firstLanguage', title: 'First Language' },
          { id: 'points', title: 'Points' },
          { id: 'level', title: 'Level' },
          { id: 'tier', title: 'Tier' },
          { id: 'createdAt', title: 'Created At' },
        ],
      });

      await csvWriter.writeRecords(
        users.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          displayName: u.display_name,
          firstLanguage: u.first_language,
          points: u.points,
          level: u.level,
          tier: u.tier,
          createdAt: u.created_at.toISOString(),
        })),
      );

      const fs = await import('fs');
      const stats = fs.statSync(filePath);
      return { filePath, fileSize: stats.size };
    } else {
      const filePath = join('/tmp', `export_${job.id}.json`);
      const fs = await import('fs');
      fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
      const stats = fs.statSync(filePath);
      return { filePath, fileSize: stats.size };
    }
  }

  private async exportAnalytics(
    job: any,
  ): Promise<{ filePath: string; fileSize: number }> {
    // Export analytics data
    const analytics = {
      totalUsers: await this.prisma.user.count(),
      totalContributions: await this.prisma.contribution.count(),
      totalRecordings: await this.prisma.speechRecording.count(),
      exportDate: new Date().toISOString(),
    };

    const filePath = join('/tmp', `export_${job.id}.json`);
    const fs = await import('fs');
    fs.writeFileSync(filePath, JSON.stringify(analytics, null, 2));
    const stats = fs.statSync(filePath);
    return { filePath, fileSize: stats.size };
  }

  async getExportJob(jobId: string) {
    const job = await this.prisma.exportJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return null;
    }

    const files = await this.prisma.exportFile.findMany({
      where: { exportJobId: jobId },
    });

    return {
      ...job,
      exportFiles: files,
    };
  }

  async getExportHistory(userId?: string, limit = 50, offset = 0) {
    const jobs = await this.prisma.exportJob.findMany({
      where: userId ? { userId } : {},
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Fetch export files separately
    const jobIds = jobs.map((job) => job.id);
    const files = await this.prisma.exportFile.findMany({
      where: { exportJobId: { in: jobIds } },
    });

    const filesMap = new Map<string, typeof files>();
    files.forEach((file) => {
      const existing = filesMap.get(file.exportJobId) || [];
      existing.push(file);
      filesMap.set(file.exportJobId, existing);
    });

    return jobs.map((job) => ({
      ...job,
      exportFiles: filesMap.get(job.id) || [],
    }));
  }
}
