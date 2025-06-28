import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FindAllOrdersDto } from './dto/find-all-orders.dto';
import { OrderResponseDto, OrderItemResponseDto, OrderAddressResponseDto } from './dto/order-response.dto';
import { PaginatedOrdersResponseDto, AdminPaginatedOrdersResponseDto } from './dto/paginated-orders-response.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { addressId, paymentMethod } = createOrderDto;

    // Verify address exists and belongs to user
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Get user's cart
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        addressId,
        paymentMethod,
        total: cart.total,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.productPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    // Clear cart after order creation
    await this.cartService.clearCart(userId);

    return this.formatOrderResponse(order);
  }

  async findAllOrders(userId: string, query: FindAllOrdersDto): Promise<PaginatedOrdersResponseDto> {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders.map(order => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOrderById(userId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.formatOrderResponse(order);
  }

  async updateOrderStatus(
    userId: string,
    orderId: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const { status } = updateDto;

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, status)) {
      throw new BadRequestException('Invalid status transition');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  async cancelOrder(userId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDENTE) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELADO },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  // Admin methods
  async findAllOrdersAdmin(query: FindAllOrdersDto): Promise<AdminPaginatedOrdersResponseDto> {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
    };

    const [orders, total, stats] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
      this.getOrderStats(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders.map(order => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages,
      stats,
    };
  }

  private async getOrderStats() {
    const stats = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const statsMap = {
      PENDENTE: 0,
      EM_ANDAMENTO: 0,
      ENVIADO: 0,
      ENTREGUE: 0,
      CANCELADO: 0,
    };

    stats.forEach(stat => {
      statsMap[stat.status] = stat._count.status;
    });

    return statsMap;
  }

  async updateOrderStatusAdmin(
    orderId: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const { status } = updateDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  private formatOrderResponse(order: any): OrderResponseDto {
    const items: OrderItemResponseDto[] = order.items.map(item => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    const address: OrderAddressResponseDto = {
      id: order.address.id,
      street: order.address.street,
      number: order.address.number,
      complement: order.address.complement,
      neighborhood: order.address.neighborhood,
      city: order.address.city,
      state: order.address.state,
      zipCode: order.address.zipCode,
    };

    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: order.total,
      items,
      address,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDENTE]: [OrderStatus.EM_ANDAMENTO, OrderStatus.CANCELADO],
      [OrderStatus.EM_ANDAMENTO]: [OrderStatus.ENVIADO, OrderStatus.CANCELADO],
      [OrderStatus.ENVIADO]: [OrderStatus.ENTREGUE],
      [OrderStatus.ENTREGUE]: [],
      [OrderStatus.CANCELADO]: [],
    };

    return validTransitions[currentStatus].includes(newStatus);
  }
} 