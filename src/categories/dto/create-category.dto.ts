import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentos', description: 'Nome da categoria' })
  name: string;
} 