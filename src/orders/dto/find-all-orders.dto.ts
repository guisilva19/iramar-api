import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class FindAllOrdersDto {
  @ApiPropertyOptional({
    description: 'Número da página',
    minimum: 1,
    default: 1,
    example: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Itens por página',
    minimum: 1,
    default: 10,
    example: 10
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: OrderStatus,
    example: OrderStatus.PENDENTE
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
} 