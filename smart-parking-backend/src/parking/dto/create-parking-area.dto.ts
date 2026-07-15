import { IsNotEmpty, IsString } from 'class-validator';

export class CreateParkingAreaDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;
}
