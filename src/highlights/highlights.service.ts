import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { UpdateHighlightDto } from './dto/update-highlight.dto';
import { HighlightResponseDto } from './dto/highlight-response.dto';

@Injectable()
export class HighlightsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria um novo highlight
   * @param createHighlightDto Dados do highlight a ser criado
   * @returns Highlight criado
   */
  async create(createHighlightDto: CreateHighlightDto): Promise<HighlightResponseDto> {
    return this.prisma.highlight.create({
      data: createHighlightDto,
    });
  }

  /**
   * Busca todos os highlights
   * @returns Lista de todos os highlights
   */
  async findAll(): Promise<HighlightResponseDto[]> {
    return this.prisma.highlight.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca um highlight específico por ID
   * @param id ID do highlight
   * @returns Highlight encontrado
   * @throws NotFoundException se o highlight não for encontrado
   */
  async findOne(id: string): Promise<HighlightResponseDto> {
    const highlight = await this.prisma.highlight.findUnique({
      where: { id },
    });

    if (!highlight) {
      throw new NotFoundException(`Highlight com ID ${id} não encontrado`);
    }

    return highlight;
  }

  /**
   * Atualiza um highlight existente
   * @param id ID do highlight
   * @param updateHighlightDto Dados para atualização
   * @returns Highlight atualizado
   * @throws NotFoundException se o highlight não for encontrado
   */
  async update(id: string, updateHighlightDto: UpdateHighlightDto): Promise<HighlightResponseDto> {
    const highlight = await this.prisma.highlight.findUnique({
      where: { id },
    });

    if (!highlight) {
      throw new NotFoundException(`Highlight com ID ${id} não encontrado`);
    }

    return this.prisma.highlight.update({
      where: { id },
      data: updateHighlightDto,
    });
  }

  /**
   * Remove um highlight
   * @param id ID do highlight
   * @returns Highlight removido
   * @throws NotFoundException se o highlight não for encontrado
   */
  async remove(id: string): Promise<HighlightResponseDto> {
    const highlight = await this.prisma.highlight.findUnique({
      where: { id },
    });

    if (!highlight) {
      throw new NotFoundException(`Highlight com ID ${id} não encontrado`);
    }

    return this.prisma.highlight.delete({
      where: { id },
    });
  }
} 