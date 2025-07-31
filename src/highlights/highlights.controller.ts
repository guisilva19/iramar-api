import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HighlightsService } from './highlights.service';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { UpdateHighlightDto } from './dto/update-highlight.dto';
import { HighlightResponseDto } from './dto/highlight-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

/**
 * Controller para gerenciamento de highlights
 * @description Endpoints para criar, listar, atualizar e remover highlights
 */
@ApiTags('Highlights')
@Controller('highlights')
export class HighlightsController {
  constructor(private readonly highlightsService: HighlightsService) {}

  /**
   * Cria um novo highlight
   * @description Endpoint para cadastrar um novo highlight no sistema. Requer autenticação.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cadastrar novo highlight',
    description:
      'Cria um novo highlight no sistema. Requer autenticação e permissão de administrador.',
  })
  @ApiBody({
    type: CreateHighlightDto,
    description: 'Dados do highlight a ser cadastrado',
    examples: {
      highlight1: {
        summary: 'Highlight Promocional',
        value: {
          image: 'https://example.com/promocao-destaque.jpg',
        },
      },
      highlight2: {
        summary: 'Highlight de Produto',
        value: {
          image: 'https://example.com/produto-destaque.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Highlight cadastrado com sucesso.',
    type: HighlightResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token de acesso inválido ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso negado. Usuário não possui permissão de administrador.',
  })
  create(@Body() createHighlightDto: CreateHighlightDto): Promise<HighlightResponseDto> {
    return this.highlightsService.create(createHighlightDto);
  }

  /**
   * Lista todos os highlights
   * @description Endpoint público para listar todos os highlights disponíveis
   */
  @Get()
  @ApiOperation({
    summary: 'Listar todos os highlights',
    description: 'Retorna uma lista de todos os highlights disponíveis. Endpoint público.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de highlights retornada com sucesso.',
    type: [HighlightResponseDto],
  })
  findAll(): Promise<HighlightResponseDto[]> {
    return this.highlightsService.findAll();
  }

  /**
   * Busca um highlight específico
   * @description Endpoint público para buscar um highlight específico por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar highlight por ID',
    description: 'Retorna um highlight específico pelo ID. Endpoint público.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do highlight',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Highlight encontrado com sucesso.',
    type: HighlightResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Highlight não encontrado.',
  })
  findOne(@Param('id') id: string): Promise<HighlightResponseDto> {
    return this.highlightsService.findOne(id);
  }

  /**
   * Atualiza um highlight existente
   * @description Endpoint para atualizar um highlight existente. Requer autenticação.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar highlight',
    description:
      'Atualiza um highlight existente. Requer autenticação e permissão de administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do highlight',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiBody({
    type: UpdateHighlightDto,
    description: 'Dados para atualização do highlight',
    examples: {
      update1: {
        summary: 'Atualizar imagem',
        value: {
          image: 'https://example.com/nova-imagem-destaque.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Highlight atualizado com sucesso.',
    type: HighlightResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token de acesso inválido ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso negado. Usuário não possui permissão de administrador.',
  })
  @ApiResponse({
    status: 404,
    description: 'Highlight não encontrado.',
  })
  update(
    @Param('id') id: string,
    @Body() updateHighlightDto: UpdateHighlightDto,
  ): Promise<HighlightResponseDto> {
    return this.highlightsService.update(id, updateHighlightDto);
  }

  /**
   * Remove um highlight
   * @description Endpoint para remover um highlight. Requer autenticação.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover highlight',
    description:
      'Remove um highlight do sistema. Requer autenticação e permissão de administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do highlight',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Highlight removido com sucesso.',
    type: HighlightResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token de acesso inválido ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso negado. Usuário não possui permissão de administrador.',
  })
  @ApiResponse({
    status: 404,
    description: 'Highlight não encontrado.',
  })
  remove(@Param('id') id: string): Promise<HighlightResponseDto> {
    return this.highlightsService.remove(id);
  }
} 