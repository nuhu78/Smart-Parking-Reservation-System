import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot, SlotStatus } from './slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private slotsRepository: Repository<Slot>,
  ) {}

  async create(createSlotDto: CreateSlotDto): Promise<Slot> {
    const slot = this.slotsRepository.create({
      slotNumber: createSlotDto.slotNumber,
      parkingArea: { id: createSlotDto.parkingAreaId }, // Connect to the relationship
    });
    return this.slotsRepository.save(slot);
  }

  async findAvailable(): Promise<Slot[]> {
    return this.slotsRepository.find({
      where: { status: SlotStatus.AVAILABLE },
      relations: ['parkingArea'],
    });
  }
}