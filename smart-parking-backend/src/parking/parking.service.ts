import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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

 async findAll(searchTerm?: string): Promise<ParkingArea[]> {
    if (searchTerm) {
      // If they typed something, filter the database
      return this.parkingRepository.find({
        where: { name: ILike(`%${searchTerm}%`) },
        relations: ['slots']
      });
    }
    
    // If no search term, return everything normally
    return this.parkingRepository.find({ relations: ['slots'] });
  }
  async update(id: number, updateData: any) {
    await this.parkingRepository.update(id, updateData);
    return this.parkingRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const area = await this.parkingRepository.findOne({ where: { id } });
    if (!area) throw new NotFoundException('Parking area not found');
    
    await this.parkingRepository.remove(area);
    return { message: 'Parking area deleted successfully' };
  }
}