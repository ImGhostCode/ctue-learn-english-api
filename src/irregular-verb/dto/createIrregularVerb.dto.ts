import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CONSTANTS_MAX } from '../../global';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIrregularVerbDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
  v1: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
  v2: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
  v3: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CONSTANTS_MAX.WORD_MEAN_LEN)
  mean: string;
}
