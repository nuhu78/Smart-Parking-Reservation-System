import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Slot } from '../slots/slot.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Slot, (slot) => slot.reservations, { onDelete: 'CASCADE' })
  slot: Slot;
}
