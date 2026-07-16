import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSlotDto {
  @IsString()
  @IsNotEmpty()
  slotNumber!: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  parkingAreaId!: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  floor?: number;
}
