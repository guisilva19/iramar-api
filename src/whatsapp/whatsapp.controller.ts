import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('WhatsApp')
@Controller('webhook')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('whatsapp/receive')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Receber mensagem via WhatsApp',
    description: 'Recebe uma mensagem via WhatsApp.',
  })
  async receiveMessage(@Body() body: any) {
    if (body.isGroup) {
      return 200;
    }
    this.whatsappService.sendMessage({ phone: body.phone, name: body.senderName });
  }

  @Post('whatsapp/send')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar mensagem via WhatsApp',
    description: 'Envia uma mensagem via WhatsApp usando Z-API. Requer phone (número do telefone) e message (texto da mensagem).',
  })
  async sendMessage(@Body() body: { phone: string, message: string, name: string | '' }) {
    return this.whatsappService.sendMessage(body);
  }

  @Post('whatsapp/send/order/client')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar confirmação de pedido para o cliente via WhatsApp',
    description: 'Envia uma mensagem detalhada de confirmação de pedido para o cliente via WhatsApp. Requer phone (número do telefone) e orderId (ID do pedido).',
  })
  async sendOrderToClient(@Body() body: { phone: string, orderId: string }) {
    return this.whatsappService.sendOrderToClient(body);
  }

  @Post('whatsapp/send/order/delivery')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar informações de entrega para o entregador via WhatsApp',
    description: 'Envia uma mensagem com informações essenciais de entrega para o entregador via WhatsApp. Requer phone (número do telefone) e orderId (ID do pedido).',
  })
  async sendOrderToDelivery(@Body() body: { phone: string, orderId: string }) {
    return this.whatsappService.sendOrderToDelivery(body);
  }
}

// {
//   isStatusReply: false,
//   chatLid: '38169542193405@lid',
//   connectedPhone: '557799577372',
//   waitingMessage: false,
//   isEdit: false,
//   isGroup: false,
//   isNewsletter: false,
//   instanceId: '3E4F09B7606AF142070E96DEC512DD4C',
//   messageId: 'AC2F30160F27A6EA1F5DD41574F4AD25',
//   phone: '557798248285',
//   fromMe: false,
//   momment: 1757777135000,
//   status: 'RECEIVED',
//   chatName: 'Maicon',
//   senderPhoto: null,
//   senderName: 'Maicon Dias🍀',
//   photo: 'https://pps.whatsapp.net/v/t61.24694-24/517422413_1058420826447264_7011123254054882545_n.jpg?ccb=11-4&oh=01_Q5Aa2gExgTfpWPaAfrtkgdef08QL7_sdhp-4rCan8daO8gT9_A&oe=68D2A802&_nc_sid=5e03e0&_nc_cat=101',
//   broadcast: false,
//   participantLid: null,
//   forwarded: false,
//   type: 'ReceivedCallback',
//   fromApi: false,
//   text: { message: '301572' }
// }