import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Slot } from '../slots/slot.entity';

export enum ReservationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @CreateDateColumn()
  bookingTime!: Date;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.ACTIVE })
  status!: ReservationStatus;

  // Many Reservations -> One User
  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  user!: User;

  // Many Reservations -> One Slot
  @ManyToOne(() => Slot, (slot) => slot.reservations, { onDelete: 'CASCADE' })
  slot!: Slot;
}