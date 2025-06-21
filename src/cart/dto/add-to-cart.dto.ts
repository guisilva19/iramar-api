import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    description: 'ID do produto',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    minimum: 1,
    example: 2
  })
  @IsInt()
  @Min(1)
  quantity: number;
} 