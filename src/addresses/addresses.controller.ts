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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Endereços')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER, Role.ADMIN)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  async createAddress(
    @Request() req,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.createAddress(req.user.id, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar endereços do usuário' })
  @ApiResponse({ status: 200, description: 'Endereços listados com sucesso', type: [AddressResponseDto] })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  async findAllAddresses(@Request() req): Promise<AddressResponseDto[]> {
    return this.addressesService.findAllAddresses(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter endereço por ID' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço obtido com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async findAddressById(
    @Request() req,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    return this.addressesService.findAddressById(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async updateAddress(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.updateAddress(req.user.id, id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço deletado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas CUSTOMER e ADMIN podem acessar)' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async deleteAddress(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    return this.addressesService.deleteAddress(req.user.id, id);
  }
} 