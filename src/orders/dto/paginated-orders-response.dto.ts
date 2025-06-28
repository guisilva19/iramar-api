import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from './order-response.dto';

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  orders: OrderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class OrderStatusStatsDto {
  @ApiProperty()
  PENDENTE: number;

  @ApiProperty()
  EM_ANDAMENTO: number;

  @ApiProperty()
  ENVIADO: number;

  @ApiProperty()
  ENTREGUE: number;

  @ApiProperty()
  CANCELADO: number;
}

export class AdminPaginatedOrdersResponseDto extends PaginatedOrdersResponseDto {
  @ApiProperty({ type: OrderStatusStatsDto })
  stats: OrderStatusStatsDto;
} 