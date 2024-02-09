import { PartialType } from '@nestjs/swagger';
import { CreatePronunciationAssessmentDto } from './create-pronunciation-assessment.dto';

export class UpdatePronunciationAssessmentDto extends PartialType(CreatePronunciationAssessmentDto) {}
