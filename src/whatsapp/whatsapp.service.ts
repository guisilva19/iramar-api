import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WhatsAppService {

    constructor(private prisma: PrismaService) { }

    async sendMessage(body: { phone: string, name: string | '' }) {
        try {
            const client = await this.prisma.client.findUnique({
                where: { phone: body.phone }
            });

            if (client && client.lastMessage !== null) {
                const now = new Date();
                const lastMessageTime = new Date(client?.lastMessage);
                const timeDifference = now.getTime() - lastMessageTime.getTime();
                const thirtyMinutesInMs = 30 * 60 * 1000; // 30 minutos em milissegundos
                
                // Se a última mensagem foi enviada há menos de 30 minutos, não enviar nova mensagem
                if (timeDifference < thirtyMinutesInMs) {
                    return {
                        success: false,
                        message: 'Mensagem não enviada - intervalo mínimo de 30 minutos não respeitado'
                    };
                }
            }

            if (!client) {
                await this.prisma.client.create({
                    data: {
                        phone: body.phone,
                        name: body.name,
                        lastMessage: new Date(),
                        typeLastMessage: 1
                    }
                });
            } else {
                await this.prisma.client.update({
                    where: { id: client.id },
                    data: { lastMessage: new Date(), typeLastMessage: 1 }
                });
            }

            const { phone } = body;

            if (!phone) {
                throw new Error('Phone e message são obrigatórios');
            }

            const payload = {
                phone: phone,
                message: this.messageReturn(1, phone)
            };
            const response = await fetch(process.env.ZAPI_URL as string, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Client-Token': 'Fcdff9c6618a3407996d014cfc68a6f46S'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro na Z-API: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();

            return {
                success: true,
                data: result,
                message: 'Mensagem enviada com sucesso'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Erro ao enviar mensagem'
            };
        }
    }

    messageReturn(type: Number, phone: string) {
        switch (type) {
            case 1:
                return `Olá! Seja muito bem-vindo(a) ao *Mercado Iramar*! 🛒

Estamos muito felizes em tê-lo(a) conosco!

*O que você encontra aqui:*
• Produtos frescos e de qualidade
• Ofertas especiais todos os dias
• Entrega rápida

*Acesse nosso site:*
https://www.mercadoiramar.com.br?phone=${phone}`;
            case 2:
                return '';
        }
    }

    async sendOrderToClient(body: { phone: string, orderId: string }) {
        try {
            // Buscar o pedido completo com todos os dados relacionados
            const order = await this.prisma.order.findUnique({
                where: { id: body.orderId },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    client: true,
                    address: true
                }
            });

            if (!order) {
                throw new Error('Pedido não encontrado');
            }

            // Gerar mensagem dinâmica com os itens do pedido
            const message = this.generateOrderMessage(order);

            const payload = {
                phone: body.phone,
                message: message
            };

            const response = await fetch(process.env.ZAPI_URL as string, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Client-Token': 'Fcdff9c6618a3407996d014cfc68a6f46S'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response body:', errorText);
                throw new Error(`Erro na Z-API: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();

            return {
                success: true,
                data: result,
                message: 'Mensagem de confirmação enviada ao cliente com sucesso'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Erro ao enviar mensagem de confirmação ao cliente'
            };
        }
    }

    async sendOrderToDelivery(body: { phone: string, orderId: string }) {
        try {
            // Buscar o pedido completo com todos os dados relacionados
            const order = await this.prisma.order.findUnique({
                where: { id: body.orderId },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    client: true,
                    address: true
                }
            });

            if (!order) {
                throw new Error('Pedido não encontrado');
            }


            // Gerar mensagem para o entregador
            const message = this.generateDeliveryMessage(order);

            const payload = {
                phone: body.phone,
                message: message
            };

            const response = await fetch(process.env.ZAPI_URL as string, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Client-Token': 'Fcdff9c6618a3407996d014cfc68a6f46S'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response body:', errorText);
                throw new Error(`Erro na Z-API: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();

            return {
                success: true,
                data: result,
                message: 'Informações de entrega enviadas ao entregador com sucesso'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Erro ao enviar informações de entrega ao entregador'
            };
        }
    }

    private generateOrderMessage(order: any): string {
        const paymentMethodMap = {
            'CARTAO': 'Cartão',
            'PIX': 'PIX',
            'DINHEIRO': 'Dinheiro'
        };

        let message = `🛒 *PEDIDO CONFIRMADO - Mercado Iramar*\n\n`;
        message += `💳 *Pagamento:* ${paymentMethodMap[order.paymentMethod] || order.paymentMethod}\n\n`;

        message += `📦 *SEUS ITENS:*\n`;
        message += `${'─'.repeat(15)}\n`;

        order.items.forEach((item: any, index: number) => {
            message += `${index + 1}. ${item.product.name} - ${item.quantity}x - R$ ${(item.quantity * item.price).toFixed(2).replace('.', ',')}\n`;
        });

        message += `${'─'.repeat(15)}\n`;
        
        // Calculate subtotal (items only)
        const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
        message += `📦 *Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}*\n`;
        message += `🚚 *Taxa de entrega: R$ ${order.taxDelivery.toFixed(2).replace('.', ',')}*\n`;
        message += `💰 *TOTAL: R$ ${order.total.toFixed(2).replace('.', ',')}*`;

        if (order.notes) {
            message += `\n\n📝 *Observações:* ${order.notes}`;
        }

        message += `\n\n✅ Seu pedido foi recebido e será processado em breve!`;
        message += `\n🚚 Acompanhe o status pelo nosso site.`;
        message += `\n\n📞 Dúvidas? Entre em contato conosco!`;

        return message;
    }

    private generateDeliveryMessage(order: any): string {
        const paymentMethodMap = {
            'CARTAO': 'Cartão',
            'PIX': 'PIX',
            'DINHEIRO': 'Dinheiro'
        };

        let message = `🚚 *NOVA ENTREGA - Mercado Iramar*\n\n`;
        message += `📋 *Pedido:* ${order.id}\n`;
        message += `👤 *Cliente:* ${order.client.name}\n`;
        message += `📱 *Telefone:* ${order.client.phone}\n`;
        message += `💳 *Pagamento:* ${paymentMethodMap[order.paymentMethod] || order.paymentMethod}\n`;
        message += `💰 *Valor Total:* R$ ${order.total.toFixed(2).replace('.', ',')}\n\n`;

        message += `📦 *ITENS PARA ENTREGA:*\n`;
        message += `${'─'.repeat(15)}\n`;

        order.items.forEach((item: any, index: number) => {
            message += `${index + 1}. ${item.product.name} - ${item.quantity}x\n`;
        });

        message += `${'─'.repeat(15)}\n`;

        // Adicionar localização do Google Maps se latitude e longitude estiverem disponíveis
        if (order.address.lat && order.address.lng) {
            message += `\n\n🗺️ *LOCALIZAÇÃO:*\n`;
            message += `https://www.google.com/maps?q=${order.address.lat},${order.address.lng}`;
        }

        if (order.notes) {
            message += `\n\n📝 *Observações:* ${order.notes}`;
        }

        if (order.paymentMethod === 'DINHEIRO') {
            message += `\n\n💵 *ATENÇÃO: Cobrar R$ ${order.total.toFixed(2).replace('.', ',')} em dinheiro*`;
        }

        message += `\n\n✅ Boa entrega!`;

        return message;
    }
}