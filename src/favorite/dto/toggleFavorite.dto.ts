import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ToggleFavoriteDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  wordId?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  sentenceId?: number;
}
