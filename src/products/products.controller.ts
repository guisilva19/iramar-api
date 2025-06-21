import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
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
  ApiQuery,
} from '@nestjs/swagger';

/**
 * Controller para gerenciamento de produtos
 * @description Endpoints para criar, listar, atualizar e remover produtos do e-commerce
 */
@ApiTags('Produtos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Cria um novo produto
   * @description Endpoint para cadastrar um novo produto no sistema
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cadastrar novo produto',
    description:
      'Cria um novo produto no sistema. Requer autenticação e permissão de administrador.',
  })
  @ApiBody({
    type: CreateProductDto,
    description: 'Dados do produto a ser cadastrado',
    examples: {
      produto1: {
        summary: 'Arroz Integral',
        value: {
          name: 'Arroz Integral Tipo 1',
          description:
            'Arroz integral tipo 1, pacote de 1kg. Rico em fibras e nutrientes essenciais.',
          price: 8.99,
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      produto2: {
        summary: 'Feijão Carioca',
        value: {
          name: 'Feijão Carioca',
          description: 'Feijão carioca de primeira qualidade, pacote de 1kg.',
          price: 7.99,
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Produto cadastrado com sucesso.',
    type: CreateProductDto,
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * Lista todos os produtos
   * @description Retorna uma lista paginada de produtos com opções de filtro por categoria e busca
   */
  @Get()
  @ApiOperation({
    summary: 'Listar produtos com filtros e paginação',
    description:
      'Retorna uma lista paginada de produtos com opções de filtro por categoria, busca por texto e paginação. Apenas page e limit são obrigatórios.',
  })
  @ApiQuery({
    name: 'page',
    required: true,
    description: 'Número da página (começa em 1)',
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    description: 'Número de itens por página (máximo 20)',
    example: 10,
    type: 'number',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'ID da categoria para filtrar produtos (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Termo de busca para filtrar produtos por nome ou descrição (opcional)',
    example: 'arroz',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso.',
    type: PaginatedProductsResponseDto,
  })
  findAll(@Query() query: FindAllProductsDto) {
    return this.productsService.findAll(query);
  }

  /**
   * Busca um produto específico
   * @description Retorna os detalhes de um produto específico pelo seu ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por ID',
    description: 'Retorna os detalhes de um produto específico pelo seu ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado com sucesso.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado.',
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * Atualiza um produto
   * @description Atualiza os dados de um produto existente
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar produto',
    description:
      'Atualiza os dados de um produto existente. Requer autenticação e permissão de administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto a ser atualizado',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: CreateProductDto,
    description: 'Dados do produto a ser atualizado',
    examples: {
      atualizarPreco: {
        summary: 'Atualizar Preço',
        value: {
          price: 9.99,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso.',
    type: CreateProductDto,
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
    description: 'Produto não encontrado.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * Remove um produto
   * @description Remove um produto do sistema
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover produto',
    description:
      'Remove um produto do sistema. Requer autenticação e permissão de administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto a ser removido',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto removido com sucesso.',
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
    description: 'Produto não encontrado.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
