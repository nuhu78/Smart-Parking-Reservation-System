import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './reservation.entity';
import { Slot, SlotStatus } from '../slots/slot.entity';
import { MailService } from '../mail/mail.service'; // 1. We import the MailService here

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(Slot)
    private slotsRepository: Repository<Slot>,
    private mailService: MailService, // 2. We inject the MailService into the constructor
  ) {}

  // 3. Notice we accept the full 'user' object now, not just the ID!
  async reserveSlot(user: any, slotId: number): Promise<Reservation> {
    
    // Step A: Find the slot
    const slot = await this.slotsRepository.findOne({ where: { id: slotId } });

    if (!slot) {
      throw new NotFoundException('Parking slot not found');
    }

    // Step B: Check if it is available
    if (slot.status === SlotStatus.OCCUPIED) {
      throw new BadRequestException('This slot is already occupied');
    }

    // Step C: Create the reservation (we use user.id to link it in the database)
    const reservation = this.reservationsRepository.create({
      user: { id: user.id }, 
      slot: { id: slotId },
      status: ReservationStatus.ACTIVE,
    });

    await this.reservationsRepository.save(reservation);

    // Step D: Update the slot status to OCCUPIED
    slot.status = SlotStatus.OCCUPIED;
    await this.slotsRepository.save(slot);

    // 🔥 Step E: SEND CONFIRMATION EMAIL 🔥
    // We can pull the email and fullName directly from the user object!
    await this.mailService.sendReservationConfirmation(
      user.email,
      user.fullName,
      slot.slotNumber,
      reservation.bookingTime,
    );

    return reservation;
  }

  // (This method stays exactly the same)
  async findMyReservations(userId: number): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: { user: { id: userId } },
      relations: ['slot', 'slot.parkingArea'], 
    });
  }

  // 4. Again, we accept the full 'user' object here so we know who to email
  async cancelReservation(reservationId: number, user: any): Promise<{ message: string }> {
    
    // Step A: Find the active reservation
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId, user: { id: user.id }, status: ReservationStatus.ACTIVE },
      relations: ['slot'],
    });

    if (!reservation) {
      throw new NotFoundException('Active reservation not found');
    }

    // Step B: Change reservation status to CANCELLED
    reservation.status = ReservationStatus.CANCELLED;
    await this.reservationsRepository.save(reservation);

    // Step C: Free up the parking slot
    const slot = reservation.slot;
    slot.status = SlotStatus.AVAILABLE;
    await this.slotsRepository.save(slot);

    // 🔥 Step D: SEND CANCELLATION EMAIL 🔥
    await this.mailService.sendReservationCancelled(
      user.email,
      user.fullName,
      slot.slotNumber,
    );

    return { message: 'Reservation successfully cancelled' };
  }
}