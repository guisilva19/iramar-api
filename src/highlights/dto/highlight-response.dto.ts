import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para resposta de highlights
 * @example
 * {
 *   "id": "123e4567-e89b-12d3-a456-426614174000",
 *   "image": "https://example.com/highlight-image.jpg",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export class HighlightResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único do highlight',
    type: String,
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'https://example.com/highlight-image.jpg',
    description: 'URL da imagem do highlight',
    type: String,
  })
  image: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de criação do highlight',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data da última atualização do highlight',
    type: Date,
  })
  updatedAt: Date;
} 