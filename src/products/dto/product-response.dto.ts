import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID da categoria',
  })
  id: string;

  @ApiProperty({
    example: 'Alimentos',
    description: 'Nome da categoria',
  })
  name: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de criação da categoria',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data da última atualização da categoria',
  })
  updatedAt: Date;
}

export class ProductResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do produto',
  })
  id: string;

  @ApiProperty({
    example: 'Arroz Integral Tipo 1',
    description: 'Nome do produto',
  })
  name: string;

  @ApiProperty({
    example: 'Arroz integral tipo 1, pacote de 1kg. Rico em fibras e nutrientes essenciais.',
    description: 'Descrição do produto',
  })
  description: string;

  @ApiProperty({
    example: 8.99,
    description: 'Preço do produto',
  })
  price: number;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL da imagem do produto',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID da categoria do produto',
    nullable: true,
  })
  categoryId: string | null;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de criação do produto',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data da última atualização do produto',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Categoria do produto',
    type: CategoryResponseDto,
    nullable: true,
  })
  category: CategoryResponseDto | null;
} 