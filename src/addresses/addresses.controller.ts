import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';

@ApiTags('Endereços')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}
  
  @Post()
  @ApiOperation({ summary: 'Criar novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso', type: AddressResponseDto })
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.createAddress(createAddressDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter endereço por ID' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço obtido com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async findAddressById(
    @Param('id') id: string,
    @Query('clientId') clientId: string,
  ): Promise<AddressResponseDto> {
    return this.addressesService.findAddressById(clientId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso', type: AddressResponseDto })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Query('clientId') clientId: string,
  ): Promise<AddressResponseDto> {
    return this.addressesService.updateAddress(clientId, id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereço' })
  @ApiResponse({ status: 200, description: 'Endereço deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async deleteAddress(
    @Param('id') id: string,
    @Query('clientId') clientId: string,
  ): Promise<void> {
    return this.addressesService.deleteAddress(clientId, id);
  }
} 