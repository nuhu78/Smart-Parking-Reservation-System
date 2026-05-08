import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ParkingArea } from '../parking/parking-area.entity';
import { Reservation } from '../reservations/reservation.entity';

export enum SlotStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
}

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  slotNumber!: string;

 @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.AVAILABLE })
  status!: SlotStatus;

  @ManyToOne(() => ParkingArea, (parkingArea) => parkingArea.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parkingAreaId' })
  parkingArea!: ParkingArea;

  @OneToMany(() => Reservation, (reservation) => reservation.slot)
  reservations!: Reservation[];
}