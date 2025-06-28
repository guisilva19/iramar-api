import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    // Data de hoje (início e fim do dia)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Executar todas as consultas em paralelo para melhor performance
    const [pendingProducts, totalProducts, todayOrders] = await Promise.all([
      // Produtos pendentes (produtos que não têm imagem)
      this.prisma.product.count({
        where: {
          image: null,
        },
      }),
      
      // Total de produtos
      this.prisma.product.count(),
      
      // Pedidos do dia atual
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);

    return {
      pendingProducts,
      totalProducts,
      todayOrders,
    };
  }
} 