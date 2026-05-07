import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ParkingArea } from '../parking/parking-area.entity';
import { Reservation } from '../reservations/reservation.entity';

export enum SlotStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
}

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  slotNumber!: string;

  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.AVAILABLE })
  status!: SlotStatus;

  // Many Slots -> One Parking Area
  @ManyToOne(() => ParkingArea, (parkingArea) => parkingArea.slots, { onDelete: 'CASCADE' })
  parkingArea!: ParkingArea;

  @OneToMany(() => Reservation, (reservation) => reservation.slot)
  reservations!: Reservation[];
}