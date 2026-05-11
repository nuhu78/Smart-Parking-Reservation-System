import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Remove password from the response
    const { password, ...result } = user;
    return result;
  }

  async registerAdmin(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newAdmin = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const { password, ...adminWithoutPassword } = newAdmin;
    return {
      message: 'Admin account created successfully',
      user: adminWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('this email is not registered');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('password is incorrect');
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}