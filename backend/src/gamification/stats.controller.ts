import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestUser } from '../common/request-user.types';
import { PrismaService } from '../prisma/prisma.service';

@Controller('gamification/stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('me')
  async getMyStats(@Request() req: { user: RequestUser }) {
    const userId = req.user.id;
    const stats = await this.statsService.getUserStats(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompletedAt: true },
    });

    const totalContributions =
      (stats as { totalContributions?: number }).totalContributions ?? 0;
    const totalValidations =
      (stats as { totalValidations?: number }).totalValidations ?? 0;
    const languagesContributed =
      (stats as { languagesContributed?: string[] }).languagesContributed ?? [];

    // Onboarding steps: 1=account, 2=first recording, 3=first validation, 4=language chosen, 5=5 contributions
    let onboardingStep = 1;
    if (totalContributions >= 1) onboardingStep = 2;
    if (totalValidations >= 1) onboardingStep = 3;
    if (languagesContributed.length >= 1) onboardingStep = 4;
    if (totalContributions >= 5) onboardingStep = 5;

    return {
      ...stats,
      totalContributions,
      totalValidations,
      onboardingStep,
      onboardingCompletedAt: user?.onboardingCompletedAt ?? null,
    };
  }
}
