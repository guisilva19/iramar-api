import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryTaxDto } from './delivery.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Entrega')
@Controller('delivery')
export class DeliveryController {

    constructor(private readonly deliveryService: DeliveryService) {}

    @Post()
    @ApiOperation({ summary: 'Criar taxa de entrega' })
    @ApiResponse({ status: 201, description: 'Taxa de entrega criada com sucesso' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiBearerAuth()
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    createDeliveryTax(@Body() createDeliveryTaxDto: DeliveryTaxDto) {
        return this.deliveryService.createDeliveryTax(createDeliveryTaxDto.tax);
    }

    @Get()
    @ApiOperation({ summary: 'Obter taxa de entrega' })
    @ApiResponse({ status: 200, description: 'Taxa de entrega obtida com sucesso' })
    @ApiResponse({ status: 404, description: 'Taxa de entrega não encontrada' })
    getDeliveryTax() {
        return this.deliveryService.getDeliveryTax();
    }

    @Put(":id")
    @ApiOperation({ summary: 'Atualizar taxa de entrega' })
    @ApiResponse({ status: 200, description: 'Taxa de entrega atualizada com sucesso' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Taxa de entrega não encontrada' })
    @ApiParam({ name: 'id', description: 'ID da taxa de entrega' })
    @ApiBearerAuth()
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    updateDeliveryTax(@Param("id") id: string, @Body() updateDeliveryTaxDto: DeliveryTaxDto) {
        return this.deliveryService.updateDeliveryTax(id, updateDeliveryTaxDto.tax);
    }
}
