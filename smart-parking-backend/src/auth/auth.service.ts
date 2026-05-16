import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
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
async forgotPassword(email: string) {
    // 1. Find the user by email
    const user = await this.usersService.findByEmail(email);

    // SECURITY RULE: Even if the user doesn't exist, we return a success message. 
    // This prevents hackers from using this endpoint to guess registered emails.
    if (!user) {
      return { message: 'If an account with that email exists, a reset code has been sent.' };
    }

    // 2. Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Set expiration to 15 minutes from now
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 15);

    // 4. Save the code and expiration to the database
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expirationDate;
    await this.usersService.save(user);

    // 5. Send the email (via MailService)
    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetCode);
    } catch (err) {
      // Log but do not fail the endpoint for email issues
      console.error('Failed to send password reset email', err);
    }

  

    return { message: 'If an account with that email exists, a reset code has been sent.' };
  }
async resetPassword(resetData: any) {
    const { email, code, newPassword } = resetData;

    // 1. Find the user
    const user = await this.usersService.findByEmail(email);

    // 2. Security Check: Does the user exist and does the code match?
    if (!user || user.resetPasswordCode !== code) {
      throw new BadRequestException('Invalid reset code.');
    }

    // 3. Security Check: Has the 15-minute timer expired?
    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      // If it's expired, clear the old code so they have to request a new one
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await this.usersService.save(user);
      
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Save the new password AND delete the temporary code
    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    
    await this.usersService.save(user);

    return { message: 'Password has been successfully reset. You can now log in.' };
  }

}  

