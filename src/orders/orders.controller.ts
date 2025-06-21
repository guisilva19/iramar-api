import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FindAllOrdersDto } from './dto/find-all-orders.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { PaginatedOrdersResponseDto } from './dto/paginated-orders-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Pedidos')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Customer routes (agora ADMIN também pode acessar)
  @Post()
  @Roles(Role.CUSTOMER, Role.ADMIN)
  @ApiOperation({ summary: 'Criar novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  @ApiResponse({ status: 400, description: 'Carrinho vazio' })
  async createOrder(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Get()
  @Roles(Role.CUSTOMER, Role.ADMIN)
  @ApiOperation({ summary: 'Listar pedidos do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] })
  @ApiResponse({ status: 200, description: 'Pedidos listados com sucesso', type: PaginatedOrdersResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  async findAllOrders(
    @Request() req,
    @Query() query: FindAllOrdersDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.ordersService.findAllOrders(req.user.id, query);
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.ADMIN)
  @ApiOperation({ summary: 'Obter pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido obtido com sucesso', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async findOrderById(
    @Request() req,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOrderById(req.user.id, id);
  }

  @Put(':id/status')
  @Roles(Role.CUSTOMER, Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @ApiResponse({ status: 400, description: 'Transição de status inválida' })
  async updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateOrderStatus(req.user.id, id, updateDto);
  }

  @Put(':id/cancel')
  @Roles(Role.CUSTOMER, Role.ADMIN)
  @ApiOperation({ summary: 'Cancelar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido cancelado com sucesso', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @ApiResponse({ status: 400, description: 'Pedido não pode ser cancelado' })
  async cancelOrder(
    @Request() req,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.cancelOrder(req.user.id, id);
  }

  // Admin routes (mantidas separadas para funcionalidades específicas de admin)
  @Get('admin/all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar todos os pedidos (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] })
  @ApiResponse({ status: 200, description: 'Pedidos listados com sucesso', type: PaginatedOrdersResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas ADMIN pode acessar)' })
  async findAllOrdersAdmin(
    @Query() query: FindAllOrdersDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.ordersService.findAllOrdersAdmin(query);
  }

  @Put('admin/:id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar status do pedido (Admin)' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas ADMIN pode acessar)' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async updateOrderStatusAdmin(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateOrderStatusAdmin(id, updateDto);
  }
} 