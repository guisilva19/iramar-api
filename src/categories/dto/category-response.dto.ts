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
    example: 1,
    description: 'Posição de exibição da categoria',
  })
  sortOrder: number;

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
