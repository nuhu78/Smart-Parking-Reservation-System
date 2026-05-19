import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('reservations')
@UseGuards(JwtAuthGuard) // Every route here requires the user to be logged in!
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

@Post()
  reserveSlot(@Body() createReservationDto: CreateReservationDto, @Request() req: any) {
    // We pass req.user here!
    return this.reservationsService.reserveSlot(req.user, createReservationDto.slotId);
  }

@Get('my')
  findMyReservations(@Request() req: any) {
    // Make sure this says req.user.id (NOT req.user.sub)
    return this.reservationsService.findMyReservations(req.user.id);
  }

 @Delete(':id')
  cancelReservation(@Param('id') id: string, @Request() req: any) {
    // We pass req.user here!
    return this.reservationsService.cancelReservation(+id, req.user);
  }

  // 🔒 ADMIN ONLY: Cancel reservation by slot ID (used when admin manually updates slot status)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('slot/:slotId')
  cancelReservationBySlotId(@Param('slotId') slotId: string) {
    return this.reservationsService.cancelReservationBySlotId(+slotId);
  }
}