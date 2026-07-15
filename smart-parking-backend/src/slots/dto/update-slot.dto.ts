import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SlotStatus } from '../slot.entity';

export class UpdateSlotDto {
  @IsString()
  @IsOptional()
  slotNumber?: string;

  @IsEnum(SlotStatus)
  @IsOptional()
  status?: SlotStatus;
}
