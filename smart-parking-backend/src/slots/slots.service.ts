import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot, SlotStatus } from './slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { ParkingArea } from '../parking/parking-area.entity';
import { Reservation, ReservationStatus } from '../reservations/reservation.entity';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private slotsRepository: Repository<Slot>,

    @InjectRepository(ParkingArea)
    private parkingAreasRepository: Repository<ParkingArea>,

    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
  ) {}

  async create(createSlotDto: CreateSlotDto): Promise<Slot> {
    const parkingArea = await this.parkingAreasRepository.findOneBy({
      id: createSlotDto.parkingAreaId,
    });

    if (!parkingArea) {
      throw new NotFoundException(`Parking area ${createSlotDto.parkingAreaId} not found`);
    }

    const slot = this.slotsRepository.create({
      slotNumber: createSlotDto.slotNumber,
      parkingArea,
    });
    return this.slotsRepository.save(slot);
  }

  async findAll(): Promise<Slot[]> {
    return this.slotsRepository.find({
      relations: ['parkingArea'],
    });
  }
  async update(id: number, updateData: any) {
    // If admin is setting the slot to AVAILABLE, cancel any active reservation
    if (updateData.status === SlotStatus.AVAILABLE) {
      const reservation = await this.reservationsRepository.findOne({
        where: { slot: { id }, status: ReservationStatus.ACTIVE },
      });

      if (reservation) {
        reservation.status = ReservationStatus.CANCELLED;
        await this.reservationsRepository.save(reservation);
      }
    }

    await this.slotsRepository.update(id, updateData);
    return this.slotsRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const slot = await this.slotsRepository.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');
    
    await this.slotsRepository.remove(slot);
    return { message: 'Slot deleted successfully' };
  }
}