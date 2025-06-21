import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      // Create empty cart if it doesn't exist
      const newCart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      return this.formatCartResponse(newCart);
    }

    return this.formatCartResponse(cart);
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<CartResponseDto> {
    const { productId, quantity } = addToCartDto;

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Return updated cart
    const updatedCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.formatCartResponse(updatedCart);
  }

  async updateCartItem(userId: string, itemId: string, updateDto: UpdateCartItemDto): Promise<CartResponseDto> {
    const { quantity } = updateDto;

    // Verify cart item exists and belongs to user
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Update quantity
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // Return updated cart
    const updatedCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.formatCartResponse(updatedCart);
  }

  async removeFromCart(userId: string, itemId: string): Promise<CartResponseDto> {
    // Verify cart item exists and belongs to user
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Remove item
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Return updated cart
    const updatedCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.formatCartResponse(updatedCart);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Remove all items
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Return empty cart
    const emptyCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.formatCartResponse(emptyCart);
  }

  private formatCartResponse(cart: any): CartResponseDto {
    const items: CartItemResponseDto[] = cart.items.map(item => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      productPrice: item.product.price,
      productImage: item.product.image,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      total,
      itemCount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
} 