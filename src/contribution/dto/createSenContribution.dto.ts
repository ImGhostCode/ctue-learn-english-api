import {
    IsArray,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { CONSTANTS_MAX } from 'src/global';
import { ApiProperty } from '@nestjs/swagger';

class Content {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    typeId?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    @Transform((params: TransformFnParams) => {
        return params.value.map((item) => parseInt(item, 10));
    })
    @IsNumber({}, { each: true })
    topicId?: number[];

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(CONSTANTS_MAX.SENTENCE_CONTENT_LEN)
    content?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(CONSTANTS_MAX.SENTENCE_MEAN_LEN)
    meaning?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @MaxLength(CONSTANTS_MAX.SENTENCE_NOTE_LEN)
    note?: string;
}

export class CreateSenContributionDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmptyObject()
    @IsObject()
    // @IsNotEmpty()
    @ValidateNested()
    @ApiProperty()
    @Type(() => Content)
    content: Content;
}