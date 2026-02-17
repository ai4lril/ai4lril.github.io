import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        display_name: true,
        username: true,
        email: true,
        phone_number: true,
        birth_place_pincode: true,
        birth_date: true,
        gender: true,
        religion: true,
        mother: true,
        first_language: true,
        second_language: true,
        third_language: true,
        fourth_language: true,
        fifth_language: true,
        profile_picture_url: true,
        occupation: true,
        education: true,
        birthplace_village_city: true,
        birthplace_pincode: true,
        current_residence_village_city: true,
        current_residence_pincode: true,
        workplace_college_village_city: true,
        workplace_college_pincode: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateData: {
      occupation?: string;
      education?: string;
      birthplace_village_city?: string;
      birthplace_pincode?: string;
      current_residence_village_city?: string;
      current_residence_pincode?: string;
      workplace_college_village_city?: string;
      workplace_college_pincode?: string;
      phone_number?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        display_name: true,
        username: true,
        email: true,
        phone_number: true,
        occupation: true,
        education: true,
        birthplace_village_city: true,
        birthplace_pincode: true,
        current_residence_village_city: true,
        current_residence_pincode: true,
        workplace_college_village_city: true,
        workplace_college_pincode: true,
        updated_at: true,
      },
    });
  }

  async completeOnboarding(userId: string): Promise<{ success: boolean }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompletedAt: new Date() },
    });
    await this.prisma.userActivity.create({
      data: {
        userId,
        action: 'onboarding_completed',
        resource: 'tour',
        metadata: { stepsCompleted: 5 },
      },
    });
    return { success: true };
  }
}
