import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginClientDto } from './dto/login-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';

@ApiTags('Clientes')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cadastrar ou fazer login de cliente',
    description: 'Cadastra um novo cliente ou faz login se o telefone já existir. Se o telefone já estiver cadastrado, retorna os dados do cliente existente (login automático).',
  })
  @ApiBody({
    type: CreateClientDto,
    description: 'Dados do cliente para cadastro/login',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente cadastrado ou logado com sucesso',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  async createOrLogin(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    return this.clientsService.createOrLogin(createClientDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fazer login de cliente',
    description: 'Faz login de um cliente existente usando apenas o telefone. Retorna erro se o telefone não estiver cadastrado.',
  })
  @ApiBody({
    type: LoginClientDto,
    description: 'Telefone do cliente para login',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado com este telefone',
  })
  @ApiResponse({
    status: 400,
    description: 'Telefone inválido',
  })
  async login(@Body() loginClientDto: LoginClientDto): Promise<ClientResponseDto> {
    return this.clientsService.login(loginClientDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os clientes',
    description: 'Retorna uma lista de todos os clientes cadastrados, ordenados por data de criação (mais recentes primeiro).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso',
    type: [ClientResponseDto],
  })
  async findAll(): Promise<ClientResponseDto[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar cliente por ID',
    description: 'Retorna os dados de um cliente específico pelo seu ID único.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado com sucesso',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async findOne(@Param('id') id: string): Promise<ClientResponseDto> {
    return this.clientsService.findOne(id);
  }

  @Get('phone/:phone')
  @ApiOperation({
    summary: 'Buscar cliente por telefone',
    description: 'Retorna os dados de um cliente específico pelo seu número de telefone.',
  })
  @ApiParam({
    name: 'phone',
    description: 'Número de telefone do cliente',
    example: '+5511999999999',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado com sucesso',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async findByPhone(@Param('phone') phone: string): Promise<ClientResponseDto> {
    return this.clientsService.findByPhone(phone);
  }
} 