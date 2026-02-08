import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser {
  user: {
    id: string;
    email?: string;
    username?: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Body()
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
    @Request() req: RequestWithUser,
  ) {
    return this.usersService.updateProfile(req.user.id, updateData);
  }
}
