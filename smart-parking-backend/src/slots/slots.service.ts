import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot, SlotStatus } from './slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { ParkingArea } from '../parking/parking-area.entity';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private slotsRepository: Repository<Slot>,

    @InjectRepository(ParkingArea)
    private parkingAreasRepository: Repository<ParkingArea>,
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

  async findAvailable(): Promise<Slot[]> {
    return this.slotsRepository.find({
      where: { status: SlotStatus.AVAILABLE },
      relations: ['parkingArea'],
    });
  }
  async update(id: number, updateData: any) {
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