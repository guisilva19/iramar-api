import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    const sortOrder = data.sortOrder ?? (await this.getNextSortOrder());

    return this.prisma.category.create({
      data: {
        name: data.name,
        sortOrder,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, data: Partial<CreateCategoryDto>) {
    try {
      return await this.prisma.category.update({ where: { id }, data });
    } catch (error) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async reorder(orderedIds: string[]) {
    const existing = await this.prisma.category.findMany({
      select: { id: true },
    });

    if (orderedIds.length !== existing.length) {
      throw new BadRequestException(
        'A lista deve conter todas as categorias cadastradas',
      );
    }

    const existingIds = new Set(existing.map((category) => category.id));

    for (const id of orderedIds) {
      if (!existingIds.has(id)) {
        throw new BadRequestException(`Categoria com ID ${id} não encontrada`);
      }
    }

    if (new Set(orderedIds).size !== orderedIds.length) {
      throw new BadRequestException('IDs duplicados na lista de reordenação');
    }

    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.category.update({
          where: { id },
          data: { sortOrder: index + 1 },
        }),
      ),
    );

    return this.findAll();
  }

  async remove(id: string) {
    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  private async getNextSortOrder(): Promise<number> {
    const last = await this.prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return (last?.sortOrder ?? 0) + 1;
  }
}
