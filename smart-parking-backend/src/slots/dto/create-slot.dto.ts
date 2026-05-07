import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSlotDto {
  @IsString()
  @IsNotEmpty()
  slotNumber!: string;

  @IsNumber()
  @IsNotEmpty()
  parkingAreaId!: number; // Assuming you changed IDs to numbers in Part 3!
}