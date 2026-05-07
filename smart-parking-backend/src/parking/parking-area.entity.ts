
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Slot } from '../slots/slot.entity';

@Entity('parking_areas')
export class ParkingArea {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column()
  location!: string;

  // One Parking Area -> Many Slots
  @OneToMany(() => Slot, (slot) => slot.parkingArea)
  slots!: Slot[];
}