import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Nova quantidade do item',
    minimum: 1,
    example: 3
  })
  @IsInt()
  @Min(1)
  quantity: number;
} 