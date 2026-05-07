import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('slots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  @Roles(UserRole.ADMIN) // ONLY Admins can add slots
  create(@Body() createSlotDto: CreateSlotDto) {
    return this.slotsService.create(createSlotDto);
  }

  @Get()
  // Any logged-in user can view available slots
  findAvailable() {
    return this.slotsService.findAvailable();
  }
}