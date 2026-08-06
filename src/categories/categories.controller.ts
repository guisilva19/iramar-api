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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Categorias')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cadastrar nova categoria',
    description:
      'Cria uma nova categoria. Requer autenticação e permissão de administrador.',
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Dados da categoria a ser cadastrada',
    examples: {
      categoria1: {
        summary: 'Alimentos',
        value: {
          name: 'Alimentos',
          sortOrder: 1,
        },
      },
      categoria2: {
        summary: 'Bebidas',
        value: {
          name: 'Bebidas',
          sortOrder: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Categoria cadastrada com sucesso.',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos.' })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token de acesso inválido ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Usuário não possui permissão de administrador.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar categorias',
    description: 'Retorna todas as categorias ordenadas por sortOrder.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias ordenada.',
    type: [CategoryResponseDto],
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reordenar categorias',
    description:
      'Define a ordem de exibição das categorias enviando a lista completa de IDs na sequência desejada.',
  })
  @ApiBody({ type: ReorderCategoriesDto })
  @ApiResponse({
    status: 200,
    description: 'Categorias reordenadas com sucesso.',
    type: [CategoryResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Lista de IDs inválida.' })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token de acesso inválido ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado. Usuário não possui permissão de administrador.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  reorder(@Body() reorderCategoriesDto: ReorderCategoriesDto) {
    return this.categoriesService.reorder(reorderCategoriesDto.orderedIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiResponse({
    status: 200,
    description: 'Categoria encontrada.',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar categoria',
    description:
      'Atualiza nome e/ou posição (sortOrder) de uma categoria existente.',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Categoria atualizada com sucesso.',
    type: CategoryResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Partial<CreateCategoryDto>,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
