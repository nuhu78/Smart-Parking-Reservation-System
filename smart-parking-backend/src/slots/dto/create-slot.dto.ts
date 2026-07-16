import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

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

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pricePerHour?: number;
}
