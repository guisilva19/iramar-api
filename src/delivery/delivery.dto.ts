import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeliveryTaxDto {
  @ApiProperty({
    example: 5.50,
    description: 'Taxa de entrega em reais (R$)',
    minimum: 0.01,
    required: true,
    type: Number,
    format: 'float',
  })
  @IsNumber()
  @IsPositive()
  tax: number;
}