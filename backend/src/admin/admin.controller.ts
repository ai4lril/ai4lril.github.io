import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import {
  ValidateSentenceDto,
  ValidateQuestionDto,
} from './dto/validate-content.dto';
import { AdminAuthGuard } from './admin-auth.guard';
import { SuperAdminGuard } from './super-admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/rbac.guard';

interface AdminRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminService.login(loginDto);
  }

  @UseGuards(AdminAuthGuard, SuperAdminGuard)
  @Post('users')
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @Request() req: AdminRequest,
  ) {
    return this.adminService.createAdmin(createAdminDto, req.user.id);
  }

  @UseGuards(AdminAuthGuard, SuperAdminGuard)
  @Get('users')
  async getAllAdmins(@Request() req: AdminRequest) {
    return this.adminService.getAllAdmins(req.user.id);
  }

  @UseGuards(AdminAuthGuard, SuperAdminGuard)
  @Delete('users/:id')
  async deleteAdmin(@Param('id') id: string, @Request() req: AdminRequest) {
    return this.adminService.deleteAdmin(id, req.user.id);
  }

  @Get('dashboard/stats')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @UseGuards(AdminAuthGuard)
  @Get('sentences/pending')
  async getPendingSentences(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getPendingSentences(
      parseInt(page),
      parseInt(limit),
    );
  }

  @UseGuards(AdminAuthGuard)
  @Put('sentences/:id/validate')
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  async validateSentence(
    @Param('id') id: string,
    @Body() validateDto: ValidateSentenceDto,
    @Request() req: AdminRequest,
  ) {
    return this.adminService.validateSentence(id, validateDto, req.user.id);
  }

  @UseGuards(AdminAuthGuard)
  @Get('questions/pending')
  async getPendingQuestions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getPendingQuestions(
      parseInt(page),
      parseInt(limit),
    );
  }

  @UseGuards(AdminAuthGuard)
  @Put('questions/:id/validate')
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  async validateQuestion(
    @Param('id') id: string,
    @Body() validateDto: ValidateQuestionDto,
    @Request() req: AdminRequest,
  ) {
    return this.adminService.validateQuestion(id, validateDto, req.user.id);
  }
}
