import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FindAllOrdersDto } from './dto/find-all-orders.dto';
import { OrderResponseDto, OrderItemResponseDto, OrderAddressResponseDto } from './dto/order-response.dto';
import { PaginatedOrdersResponseDto, AdminPaginatedOrdersResponseDto } from './dto/paginated-orders-response.dto';
import { OrderStatus } from '@prisma/client';
import { WhatsAppService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private whatsappService: WhatsAppService,
  ) {}

  async createOrder(clientId: string, createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const { addressId, paymentMethod, notes } = createOrderDto;

    // Verify address exists and belongs to user
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        clientId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Get user's cart
    const cart = await this.cartService.getCart(clientId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Create order
    const order = await this.prisma.order.create({
      data: {
        clientId,
        addressId,
        paymentMethod,
        total: cart.total,
        notes,
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
        client: true,
      },
    });

    // Clear cart after order creation
    await this.cartService.clearCart(clientId);
    await this.whatsappService.sendOrderToClient({ phone: order.client.phone, orderId: order.id });

    if (process.env.NUMBER_DELIVERY_ONE) {
      console.log('Enviando mensagem para o entregador1');
      await this.whatsappService.sendOrderToDelivery({ phone: process.env.NUMBER_DELIVERY_ONE as string, orderId: order.id });
    }
    if (process.env.NUMBER_DELIVERY_TWO) {
      console.log('Enviando mensagem para o entregador2');
      await this.whatsappService.sendOrderToDelivery({ phone: process.env.NUMBER_DELIVERY_TWO as string, orderId: order.id });
    }
    if (process.env.NUMBER_DELIVERY_THREE) {
      console.log('Enviando mensagem para o entregador3');
      await this.whatsappService.sendOrderToDelivery({ phone: process.env.NUMBER_DELIVERY_THREE as string, orderId: order.id });
    }

    return this.formatOrderResponse(order);
  }

  async findAllOrders(clientId: string, query: FindAllOrdersDto): Promise<PaginatedOrdersResponseDto> {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      clientId,
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

  async findOrderById(clientId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        clientId,
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
    clientId: string,
    orderId: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const { status } = updateDto;

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        clientId,
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

  async cancelOrder(clientId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        clientId,
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

  async cancelOrderClient(clientId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        clientId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
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
          address: {
            select: {
              id: true,
              lat: true,
              lng: true,
              clientId: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
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
      clientId: order.clientId,
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