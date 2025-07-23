import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async createAddress(createAddressDto: CreateAddressDto): Promise<AddressResponseDto> {
    const { clientId, ...addressData } = createAddressDto;
    
    const address = await this.prisma.address.create({
      data: {
        clientId,
        ...addressData,
      },
    });

    return this.formatAddressResponse(address);
  }

  async findAllAddresses(clientId: string): Promise<AddressResponseDto[]> {
    const addresses = await this.prisma.address.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return addresses.map(address => this.formatAddressResponse(address));
  }

  async findAddressById(clientId: string): Promise<AddressResponseDto> {
    const address = await this.prisma.address.findFirst({
      where: {
        clientId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.formatAddressResponse(address);
  }

  async updateAddress(
    clientId: string,
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        clientId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const updatedAddress = await this.prisma.address.update({
      where: { id: addressId },
      data: updateAddressDto,
    });

    return this.formatAddressResponse(updatedAddress);
  }

  async deleteAddress(clientId: string, addressId: string): Promise<void> {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        clientId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });
  }

  private formatAddressResponse(address: any): AddressResponseDto {
    return {
      id: address.id,
      clientId: address.clientId,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
      lat: address.lat,
      lng: address.lng,
    };
  }
} 