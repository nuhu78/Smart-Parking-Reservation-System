import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingArea } from './parking-area.entity';
import { CreateParkingAreaDto } from './dto/create-parking-area.dto';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(ParkingArea)
    private parkingRepository: Repository<ParkingArea>,
  ) {}

  async create(createParkingAreaDto: CreateParkingAreaDto): Promise<ParkingArea> {
    const parkingArea = this.parkingRepository.create(createParkingAreaDto);
    return this.parkingRepository.save(parkingArea);
  }

  async findAll(): Promise<ParkingArea[]> {
    return this.parkingRepository.find({ relations: ['slots'] });
  }
}