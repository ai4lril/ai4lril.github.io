import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import * as bcrypt from 'bcryptjs';
import { AdminLoginDto } from './dto/login.dto';
import { CreateAdminDto, AdminRole } from './dto/create-admin.dto';
import {
  ValidateSentenceDto,
  ValidateQuestionDto,
} from './dto/validate-content.dto';

/**
 * Service for admin operations including authentication, user management, and content validation
 * Handles admin login, admin user CRUD, and automated/manual content validation
 */
@Injectable()
export class AdminService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private cacheInvalidation: CacheInvalidationService,
    private realtimeGateway: RealtimeGateway,
  ) { }

  /**
   * Admin login with email and password
   *
   * @param loginDto - Login credentials (email and password)
   * @returns Object with JWT token and admin user info
   * @throws UnauthorizedException if credentials are invalid or admin is inactive
   */
  async login(loginDto: AdminLoginDto) {
    const { email, password } = loginDto;

    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    const token = this.jwtService.sign(payload);

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
      token,
    };
  }

  /**
   * Create a new admin user (super admin only)
   *
   * @param createAdminDto - Admin user data (email, password, name, role)
   * @param currentAdminId - ID of the admin creating the new admin
   * @returns Created admin user (without password)
   * @throws ForbiddenException if requester is not super admin
   * @throws ConflictException if admin with email already exists
   * @throws ForbiddenException if super admin limit (3) is reached
   */
  async createAdmin(createAdminDto: CreateAdminDto, currentAdminId: string) {
    // Check if current admin is super admin
    const currentAdmin = await this.prisma.adminUser.findUnique({
      where: { id: currentAdminId },
    });

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      throw new ForbiddenException('Only super admins can create admin users');
    }

    // Check if admin already exists
    const existingAdmin = await this.prisma.adminUser.findUnique({
      where: { email: createAdminDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Check super admin limit (max 3)
    if (createAdminDto.role === AdminRole.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.adminUser.count({
        where: { role: 'super_admin' },
      });

      if (superAdminCount >= 3) {
        throw new ForbiddenException(
          'Maximum of 3 super admin accounts allowed',
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 12);

    // Create admin
    return await this.prisma.adminUser.create({
      data: {
        name: createAdminDto.name,
        email: createAdminDto.email,
        password: hashedPassword,
        role: createAdminDto.role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get all admin users (super admin only)
   *
   * @param currentAdminId - ID of the requesting admin
   * @returns Array of admin users (without passwords)
   * @throws ForbiddenException if requester is not super admin
   */
  async getAllAdmins(currentAdminId: string) {
    const currentAdmin = await this.prisma.adminUser.findUnique({
      where: { id: currentAdminId },
    });

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      throw new ForbiddenException('Only super admins can view all admins');
    }

    return this.prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete an admin user (super admin only)
   *
   * @param adminId - ID of the admin to delete
   * @param currentAdminId - ID of the requesting admin
   * @returns Success status
   * @throws ForbiddenException if requester is not super admin
   * @throws ForbiddenException if trying to delete own account
   * @throws NotFoundException if admin not found
   */
  async deleteAdmin(adminId: string, currentAdminId: string) {
    const currentAdmin = await this.prisma.adminUser.findUnique({
      where: { id: currentAdminId },
    });

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      throw new ForbiddenException('Only super admins can delete admin users');
    }

    if (adminId === currentAdminId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.prisma.adminUser.delete({
      where: { id: adminId },
    });

    return { success: true };
  }

  /**
   * Validate a sentence (Write feature submission)
   * Uses automated validation rules but allows manual override
   *
   * @param sentenceId - ID of the sentence to validate
   * @param validateDto - Validation data (valid flag, comment)
   * @param adminId - ID of the admin performing validation
   * @returns Validation result with auto-validation info
   * @throws NotFoundException if sentence not found
   */
  async validateSentence(
    sentenceId: string,
    validateDto: ValidateSentenceDto,
    adminId: string,
  ) {
    const sentence = await this.prisma.sentence.findUnique({
      where: { id: sentenceId },
    });

    if (!sentence) {
      throw new NotFoundException('Sentence not found');
    }

    // Automated validation rules (can be overridden by manual validation)
    let autoValidated = false;
    let autoValidationReason = '';

    // Rule 1: Check for empty or whitespace-only sentences
    if (!sentence.text || sentence.text.trim().length === 0) {
      autoValidated = false;
      autoValidationReason = 'Sentence is empty or contains only whitespace';
    }
    // Rule 2: Check for minimum length (at least 3 characters)
    else if (sentence.text.trim().length < 3) {
      autoValidated = false;
      autoValidationReason = 'Sentence is too short (minimum 3 characters)';
    }
    // Rule 3: Check for excessive length (more than 500 characters)
    else if (sentence.text.length > 500) {
      autoValidated = false;
      autoValidationReason = 'Sentence exceeds maximum length (500 characters)';
    }
    // Rule 4: Check for valid language code format
    else if (
      !sentence.languageCode ||
      !/^[a-z]{3}_[A-Z][a-z]{3}$/.test(sentence.languageCode)
    ) {
      autoValidated = false;
      autoValidationReason =
        'Invalid language code format (expected ISO 639-3_ISO 15924)';
    }
    // Rule 5: Check for suspicious patterns (e.g., repeated characters, URLs, emails)
    else if (this.hasSuspiciousPatterns(sentence.text)) {
      autoValidated = false;
      autoValidationReason =
        'Sentence contains suspicious patterns (URLs, emails, or repeated characters)';
    }
    // Rule 6: Basic validation passed
    else {
      autoValidated = true;
      autoValidationReason = 'Passed automated validation checks';
    }

    // Use manual validation if provided, otherwise use automated result
    const finalValid =
      validateDto.valid !== undefined ? validateDto.valid : autoValidated;
    const comment =
      validateDto.comment ||
      (autoValidated
        ? autoValidationReason
        : `Auto-rejected: ${autoValidationReason}`);

    // Update sentence valid status
    await this.prisma.sentence.update({
      where: { id: sentenceId },
      data: { valid: finalValid },
    });

    // Create validation record
    await this.prisma.sentenceValidation.create({
      data: {
        sentenceId,
        adminUserId: adminId,
        valid: finalValid,
        comment,
      },
    });

    // Invalidate related caches when sentence validation changes
    await this.cacheInvalidation.invalidateSentence(
      sentenceId,
      sentence.languageCode,
    );
    await this.cacheInvalidation.invalidateSearch(); // Validation affects search results

    // Emit real-time update to admin room
    this.realtimeGateway.emitToRoom('admin:content', 'update', {
      type: 'sentence',
      id: sentenceId,
      action: 'validated',
      valid: finalValid,
    });

    // Notify submitter if they have an account
    if (sentence.userId) {
      this.realtimeGateway.emitNotification(sentence.userId, {
        type: 'sentence_validated',
        sentenceId,
        valid: finalValid,
        message: finalValid
          ? 'Your sentence was approved'
          : 'Your sentence was rejected',
      });
    }

    // Emit updated stats to admin room
    const stats = await this.getDashboardStats();
    this.realtimeGateway.emitToRoom('admin:content', 'admin:stats', stats);

    return {
      success: true,
      valid: finalValid,
      autoValidated,
      autoValidationReason,
    };
  }

  private hasSuspiciousPatterns(text: string): boolean {
    // Check for URLs
    const urlPattern = /https?:\/\/[^\s]+/gi;
    if (urlPattern.test(text)) return true;

    // Check for email addresses
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    if (emailPattern.test(text)) return true;

    // Check for excessive repeated characters (e.g., "aaaaaa")
    const repeatedCharPattern = /(.)\1{5,}/gi;
    if (repeatedCharPattern.test(text)) return true;

    // Check for excessive whitespace
    if (/\s{10,}/.test(text)) return true;

    return false;
  }

  /**
   * Validate a question submission (Spontaneous Speech feature)
   * Uses automated validation rules but allows manual override
   *
   * @param questionSubmissionId - ID of the question submission to validate
   * @param validateDto - Validation data (valid flag, comment)
   * @param adminId - ID of the admin performing validation
   * @returns Validation result with auto-validation info
   * @throws NotFoundException if question submission not found
   */
  async validateQuestion(
    questionSubmissionId: string,
    validateDto: ValidateQuestionDto,
    adminId: string,
  ) {
    const question = await this.prisma.questionSubmission.findUnique({
      where: { id: questionSubmissionId },
      include: {
        sentence: true,
      },
    });

    if (!question) {
      throw new NotFoundException('Question submission not found');
    }

    const questionText =
      question.submittedText || question.sentence?.text || '';

    // Automated validation rules (can be overridden by manual validation)
    let autoValidated = false;
    let autoValidationReason = '';

    // Rule 1: Check for empty or whitespace-only questions
    if (!questionText || questionText.trim().length === 0) {
      autoValidated = false;
      autoValidationReason = 'Question is empty or contains only whitespace';
    }
    // Rule 2: Check for minimum length (at least 5 characters for questions)
    else if (questionText.trim().length < 5) {
      autoValidated = false;
      autoValidationReason = 'Question is too short (minimum 5 characters)';
    }
    // Rule 3: Check for excessive length (more than 200 characters)
    else if (questionText.length > 200) {
      autoValidated = false;
      autoValidationReason = 'Question exceeds maximum length (200 characters)';
    }
    // Rule 4: Check for question mark (questions should typically end with ?)
    else if (
      !questionText.trim().endsWith('?') &&
      !questionText.trim().endsWith('।') &&
      !questionText.trim().endsWith('?')
    ) {
      // Not necessarily invalid, but note it
      autoValidated = true;
      autoValidationReason =
        'Question does not end with question mark, but passed other checks';
    }
    // Rule 5: Check for suspicious patterns
    else if (this.hasSuspiciousPatterns(questionText)) {
      autoValidated = false;
      autoValidationReason =
        'Question contains suspicious patterns (URLs, emails, or repeated characters)';
    }
    // Rule 6: Basic validation passed
    else {
      autoValidated = true;
      autoValidationReason = 'Passed automated validation checks';
    }

    // Use manual validation if provided, otherwise use automated result
    const finalValid =
      validateDto.valid !== undefined ? validateDto.valid : autoValidated;
    const comment =
      validateDto.comment ||
      (autoValidated
        ? autoValidationReason
        : `Auto-rejected: ${autoValidationReason}`);

    // Update question valid status
    await this.prisma.questionSubmission.update({
      where: { id: questionSubmissionId },
      data: { valid: finalValid },
    });

    // Create validation record
    await this.prisma.questionValidation.create({
      data: {
        questionSubmissionId,
        adminUserId: adminId,
        valid: finalValid,
        comment,
      },
    });

    // Invalidate related caches when question validation changes
    await this.cacheInvalidation.invalidateQuestionAnswer(
      questionSubmissionId,
    );
    await this.cacheInvalidation.invalidateSearch(); // Validation affects search results

    // Emit real-time update to admin room
    this.realtimeGateway.emitToRoom('admin:content', 'update', {
      type: 'question',
      id: questionSubmissionId,
      action: 'validated',
      valid: finalValid,
    });

    // Notify submitter if they have an account
    if (question.userId) {
      this.realtimeGateway.emitNotification(question.userId, {
        type: 'question_validated',
        questionId: questionSubmissionId,
        valid: finalValid,
        message: finalValid
          ? 'Your question was approved'
          : 'Your question was rejected',
      });
    }

    // Emit updated stats to admin room
    const stats = await this.getDashboardStats();
    this.realtimeGateway.emitToRoom('admin:content', 'admin:stats', stats);

    return {
      success: true,
      valid: finalValid,
      autoValidated,
      autoValidationReason,
    };
  }

  /**
   * Get pending sentences awaiting admin validation
   *
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of sentences per page (default: 20)
   * @param filters - Optional filters (search, languageCode, status, dateFrom, dateTo)
   * @returns Object with sentences array and pagination metadata
   */
  async getPendingSentences(
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string;
      languageCode?: string;
      status?: 'all' | 'pending' | 'approved' | 'rejected';
      dateFrom?: Date;
      dateTo?: Date;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Status filter: pending = valid null, approved = true, rejected = false, all = no filter
    if (filters?.status === 'all') {
      // No valid filter - show all
    } else if (filters?.status === 'approved') {
      where.valid = true;
    } else if (filters?.status === 'rejected') {
      where.valid = false;
    } else {
      // Default: pending (valid null)
      where.valid = null;
    }

    if (filters?.search?.trim()) {
      where.text = {
        contains: filters.search.trim(),
        mode: 'insensitive',
      };
    }

    if (filters?.languageCode) {
      where.languageCode = filters.languageCode;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        (where.createdAt as Record<string, Date>).gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        (where.createdAt as Record<string, Date>).lte = filters.dateTo;
      }
    }

    const [sentences, total] = await Promise.all([
      this.prisma.sentence.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sentence.count({ where }),
    ]);

    return {
      sentences,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get pending question submissions awaiting admin validation
   *
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of questions per page (default: 20)
   * @param filters - Optional filters (search, languageCode, status, dateFrom, dateTo)
   * @returns Object with questions array and pagination metadata
   */
  async getPendingQuestions(
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string;
      languageCode?: string;
      status?: 'all' | 'pending' | 'approved' | 'rejected';
      dateFrom?: Date;
      dateTo?: Date;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters?.status === 'all') {
      // No valid filter
    } else if (filters?.status === 'approved') {
      where.valid = true;
    } else if (filters?.status === 'rejected') {
      where.valid = false;
    } else {
      where.valid = null;
    }

    if (filters?.search?.trim()) {
      where.submittedText = {
        contains: filters.search.trim(),
        mode: 'insensitive',
      };
    }

    if (filters?.languageCode) {
      where.languageCode = filters.languageCode;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        (where.createdAt as Record<string, Date>).gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        (where.createdAt as Record<string, Date>).lte = filters.dateTo;
      }
    }

    const [questions, total] = await Promise.all([
      this.prisma.questionSubmission.findMany({
        where,
        skip,
        take: limit,
        include: {
          sentence: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.questionSubmission.count({ where }),
    ]);

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get dashboard statistics for admin panel
   *
   * @returns Object with various counts (users, sentences, questions, recordings, validations, pending items)
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalSentences,
      totalQuestions,
      pendingSentences,
      pendingQuestions,
      totalRecordings,
      totalValidations,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deleted_at: null } }),
      this.prisma.sentence.count(),
      this.prisma.questionSubmission.count(),
      this.prisma.sentence.count({ where: { valid: null } }),
      this.prisma.questionSubmission.count({ where: { valid: null } }),
      this.prisma.speechRecording.count(),
      this.prisma.validation.count(),
    ]);

    return {
      totalUsers,
      totalSentences,
      totalQuestions,
      pendingSentences,
      pendingQuestions,
      totalRecordings,
      totalValidations,
    };
  }
}
