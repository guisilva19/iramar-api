import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PRICE_LOW = 'price_low',
  PRICE_HIGH = 'price_high',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  RANDOM = 'random',
}

export class EcommerceProductsDto {
  @ApiPropertyOptional({
    description: 'ID da categoria para filtrar produtos (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Termo de busca para filtrar produtos por nome ou descrição (pode ser vazio)',
    example: 'arroz',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Ordenação dos produtos',
    enum: SortOrder,
    example: SortOrder.RANDOM,
    default: SortOrder.RANDOM,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortBy?: SortOrder = SortOrder.RANDOM;

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
    description: 'Número de itens por página (máximo 50 para e-commerce)',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}

export class FeaturedProductsDto {
  @ApiPropertyOptional({
    description: 'ID da categoria para filtrar produtos em destaque (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Número de produtos em destaque a retornar',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
} 