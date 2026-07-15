import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Slot } from '../slots/slot.entity';

export enum ReservationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'timestamp' })
  startTime!: Date;

  @Column({ type: 'timestamp' })
  endTime!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status!: ReservationStatus;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Slot, (slot) => slot.reservations, { onDelete: 'CASCADE' })
  slot!: Slot;
}
