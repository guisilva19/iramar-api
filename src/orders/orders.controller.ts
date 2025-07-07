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
import { PaginatedOrdersResponseDto, AdminPaginatedOrdersResponseDto } from './dto/paginated-orders-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Pedidos')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Customer routes (sem autenticação)
  @Post()
  @ApiOperation({ summary: 'Criar novo pedido' })
  @ApiQuery({ name: 'clientId', required: true, type: String, description: 'ID do cliente' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  @ApiResponse({ status: 400, description: 'Carrinho vazio' })
  async createOrder(
    @Query('clientId') clientId: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(clientId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos do usuário' })
  @ApiQuery({ name: 'clientId', required: true, type: String, description: 'ID do cliente' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDENTE', 'EM_ANDAMENTO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'] })
  @ApiResponse({ status: 200, description: 'Pedidos listados com sucesso', type: PaginatedOrdersResponseDto })
  async findAllOrders(
    @Query('clientId') clientId: string,
    @Query() query: FindAllOrdersDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.ordersService.findAllOrders(clientId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiQuery({ name: 'clientId', required: true, type: String, description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Pedido obtido com sucesso', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async findOrderById(
    @Param('id') id: string,
    @Query('clientId') clientId: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOrderById(clientId, id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os pedidos (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDENTE', 'EM_ANDAMENTO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'] })
  @ApiResponse({ status: 200, description: 'Pedidos listados com sucesso', type: AdminPaginatedOrdersResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas ADMIN pode acessar)' })
  async findAllOrdersAdmin(
    @Query() query: FindAllOrdersDto,
  ): Promise<AdminPaginatedOrdersResponseDto> {
    return this.ordersService.findAllOrdersAdmin(query);
  }

  @Put('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
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