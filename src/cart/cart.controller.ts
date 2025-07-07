import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@ApiTags('Carrinho')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':clientId')
  @ApiOperation({ summary: 'Obter carrinho do cliente' })
  @ApiParam({ name: 'clientId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Carrinho obtido com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async getCart(@Param('clientId') clientId: string): Promise<CartResponseDto> {
    return this.cartService.getCart(clientId);
  }

  @Post(':clientId/add')
  @ApiOperation({ summary: 'Adicionar produto ao carrinho' })
  @ApiParam({ name: 'clientId', description: 'ID do cliente' })
  @ApiResponse({ status: 201, description: 'Produto adicionado com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 404, description: 'Produto ou cliente não encontrado' })
  async addToCart(
    @Param('clientId') clientId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addToCart(clientId, addToCartDto);
  }

  @Put(':clientId/items/:itemId')
  @ApiOperation({ summary: 'Atualizar quantidade de item no carrinho' })
  @ApiParam({ name: 'clientId', description: 'ID do cliente' })
  @ApiParam({ name: 'itemId', description: 'ID do item do carrinho' })
  @ApiResponse({ status: 200, description: 'Item atualizado com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 404, description: 'Item do carrinho ou cliente não encontrado' })
  async updateCartItem(
    @Param('clientId') clientId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItem(clientId, itemId, updateDto);
  }

  @Delete(':clientId/items/:itemId')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  @ApiParam({ name: 'clientId', description: 'ID do cliente' })
  @ApiParam({ name: 'itemId', description: 'ID do item do carrinho' })
  @ApiResponse({ status: 200, description: 'Item removido com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 404, description: 'Item do carrinho ou cliente não encontrado' })
  async removeFromCart(
    @Param('clientId') clientId: string,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeFromCart(clientId, itemId);
  }

  @Delete(':clientId/clear')
  @ApiOperation({ summary: 'Limpar carrinho' })
  @ApiParam({ name: 'clientId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Carrinho limpo com sucesso', type: CartResponseDto })
  @ApiResponse({ status: 404, description: 'Carrinho ou cliente não encontrado' })
  async clearCart(@Param('clientId') clientId: string): Promise<CartResponseDto> {
    return this.cartService.clearCart(clientId);
  }
} 