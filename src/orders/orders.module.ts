import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [PrismaModule, CartModule, WhatsAppModule, DeliveryModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {} 