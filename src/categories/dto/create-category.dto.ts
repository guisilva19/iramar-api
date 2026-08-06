import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentos', description: 'Nome da categoria' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Posição de exibição da categoria. Se omitido, a categoria é adicionada ao final.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  sortOrder?: number;
} 