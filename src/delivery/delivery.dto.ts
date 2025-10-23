import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeliveryTaxDto {
  @ApiProperty({
    example: 5.50,
    description: 'Taxa de entrega em reais (R$). Pode ser 0 para entrega gratuita.',
    minimum: 0,
    required: true,
    type: Number,
    format: 'float',
  })
  @IsNumber()
  @Min(0)
  tax: number;
}