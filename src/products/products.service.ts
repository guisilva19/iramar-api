import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { EcommerceProductsDto, FeaturedProductsDto, SortOrder } from './dto/ecommerce-products.dto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import 'dotenv/config';

@Injectable()
export class ProductsService {
  private s3: S3Client;

  constructor(private prisma: PrismaService) {
    this.s3 = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
      }
    });
  }

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
      },
    });
  }

  async findAll(query: FindAllProductsDto): Promise<PaginatedProductsResponseDto> {
    const { categoryId, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Construir condições de filtro
    const where: any = {
    };

    // Aplicar filtro de categoria apenas se fornecido
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Aplicar filtro de busca apenas se fornecido
    if (search && search.trim() !== '') {
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    // Buscar produtos com filtros e paginação
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      data: products,
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
  }

  /**
   * Busca produtos inativos com filtros e paginação
   */
  async findInactiveProducts(query: FindAllProductsDto): Promise<PaginatedProductsResponseDto> {
    const { categoryId, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Construir condições de filtro
    const where: any = {
      isActive: false, // Apenas produtos inativos
    };

    // Aplicar filtro de categoria apenas se fornecido
    // if (categoryId) {
    //   where.categoryId = categoryId;
    // }

    // Aplicar filtro de busca apenas se fornecido
    // if (search && search.trim() !== '') {
    //   where.OR = [
    //     {
    //       name: {
    //         contains: search.trim(),
    //         mode: 'insensitive',
    //       },
    //     },
    //     {
    //       description: {
    //         contains: search.trim(),
    //         mode: 'insensitive',
    //       },
    //     },
    //   ];
    // }

    // Buscar produtos inativos com filtros e paginação
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      data: products as ProductResponseDto[],
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: Partial<CreateProductDto>): Promise<ProductResponseDto> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          category: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
  ) {
   
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.originalname,
      Body: file.buffer,
    };

    const command = new PutObjectCommand(params);
    await this.s3.send(command);

   return { url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${file.originalname}` }
  }

  /**
   * Busca produtos para o e-commerce com ordenação e filtros
   */
  async findEcommerceProducts(query: EcommerceProductsDto): Promise<PaginatedProductsResponseDto> {
    const { categoryId, search, sortBy = SortOrder.RANDOM, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Se for ordenação aleatória, usar query raw
    if (sortBy === SortOrder.RANDOM) {
      let whereCondition = 'p."isActive" = true'; // Apenas produtos ativos
      
      if (categoryId) {
        whereCondition += ` AND p."categoryId" = '${categoryId}'`;
      }

      if (search && search.trim() !== '') {
        whereCondition += ` AND (LOWER(p.name) LIKE LOWER('%${search.trim()}%') OR LOWER(p.description) LIKE LOWER('%${search.trim()}%'))`;
      }

      const [products, totalResult] = await Promise.all([
        this.prisma.$queryRawUnsafe(`
          SELECT p.*, c.id as "categoryId", c.name as "categoryName", c.description as "categoryDescription"
          FROM "Product" p
          LEFT JOIN "Category" c ON p."categoryId" = c.id
          WHERE ${whereCondition}
          ORDER BY RANDOM()
          LIMIT ${limit}
          OFFSET ${skip}
        `),
        this.prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count
          FROM "Product" p
          WHERE ${whereCondition}
        `)
      ]);

      const total = Number((totalResult as any[])[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);
      const hasPreviousPage = page > 1;
      const hasNextPage = page < totalPages;

      return {
        data: products as ProductResponseDto[],
        total,
        page,
        limit,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      };
    }

    // Construir condições de filtro para ordenação não-aleatória
    const where: any = {
      isActive: true, // Apenas produtos ativos
    };

    // Aplicar filtro de categoria apenas se fornecido
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Aplicar filtro de busca apenas se fornecido
    if (search && search.trim() !== '') {
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    // Definir ordenação baseada no sortBy
    const orderBy = this.getOrderBy(sortBy);

    // Buscar produtos com filtros, paginação e ordenação
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      data: products,
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
  }

  /**
   * Busca produtos em destaque para o e-commerce
   */
  async findFeaturedProducts(query: FeaturedProductsDto): Promise<ProductResponseDto[]> {
    const { categoryId, limit = 10 } = query;

    // Buscar produtos em destaque com ordenação aleatória
    const products = await this.prisma.$queryRaw`
      SELECT p.*, c.id as "categoryId", c.name as "categoryName", c.description as "categoryDescription"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE p."isActive" = true ${categoryId ? `AND p."categoryId" = ${categoryId}::uuid` : ''}
      ORDER BY RANDOM()
      LIMIT ${limit}
    `;

    return products as ProductResponseDto[];
  }

  /**
   * Busca produtos por categoria para o e-commerce
   */
  async findProductsByCategory(categoryId: string, query: EcommerceProductsDto): Promise<PaginatedProductsResponseDto> {
    const { search, sortBy = SortOrder.RANDOM, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Se for ordenação aleatória, usar query raw
    if (sortBy === SortOrder.RANDOM) {
      const searchCondition = search && search.trim() !== '' 
        ? `AND (LOWER(p.name) LIKE LOWER('%${search.trim()}%') OR LOWER(p.description) LIKE LOWER('%${search.trim()}%'))`
        : '';

      const [products, totalResult] = await Promise.all([
        this.prisma.$queryRaw`
          SELECT p.*, c.id as "categoryId", c.name as "categoryName", c.description as "categoryDescription"
          FROM "Product" p
          LEFT JOIN "Category" c ON p."categoryId" = c.id
          WHERE p."isActive" = true AND p."categoryId" = ${categoryId}::uuid ${this.prisma.$queryRawUnsafe(searchCondition)}
          ORDER BY RANDOM()
          LIMIT ${limit}
          OFFSET ${skip}
        `,
        this.prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM "Product" p
          WHERE p."isActive" = true AND p."categoryId" = ${categoryId}::uuid ${this.prisma.$queryRawUnsafe(searchCondition)}
        `
      ]);

      const total = Number((totalResult as any[])[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);
      const hasPreviousPage = page > 1;
      const hasNextPage = page < totalPages;

      return {
        data: products as ProductResponseDto[],
        total,
        page,
        limit,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      };
    }

    // Construir condições de filtro para ordenação não-aleatória
    const where: any = {
      categoryId,
      isActive: true, // Apenas produtos ativos
    };

    // Aplicar filtro de busca apenas se fornecido
    if (search && search.trim() !== '') {
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    // Definir ordenação baseada no sortBy
    const orderBy = this.getOrderBy(sortBy);

    // Buscar produtos da categoria com filtros, paginação e ordenação
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      data: products,
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
  }

  /**
   * Busca produtos por termo de busca para o e-commerce
   */
  async searchProducts(search: string, query: EcommerceProductsDto): Promise<PaginatedProductsResponseDto> {
    const { categoryId, sortBy = SortOrder.RANDOM, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Se for ordenação aleatória, usar query raw
    if (sortBy === SortOrder.RANDOM) {
      const categoryCondition = categoryId ? `AND p."categoryId" = '${categoryId}'` : '';

      const [products, totalResult] = await Promise.all([
        this.prisma.$queryRaw`
          SELECT p.*, c.id as "categoryId", c.name as "categoryName", c.description as "categoryDescription"
          FROM "Product" p
          LEFT JOIN "Category" c ON p."categoryId" = c.id
          WHERE p."isActive" = true AND (LOWER(p.name) LIKE LOWER('%${search.trim()}%') OR LOWER(p.description) LIKE LOWER('%${search.trim()}%')) ${this.prisma.$queryRawUnsafe(categoryCondition)}
          ORDER BY RANDOM()
          LIMIT ${limit}
          OFFSET ${skip}
        `,
        this.prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM "Product" p
          WHERE p."isActive" = true AND (LOWER(p.name) LIKE LOWER('%${search.trim()}%') OR LOWER(p.description) LIKE LOWER('%${search.trim()}%')) ${this.prisma.$queryRawUnsafe(categoryCondition)}
        `
      ]);

      const total = Number((totalResult as any[])[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);
      const hasPreviousPage = page > 1;
      const hasNextPage = page < totalPages;

      return {
        data: products as ProductResponseDto[],
        total,
        page,
        limit,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      };
    }

    // Construir condições de filtro para ordenação não-aleatória
    const where: any = {
      isActive: true, // Apenas produtos ativos
      OR: [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ],
    };

    // Aplicar filtro de categoria apenas se fornecido
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Definir ordenação baseada no sortBy
    const orderBy = this.getOrderBy(sortBy);

    // Buscar produtos com busca, filtros, paginação e ordenação
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      data: products,
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
  }

  /**
   * Helper para definir ordenação baseada no sortBy
   */
  private getOrderBy(sortBy: SortOrder) {
    switch (sortBy) {
      case SortOrder.NEWEST:
        return { createdAt: 'desc' as const };
      case SortOrder.OLDEST:
        return { createdAt: 'asc' as const };
      case SortOrder.PRICE_LOW:
        return { price: 'asc' as const };
      case SortOrder.PRICE_HIGH:
        return { price: 'desc' as const };
      case SortOrder.NAME_ASC:
        return { name: 'asc' as const };
      case SortOrder.NAME_DESC:
        return { name: 'desc' as const };
      case SortOrder.RANDOM:
        // Para ordenação aleatória, usamos uma função SQL
        return { id: 'asc' as const }; // Placeholder - será tratado separadamente
      default:
        return { createdAt: 'desc' as const };
    }
  }
}
