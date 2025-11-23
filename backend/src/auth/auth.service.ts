import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, username, password, birth_date, ...userData } = signupDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        email,
        username,
        password: hashedPassword,
        birth_date: new Date(birth_date),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        display_name: true,
        username: true,
        email: true,
        phone_number: true,
        current_residence_pincode: true,
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
        created_at: true,
      },
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        current_residence_pincode: user.current_residence_pincode,
        birth_place_pincode: user.birth_place_pincode,
        birth_date: user.birth_date,
        gender: user.gender,
        religion: user.religion,
        mother: user.mother,
        first_language: user.first_language,
        second_language: user.second_language,
        third_language: user.third_language,
        fourth_language: user.fourth_language,
        fifth_language: user.fifth_language,
        profile_picture_url: user.profile_picture_url,
        created_at: user.created_at,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        display_name: true,
        username: true,
        email: true,
        phone_number: true,
        current_residence_pincode: true,
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
        created_at: true,
      },
    });
  }
}
