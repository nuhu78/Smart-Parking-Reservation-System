import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSlotDto {
  @IsString()
  @IsNotEmpty()
  slotNumber!: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  parkingAreaId!: number; // Assuming you changed IDs to numbers in Part 3!
}