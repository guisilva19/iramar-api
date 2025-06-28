import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({
    description: 'Quantidade de produtos pendentes',
    example: 3,
  })
  pendingProducts: number;

  @ApiProperty({
    description: 'Quantidade total de produtos',
    example: 150,
  })
  totalProducts: number;

  @ApiProperty({
    description: 'Quantidade de pedidos do dia atual',
    example: 12,
  })
  todayOrders: number;
} 