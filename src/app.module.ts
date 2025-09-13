import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ClientsModule } from './clients/clients.module';
import { HighlightsModule } from './highlights/highlights.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    AddressesModule,
    DashboardModule,
    ClientsModule,
    HighlightsModule,
    WhatsAppModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
