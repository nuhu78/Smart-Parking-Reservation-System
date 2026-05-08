import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './reservation.entity';
import { Slot, SlotStatus } from '../slots/slot.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(Slot)
    private slotsRepository: Repository<Slot>,
  ) {}

  async reserveSlot(userId: number, slotId: number): Promise<Reservation> {
    // 1. Find the slot
    const slot = await this.slotsRepository.findOne({ where: { id: slotId } });

    if (!slot) {
      throw new NotFoundException('Parking slot not found');
    }

    // 2. Check if it is available
    if (slot.status === SlotStatus.OCCUPIED) {
      throw new BadRequestException('This slot is already occupied');
    }

    // 3. Create the reservation
    const reservation = this.reservationsRepository.create({
      user: { id: userId },
      slot: { id: slotId },
      status: ReservationStatus.ACTIVE,
    });

    await this.reservationsRepository.save(reservation);

    // 4. Update the slot status to OCCUPIED
    slot.status = SlotStatus.OCCUPIED;
    await this.slotsRepository.save(slot);

    return reservation;
  }

  async findMyReservations(userId: number): Promise<Reservation[]> {
    // Find all reservations belonging to this specific user
    return this.reservationsRepository.find({
      where: { user: { id: userId } },
      relations: ['slot', 'slot.parkingArea'], // Include slot and area details
    });
  }

  async cancelReservation(reservationId: number, userId: number): Promise<{ message: string }> {
    // 1. Find the active reservation that belongs to this user
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId, user: { id: userId }, status: ReservationStatus.ACTIVE },
      relations: ['slot'],
    });

    if (!reservation) {
      throw new NotFoundException('Active reservation not found');
    }

    // 2. Change reservation status to CANCELLED
    reservation.status = ReservationStatus.CANCELLED;
    await this.reservationsRepository.save(reservation);

    // 3. Free up the parking slot!
    const slot = reservation.slot;
    slot.status = SlotStatus.AVAILABLE;
    await this.slotsRepository.save(slot);

    return { message: 'Reservation successfully cancelled' };
  }
}