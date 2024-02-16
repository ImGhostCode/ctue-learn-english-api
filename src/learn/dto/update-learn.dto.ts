import { PartialType } from '@nestjs/swagger';
import { CreateLearnDto } from './create-learn.dto';

export class UpdateLearnDto extends PartialType(CreateLearnDto) {}
