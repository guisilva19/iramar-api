import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllProductsDto {
  @ApiPropertyOptional({
    description: 'ID da categoria para filtrar produtos',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Termo de busca para filtrar produtos por nome ou descrição',
    example: 'arroz',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Número da página (começa em 1)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Número de itens por página (máximo 20)',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 10;
} 