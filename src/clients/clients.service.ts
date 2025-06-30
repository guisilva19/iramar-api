import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginClientDto } from './dto/login-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async createOrLogin(createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const { name, phone } = createClientDto;

    // Verifica se já existe um cliente com este telefone
    const existingClient = await this.prisma.client.findUnique({
      where: { phone },
    });

    if (existingClient) {
      // Se existe, retorna o cliente existente (login)
      return {
        id: existingClient.id,
        name: existingClient.name,
        phone: existingClient.phone,
        createdAt: existingClient.createdAt,
        updatedAt: existingClient.updatedAt,
      };
    }

    // Se não existe, cria um novo cliente
    const newClient = await this.prisma.client.create({
      data: {
        name,
        phone,
      },
    });

    return {
      id: newClient.id,
      name: newClient.name,
      phone: newClient.phone,
      createdAt: newClient.createdAt,
      updatedAt: newClient.updatedAt,
    };
  }

  async login(loginClientDto: LoginClientDto): Promise<ClientResponseDto> {
    const { phone } = loginClientDto;

    const client = await this.prisma.client.findUnique({
      where: { phone },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado com este telefone');
    }

    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  async findOne(id: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  async findByPhone(phone: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { phone },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return clients.map(client => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }));
  }
} 