import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ParkingService } from './parking.service';
import { CreateParkingAreaDto } from './dto/create-parking-area.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('parking')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post()
  @Roles(UserRole.ADMIN) // ONLY Admins can create
  create(@Body() createParkingAreaDto: CreateParkingAreaDto) {
    return this.parkingService.create(createParkingAreaDto);
  }

  @Get()
  // No @Roles decorator here means ANY logged-in user can view
  findAll() {
    return this.parkingService.findAll();
  }
}