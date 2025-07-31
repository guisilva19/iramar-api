import {
  IsString,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de produtos
 * @example
 * {
 *   "name": "Arroz Integral Tipo 1",
 *   "description": "Arroz integral tipo 1, pacote de 1kg. Rico em fibras e nutrientes essenciais.",
 *   "price": 8.99,
 *   "categoryId": "123e4567-e89b-12d3-a456-426614174000",
 *   "isActive": true
 * }
 */
export class CreateProductDto {
  @ApiProperty({
    example: 'Arroz Integral Tipo 1',
    description: 'Nome do produto',
    default: 'Arroz Integral Tipo 1',
    minLength: 3,
    maxLength: 100,
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example:
      'Arroz integral tipo 1, pacote de 1kg. Rico em fibras e nutrientes essenciais.',
    description:
      'Descrição detalhada do produto incluindo características, benefícios e informações nutricionais',
    default:
      'Arroz integral tipo 1, pacote de 1kg. Rico em fibras e nutrientes essenciais.',
    minLength: 10,
    maxLength: 500,
    type: String,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 8.99,
    description: 'Preço do produto em reais (R$)',
    default: 8.99,
    minimum: 0.01,
    required: true,
    type: Number,
    format: 'float',
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'ID da categoria do produto (ex: Alimentos, Bebidas, Higiene, etc). Deve ser um UUID válido de uma categoria existente.',
    default: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    format: 'uuid',
    type: String,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL da imagem do produto',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    example: true,
    description: 'Status ativo do produto. Produtos inativos não aparecem no e-commerce.',
    default: true,
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
