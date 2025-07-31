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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { EcommerceProductsDto, FeaturedProductsDto, SortOrder } from './dto/ecommerce-products.dto';
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
  ApiConsumes,
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
          isActive: true,
        },
      },
      produto2: {
        summary: 'Feijão Carioca',
        value: {
          name: 'Feijão Carioca',
          description: 'Feijão carioca de primeira qualidade, pacote de 1kg.',
          price: 7.99,
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          isActive: true,
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
   * Upload de arquivo para produto
   * @description Endpoint para fazer upload de imagem de produto via FormData
   */
  @Post('upload')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de imagem de produto',
    description:
      'Faz upload de uma imagem para um produto. Requer autenticação e permissão de administrador. Aceita FormData com arquivo e dados opcionais do produto.',
  })
  @ApiBody({
    description: 'FormData com arquivo de imagem',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (jpg, jpeg, png, gif) - máximo 2MB',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Arquivo enviado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos ou arquivo inválido.',
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.productsService.uploadFile(file);
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
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos.',
  })
  findAll(@Query() query: FindAllProductsDto) {
    return this.productsService.findAll(query);
  }

  /**
   * Lista produtos para o e-commerce
   * @description Retorna produtos para o e-commerce com ordenação aleatória por padrão e filtros
   */
  @Get('ecommerce')
  @ApiOperation({
    summary: 'Listar produtos para e-commerce',
    description:
      'Retorna produtos para o e-commerce com ordenação aleatória por padrão, filtros e paginação. Ideal para páginas de listagem de produtos.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (começa em 1)',
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de itens por página (máximo 50)',
    example: 20,
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
    description: 'Termo de busca para filtrar produtos por nome ou descrição (pode ser vazio)',
    example: 'arroz',
    type: 'string',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Ordenação dos produtos (aleatória por padrão)',
    enum: SortOrder,
    example: SortOrder.RANDOM,
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos retornados com sucesso.',
    type: PaginatedProductsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos.',
  })
  findEcommerceProducts(@Query() query: EcommerceProductsDto) {
    return this.productsService.findEcommerceProducts(query);
  }

  /**
   * Lista produtos em destaque para o e-commerce
   * @description Retorna produtos em destaque com ordenação aleatória para exibição na página inicial
   */
  @Get('featured')
  @ApiOperation({
    summary: 'Listar produtos em destaque',
    description:
      'Retorna produtos em destaque com ordenação aleatória para exibição na página inicial do e-commerce. Ideal para banners e seções de destaque.',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'ID da categoria para filtrar produtos em destaque (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de produtos em destaque a retornar',
    example: 10,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos em destaque retornados com sucesso.',
    type: [ProductResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos.',
  })
  findFeaturedProducts(@Query() query: FeaturedProductsDto) {
    return this.productsService.findFeaturedProducts(query);
  }

  /**
   * Lista produtos por categoria para o e-commerce
   * @description Retorna produtos de uma categoria específica com ordenação aleatória por padrão
   */
  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Listar produtos por categoria',
    description:
      'Retorna produtos de uma categoria específica com ordenação aleatória por padrão e filtros. Ideal para páginas de categoria.',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'ID da categoria',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (começa em 1)',
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de itens por página (máximo 50)',
    example: 20,
    type: 'number',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Termo de busca para filtrar produtos por nome ou descrição (pode ser vazio)',
    example: 'arroz',
    type: 'string',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Ordenação dos produtos (aleatória por padrão)',
    enum: SortOrder,
    example: SortOrder.RANDOM,
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos da categoria retornados com sucesso.',
    type: PaginatedProductsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada.',
  })
  findProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query() query: EcommerceProductsDto,
  ) {
    return this.productsService.findProductsByCategory(categoryId, query);
  }

  /**
   * Busca produtos por termo de busca para o e-commerce
   * @description Retorna produtos que correspondem ao termo de busca com ordenação aleatória por padrão
   */
  @Get('search/:search')
  @ApiOperation({
    summary: 'Buscar produtos por termo',
    description:
      'Retorna produtos que correspondem ao termo de busca com ordenação aleatória por padrão e filtros. Busca por nome e descrição.',
  })
  @ApiParam({
    name: 'search',
    description: 'Termo de busca',
    example: 'arroz',
    type: 'string',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (começa em 1)',
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de itens por página (máximo 50)',
    example: 20,
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
    name: 'sortBy',
    required: false,
    description: 'Ordenação dos produtos (aleatória por padrão)',
    enum: SortOrder,
    example: SortOrder.RANDOM,
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos encontrados retornados com sucesso.',
    type: PaginatedProductsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos.',
  })
  searchProducts(
    @Param('search') search: string,
    @Query() query: EcommerceProductsDto,
  ) {
    return this.productsService.searchProducts(search, query);
  }

  /**
   * Lista produtos inativos
   * @description Retorna uma lista paginada de produtos inativos (isActive: false)
   */
  @Get('inactive')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar produtos inativos',
    description:
      'Retorna uma lista paginada de produtos inativos (isActive: false). Requer autenticação e permissão de administrador.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (começa em 1)',
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de itens por página (máximo 20)',
    example: 10,
    type: 'number',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'ID da categoria para filtrar produtos inativos (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Termo de busca para filtrar produtos inativos por nome ou descrição (opcional)',
    example: 'arroz',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos inativos retornada com sucesso.',
    type: PaginatedProductsResponseDto,
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
  findInactiveProducts(@Query() query: FindAllProductsDto) {
    return this.productsService.findInactiveProducts(query);
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
      desativarProduto: {
        summary: 'Desativar Produto',
        value: {
          isActive: false,
        },
      },
      ativarProduto: {
        summary: 'Ativar Produto',
        value: {
          isActive: true,
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
