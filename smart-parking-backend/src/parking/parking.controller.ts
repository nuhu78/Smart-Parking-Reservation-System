import { Controller, Get, Post, Body, UseGuards, Query, Patch, Delete, Param } from '@nestjs/common';
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
  findAll(@Query('search') search?: string) { // <-- Catch the search query
    return this.parkingService.findAll(search);
  }
  // 🔒 ADMIN ONLY: Update a location's name or details
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.parkingService.update(+id, updateData);
  }

  // 🔒 ADMIN ONLY: Delete a location
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parkingService.remove(+id);
  }
}



