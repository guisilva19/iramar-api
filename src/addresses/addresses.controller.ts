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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
// import { CreateAddressClientDto } from './dto/create-address-client.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Endereços')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  // Client routes (sem autenticação JWT) - TEMPORARIAMENTE COMENTADOS
  /*
  @Post('client')
  @ApiOperation({
    summary: 'Criar novo endereço (Cliente)',
    description: 'Cria um novo endereço para um cliente específico usando clientId. Não requer autenticação JWT.',
  })
  @ApiBody({
    type: CreateAddressClientDto,
    description: 'Dados do endereço incluindo clientId',
  })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createClientAddress(@Body() createAddressClientDto: any): Promise<AddressResponseDto> {
    return this.addressesService.createClientAddress(createAddressClientDto);
  }

  @Get('client/:clientId')
  @ApiOperation({
    summary: 'Listar endereços de um cliente',
    description: 'Lista todos os endereços de um cliente específico usando clientId. Não requer autenticação JWT.',
  })
  @ApiParam({
    name: 'clientId',
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Endereços listados com sucesso', type: [AddressResponseDto] })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findClientAddresses(@Param('clientId') clientId: string): Promise<AddressResponseDto[]> {
    return this.addressesService.findClientAddresses(clientId);
  }

  @Get('client/:clientId/:id')
  @ApiOperation({
    summary: 'Obter endereço específico de um cliente',
    description: 'Obtém um endereço específico de um cliente usando clientId e addressId. Não requer autenticação JWT.',
  })
  @ApiParam({
    name: 'clientId',
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do endereço',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Endereço obtido com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Endereço ou cliente não encontrado' })
  async findClientAddressById(
    @Param('clientId') clientId: string,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    return this.addressesService.findClientAddressById(clientId, id);
  }

  @Put('client/:clientId/:id')
  @ApiOperation({
    summary: 'Atualizar endereço (Cliente)',
    description: 'Atualiza um endereço específico de um cliente. Não requer autenticação JWT.',
  })
  @ApiParam({
    name: 'clientId',
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do endereço',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Endereço ou cliente não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async updateClientAddress(
    @Param('clientId') clientId: string,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.updateClientAddress(clientId, id, updateAddressDto);
  }

  @Delete('client/:clientId/:id')
  @ApiOperation({
    summary: 'Deletar endereço (Cliente)',
    description: 'Deleta um endereço específico de um cliente. Não requer autenticação JWT.',
  })
  @ApiParam({
    name: 'clientId',
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do endereço',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Endereço deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Endereço ou cliente não encontrado' })
  async deleteClientAddress(
    @Param('clientId') clientId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.addressesService.deleteClientAddress(clientId, id);
  }
  */

  // Admin routes (com autenticação JWT)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo endereço (Admin)' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas ADMIN pode acessar)' })
  async createAddress(
    @Request() req,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.createAddress(req.user.id, createAddressDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar endereços do usuário (Admin)' })
  @ApiResponse({ status: 200, description: 'Endereços listados com sucesso', type: [AddressResponseDto] })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas ADMIN pode acessar)' })
  async findAllAddresses(@Request() req): Promise<AddressResponseDto[]> {
    return this.addressesService.findAllAddresses(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter endereço por ID (Admin)' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço obtido com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas ADMIN pode acessar)' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async findAddressById(
    @Request() req,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    return this.addressesService.findAddressById(req.user.id, id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar endereço (Admin)' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas ADMIN pode acessar)' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async updateAddress(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.updateAddress(req.user.id, id, updateAddressDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar endereço (Admin)' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço deletado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  @ApiResponse({ status: 403, description: 'Usuário não tem permissão (apenas ADMIN pode acessar)' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async deleteAddress(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    return this.addressesService.deleteAddress(req.user.id, id);
  }
} 