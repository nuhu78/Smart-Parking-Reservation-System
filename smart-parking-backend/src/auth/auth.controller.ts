import { Controller, Post, Body, Get, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register-admin')
  registerAdmin(@Body() registerDto: RegisterDto) {
    return this.authService.registerAdmin(registerDto);
  }

  // @UseGuards protects this route so only logged-in users can access it
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    // req.user is populated automatically by the JwtStrategy
    return req.user; 
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.forgotPassword(email);
  }
  // PUBLIC: Submit the 6-digit code and new password
  @Post('reset-password')
  async resetPassword(@Body() resetData: any) {
    if (!resetData.email || !resetData.code || !resetData.newPassword) {
      throw new BadRequestException('Email, code, and new password are required');
    }
    return this.authService.resetPassword(resetData);
  }
}