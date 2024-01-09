import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSpecializationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
