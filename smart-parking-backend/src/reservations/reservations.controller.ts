import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { ReservationStatus } from './reservation.entity';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  reserveSlot(@Body() dto: CreateReservationDto, @Request() req: any) {
    return this.reservationsService.reserveSlot(
      req.user,
      dto.slotId,
      new Date(dto.startTime),
      new Date(dto.endTime),
    );
  }

  @Get('my')
  findMyReservations(@Request() req: any) {
    return this.reservationsService.findMyReservations(req.user.id);
  }

  @Delete(':id')
  cancelReservation(@Param('id') id: string, @Request() req: any) {
    return this.reservationsService.cancelReservation(+id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('slot/:slotId')
  cancelReservationBySlotId(@Param('slotId') slotId: string) {
    return this.reservationsService.cancelReservationBySlotId(+slotId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query('status') status?: ReservationStatus) {
    return this.reservationsService.findAll(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('expire')
  expireOverdue() {
    return this.reservationsService.expireOverdueReservations();
  }
}
