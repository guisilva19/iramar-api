import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeliveryService {
    constructor(private readonly prisma: PrismaService) {}

    async createDeliveryTax(tax: number) {
        await this.prisma.deliveryTax.deleteMany();

        const deliveryTax = await this.prisma.deliveryTax.create({
            data: { tax },
        });
        return deliveryTax;
    }

    async getDeliveryTax() {
        const deliveryTax = await this.prisma.deliveryTax.findFirst();
        return deliveryTax;
    }

    async updateDeliveryTax(id: string, newTax: number) {
        const deliveryTax = await this.prisma.deliveryTax.update({
            where: { id },
            data: { tax: newTax },
        });
        return deliveryTax;
    }
}
