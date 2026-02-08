import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AdminService } from '../../src/admin/admin.service';
import * as bcrypt from 'bcryptjs';

describe('Admin Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminService: AdminService;
  let adminToken: string;
  let adminId: string;
  let superAdminToken: string;
  let superAdminId: string;
  let sentenceId: string;
  let questionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    adminService = moduleFixture.get<AdminService>(AdminService);

    // Create super admin
    const superAdminPassword = 'SuperAdmin123!@#';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    const superAdmin = await prismaService.adminUser.create({
      data: {
        email: `superadmin${Date.now()}@example.com`,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true,
      },
    });
    superAdminId = superAdmin.id;

    const loginResult = await adminService.login({
      email: superAdmin.email,
      password: superAdminPassword,
    });
    superAdminToken = loginResult.token;

    // Create regular admin
    const adminPassword = 'Admin123!@#';
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prismaService.adminUser.create({
      data: {
        email: `admin${Date.now()}@example.com`,
        password: adminHashedPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      },
    });
    adminId = admin.id;

    const adminLoginResult = await adminService.login({
      email: admin.email,
      password: adminPassword,
    });
    adminToken = adminLoginResult.token;

    // Create test sentence and question
    const sentence = await prismaService.sentence.create({
      data: {
        text: 'Test sentence for validation',
        languageCode: 'hin_Deva',
        taskType: 'speech',
        valid: null, // Pending validation
        isActive: true,
      },
    });
    sentenceId = sentence.id;

    const questionSentence = await prismaService.sentence.create({
      data: {
        text: 'What is your name?',
        languageCode: 'hin_Deva',
        taskType: 'question',
        valid: null,
        isActive: true,
      },
    });

    const questionSubmission = await prismaService.questionSubmission.create({
      data: {
        sentenceId: questionSentence.id,
        submittedText: 'What is your name?',
        languageCode: 'hin_Deva',
        valid: null,
      },
    });
    questionId = questionSubmission.id;
  });

  afterAll(async () => {
    // Cleanup
    await prismaService.sentenceValidation
      .deleteMany({
        where: { sentenceId },
      })
      .catch(() => {});
    await prismaService.questionValidation
      .deleteMany({
        where: { questionSubmissionId: questionId },
      })
      .catch(() => {});
    await prismaService.sentence
      .deleteMany({
        where: { languageCode: 'hin_Deva' },
      })
      .catch(() => {});
    await prismaService.questionSubmission
      .deleteMany({
        where: { languageCode: 'hin_Deva' },
      })
      .catch(() => {});
    await prismaService.adminUser
      .deleteMany({
        where: { id: { in: [adminId, superAdminId] } },
      })
      .catch(() => {});
    await app.close();
  });

  describe('POST /api/admin/login', () => {
    it('should login with valid credentials', async () => {
      const newAdminPassword = 'NewAdmin123!@#';
      const hashedPassword = await bcrypt.hash(newAdminPassword, 10);
      const newAdmin = await prismaService.adminUser.create({
        data: {
          email: `testadmin${Date.now()}@example.com`,
          password: hashedPassword,
          name: 'Test Admin',
          role: 'admin',
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/admin/login')
        .send({
          email: newAdmin.email,
          password: newAdminPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('admin');
      expect(response.body.admin.email).toBe(newAdmin.email);

      // Cleanup
      await prismaService.adminUser
        .delete({ where: { id: newAdmin.id } })
        .catch(() => {});
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('POST /api/admin/users (Super Admin Only)', () => {
    it('should create admin user as super admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: `newadmin${Date.now()}@example.com`,
          password: 'NewAdmin123!@#',
          name: 'New Admin',
          role: 'admin',
        })
        .expect(201);

      expect(response.body.email).toBeDefined();
      expect(response.body.role).toBe('admin');

      // Cleanup
      await prismaService.adminUser
        .delete({ where: { id: response.body.id } })
        .catch(() => {});
    });

    it('should reject if not super admin', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'Test123!@#',
          name: 'Test',
          role: 'admin',
        })
        .expect(403);
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/users')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
          name: 'Test',
          role: 'admin',
        })
        .expect(401);
    });
  });

  describe('GET /api/admin/dashboard/stats', () => {
    it('should return dashboard stats with admin auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalSentences');
      expect(response.body).toHaveProperty('pendingSentences');
      expect(response.body).toHaveProperty('pendingQuestions');
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/dashboard/stats')
        .expect(401);
    });
  });

  describe('GET /api/admin/sentences/pending', () => {
    it('should return pending sentences with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/sentences/pending?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sentences');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/sentences/pending')
        .expect(401);
    });
  });

  describe('PUT /api/admin/sentences/:id/validate', () => {
    it('should validate sentence with automated rules', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/admin/sentences/${sentenceId}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          valid: undefined, // Let automated validation decide
          comment: '',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('valid');
      expect(response.body).toHaveProperty('autoValidated');
    });

    it('should allow manual override', async () => {
      const newSentence = await prismaService.sentence.create({
        data: {
          text: 'Short', // Would be auto-rejected
          languageCode: 'hin_Deva',
          taskType: 'speech',
          valid: null,
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .put(`/api/admin/sentences/${newSentence.id}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          valid: true, // Manual override
          comment: 'Manually approved',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(true);

      // Cleanup
      await prismaService.sentence
        .delete({ where: { id: newSentence.id } })
        .catch(() => {});
    });

    it('should reject without authentication', async () => {
      await request(app.getHttpServer())
        .put(`/api/admin/sentences/${sentenceId}/validate`)
        .send({ valid: true })
        .expect(401);
    });
  });

  describe('GET /api/admin/questions/pending', () => {
    it('should return pending questions with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/questions/pending?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('questions');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('PUT /api/admin/questions/:id/validate', () => {
    it('should validate question with automated rules', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/admin/questions/${questionId}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          valid: undefined,
          comment: '',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('valid');
    });
  });
});
