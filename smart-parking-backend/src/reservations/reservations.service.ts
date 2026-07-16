import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Reservation, ReservationStatus } from './reservation.entity';
import { Slot, SlotStatus } from '../slots/slot.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(Slot)
    private slotsRepository: Repository<Slot>,
    private mailService: MailService,
  ) {}

  async reserveSlot(
    user: any,
    slotId: number,
    startTime: Date,
    endTime: Date,
    vehicleNumber: string,
    phoneNumber?: string,
    vehicleType?: string,
  ): Promise<Reservation> {
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    const now = new Date();
    if (startTime < now) {
      throw new BadRequestException('Start time cannot be in the past');
    }

    const maxDuration = 4 * 60 * 60 * 1000;
    if (endTime.getTime() - startTime.getTime() > maxDuration) {
      throw new BadRequestException(
        'Reservation duration cannot exceed 4 hours',
      );
    }

    const activeCount = await this.reservationsRepository.count({
      where: { user: { id: user.id }, status: ReservationStatus.ACTIVE },
    });
    if (activeCount >= 1) {
      throw new BadRequestException('You already have an active reservation');
    }

    const slot = await this.slotsRepository.findOne({
      where: { id: slotId },
      relations: ['parkingArea'],
    });

    if (!slot) {
      throw new NotFoundException('Parking slot not found');
    }

    if (slot.status === SlotStatus.OCCUPIED) {
      throw new BadRequestException('This slot is already occupied');
    }

    const overlapping = await this.reservationsRepository.findOne({
      where: {
        slot: { id: slotId },
        status: ReservationStatus.ACTIVE,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });
    if (overlapping) {
      throw new BadRequestException(
        'Slot is already booked for the requested time period',
      );
    }

    const expiresAt = new Date(startTime.getTime() + 30 * 60 * 1000);

    const reservation = this.reservationsRepository.create({
      user: { id: user.id },
      slot: { id: slotId },
      startTime,
      endTime,
      expiresAt,
      status: ReservationStatus.ACTIVE,
      vehicleNumber,
      phoneNumber: phoneNumber || null,
      vehicleType: (vehicleType as any) || 'four_wheeler',
    });

    await this.reservationsRepository.save(reservation);

    await this.slotsRepository.update(slotId, { status: SlotStatus.OCCUPIED });

    try {
      await this.mailService.sendReservationConfirmation(
        user.email,
        user.fullName,
        slot.slotNumber,
        slot.parkingArea.name,
        startTime,
        endTime,
      );
    } catch (err) {
      console.error('Failed to send confirmation email', err);
    }

    return reservation;
  }

  async findMyReservations(userId: number): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: { user: { id: userId } },
      relations: ['slot', 'slot.parkingArea'],
      order: { startTime: 'DESC' },
    });
  }

  async cancelReservation(
    reservationId: number,
    user: any,
  ): Promise<{ message: string }> {
    const reservation = await this.reservationsRepository.findOne({
      where: {
        id: reservationId,
        user: { id: user.id },
        status: ReservationStatus.ACTIVE,
      },
      relations: ['slot'],
    });

    if (!reservation) {
      throw new NotFoundException('Active reservation not found');
    }

    if (reservation.startTime <= new Date()) {
      throw new BadRequestException(
        'Cannot cancel a reservation that has already started',
      );
    }

    reservation.status = ReservationStatus.CANCELLED;
    await this.reservationsRepository.save(reservation);

    await this.slotsRepository.update(reservation.slot.id, {
      status: SlotStatus.AVAILABLE,
    });

    try {
      await this.mailService.sendReservationCancelled(
        user.email,
        user.fullName,
        reservation.slot.slotNumber,
      );
    } catch (err) {
      console.error('Failed to send cancellation email', err);
    }

    return { message: 'Reservation successfully cancelled' };
  }

  async cancelReservationBySlotId(
    slotId: number,
  ): Promise<{ message: string }> {
    const reservation = await this.reservationsRepository.findOne({
      where: { slot: { id: slotId }, status: ReservationStatus.ACTIVE },
      relations: ['slot', 'user'],
    });

    if (reservation) {
      reservation.status = ReservationStatus.CANCELLED;
      await this.reservationsRepository.save(reservation);

      try {
        await this.mailService.sendReservationCancelled(
          reservation.user.email,
          reservation.user.fullName,
          reservation.slot.slotNumber,
        );
      } catch (err) {
        console.error('Failed to send cancellation email', err);
      }
    }

    return { message: 'Reservation cancelled and slot freed' };
  }

  async findAll(status?: ReservationStatus): Promise<Reservation[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.reservationsRepository.find({
      where,
      relations: ['user', 'slot', 'slot.parkingArea'],
      order: { startTime: 'DESC' },
    });
  }

  async expireOverdueReservations(): Promise<{
    completed: number;
    expired: number;
  }> {
    const now = new Date();

    const completed = await this.reservationsRepository.find({
      where: {
        status: ReservationStatus.ACTIVE,
        endTime: LessThan(now),
      },
      relations: ['slot'],
    });

    for (const reservation of completed) {
      reservation.status = ReservationStatus.COMPLETED;
      await this.reservationsRepository.save(reservation);
      await this.slotsRepository.update(reservation.slot.id, {
        status: SlotStatus.AVAILABLE,
      });
    }

    const noShows = await this.reservationsRepository.find({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: LessThan(now),
      },
      relations: ['slot'],
    });

    for (const reservation of noShows) {
      reservation.status = ReservationStatus.EXPIRED;
      await this.reservationsRepository.save(reservation);
      await this.slotsRepository.update(reservation.slot.id, {
        status: SlotStatus.AVAILABLE,
      });
    }

    return { completed: completed.length, expired: noShows.length };
  }
}
