import { PartialType } from '@nestjs/swagger';
import { CreateHighlightDto } from './create-highlight.dto';

/**
 * DTO para atualização de highlights
 * @description Herda todas as propriedades de CreateHighlightDto, mas todas são opcionais
 */
export class UpdateHighlightDto extends PartialType(CreateHighlightDto) {} 