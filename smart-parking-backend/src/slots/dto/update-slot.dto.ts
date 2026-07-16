import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, IsInt, IsNumber } from 'class-validator';
import { SlotStatus } from '../slot.entity';

export class UpdateSlotDto {
  @IsString()
  @IsOptional()
  slotNumber?: string;

  @IsEnum(SlotStatus)
  @IsOptional()
  status?: SlotStatus;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  parkingAreaId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  floor?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pricePerHour?: number;
}
