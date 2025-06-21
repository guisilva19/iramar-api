import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID do endereço de entrega',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  addressId: string;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Observações do pedido',
    required: false,
    example: 'Entregar após 18h'
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 