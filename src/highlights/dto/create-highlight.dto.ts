import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de highlights
 * @example
 * {
 *   "image": "https://example.com/highlight-image.jpg"
 * }
 */
export class CreateHighlightDto {
  @ApiProperty({
    example: 'https://example.com/highlight-image.jpg',
    description: 'URL da imagem do highlight',
    default: 'https://example.com/highlight-image.jpg',
    required: true,
    type: String,
    format: 'uri',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image: string;
} 