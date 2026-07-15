import { IsOptional, IsString } from 'class-validator';

export class UpdateParkingAreaDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
