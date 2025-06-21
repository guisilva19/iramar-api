import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Carrinho')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER, Role.ADMIN)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obter carrinho do usuário' })
  @ApiResponse({ status: 200, description: 'Carrinho obtido com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  async getCart(@Request() req): Promise<CartResponseDto> {
    return this.cartService.getCart(req.user.id);
  }

  @Post('add')
  @ApiOperation({ summary: 'Adicionar produto ao carrinho' })
  @ApiResponse({ status: 201, description: 'Produto adicionado com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async addToCart(
    @Request() req,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Atualizar quantidade de item no carrinho' })
  @ApiParam({ name: 'itemId', description: 'ID do item do carrinho' })
  @ApiResponse({ status: 200, description: 'Item atualizado com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Item do carrinho não encontrado' })
  async updateCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItem(req.user.id, itemId, updateDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  @ApiParam({ name: 'itemId', description: 'ID do item do carrinho' })
  @ApiResponse({ status: 200, description: 'Item removido com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Item do carrinho não encontrado' })
  async removeFromCart(
    @Request() req,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeFromCart(req.user.id, itemId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Limpar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho limpo com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado' })
  async clearCart(@Request() req): Promise<CartResponseDto> {
    return this.cartService.clearCart(req.user.id);
  }
} 