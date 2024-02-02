import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CONSTANTS_MAX } from '../../global';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIrregularVerbDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
  v1?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
  v2?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(CONSTANTS_MAX.WORD_CONTENT_LEN)
  v3?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(CONSTANTS_MAX.WORD_MEAN_LEN)
  meaning?: string;
}
