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
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard, Roles } from './auth/rbac.guard';

interface AdminRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post('login')
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminService.login(loginDto);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @Request() req: AdminRequest,
  ) {
    return this.adminService.createAdmin(createAdminDto, req.user.id);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getAllAdmins(@Request() req: AdminRequest) {
    return this.adminService.getAllAdmins(req.user.id);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async deleteAdmin(@Param('id') id: string, @Request() req: AdminRequest) {
    return this.adminService.deleteAdmin(id, req.user.id);
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('sentences/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  async getPendingSentences(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getPendingSentences(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put('sentences/:id/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  async validateSentence(
    @Param('id') id: string,
    @Body() validateDto: ValidateSentenceDto,
    @Request() req: AdminRequest,
  ) {
    return this.adminService.validateSentence(id, validateDto, req.user.id);
  }

  @Get('questions/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  async getPendingQuestions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getPendingQuestions(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put('questions/:id/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  async validateQuestion(
    @Param('id') id: string,
    @Body() validateDto: ValidateQuestionDto,
    @Request() req: AdminRequest,
  ) {
    return this.adminService.validateQuestion(id, validateDto, req.user.id);
  }
}
