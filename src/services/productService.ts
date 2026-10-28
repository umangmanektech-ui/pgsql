import type { Category, Prisma, Product } from "@prisma/client";
import { prisma } from "../config/db.js";

export interface CreateProductInput {
  name: string;
  description?: string | null;
  price: number | string;
  stock?: number;
  categoryId?: number | null;
}

export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  price?: number | string;
  stock?: number;
  categoryId?: number | null;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  categoryName?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  includeCategory?: boolean;
}

export type ProductWithCategory = Product & {
  category: Category | null;
};

export interface RawProductJoin {
  productId: number;
  productName: string;
  price: string;
  stock: number;
  categoryId: number | null;
  categoryName: string | null;
  categoryDescription: string | null;
}

export class ProductService {
  /**
   * Create a new product (optionally linked to a Category)
   */
  async create(data: CreateProductInput): Promise<ProductWithCategory> {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price.toString(),
        stock: data.stock ?? 0,
        categoryId: data.categoryId ?? null,
      },
      include: {
        category: true, // Relational JOIN: return product with linked category
      },
    });
  }

  /**
   * Get all products with optional filters and Category JOIN
   */
  async getAll(filters: ProductFilters = {}): Promise<{
    total: number;
    limit: number;
    offset: number;
    products: ProductWithCategory[];
  }> {
    const {
      search,
      categoryId,
      categoryName,
      minPrice,
      maxPrice,
      limit = 50,
      offset = 0,
      includeCategory = true,
    } = filters;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (categoryName) {
      // JOIN condition: filter products by joined category name
      where.category = {
        name: {
          contains: categoryName,
          mode: "insensitive",
        },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice.toString();
      if (maxPrice !== undefined) where.price.lte = maxPrice.toString();
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          category: includeCategory,
        },
      }) as Promise<ProductWithCategory[]>,
      prisma.product.count({ where }),
    ]);

    return { total, limit, offset, products };
  }

  /**
   * Get single product by ID with Category JOIN
   */
  async getById(id: number): Promise<ProductWithCategory | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true, // Prisma Relational JOIN
      },
    });
  }

  /**
   * Update an existing product
   */
  async update(id: number, data: UpdateProductInput): Promise<ProductWithCategory> {
    const updatePayload: Prisma.ProductUpdateInput = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.price !== undefined) updatePayload.price = data.price.toString();
    if (data.stock !== undefined) updatePayload.stock = data.stock;
    if (data.categoryId !== undefined) {
      if (data.categoryId === null) {
        updatePayload.category = { disconnect: true };
      } else {
        updatePayload.category = { connect: { id: data.categoryId } };
      }
    }

    return await prisma.product.update({
      where: { id },
      data: updatePayload,
      include: {
        category: true, // Relational JOIN
      },
    });
  }

  /**
   * Delete a product by ID
   */
  async delete(id: number): Promise<Product> {
    return await prisma.product.delete({
      where: { id },
    });
  }

  /**
   * DEMONSTRATION: Explicit SQL LEFT JOIN via Prisma $queryRaw
   * Executes a direct SQL JOIN between 'products' and 'categories'
   */
  async getProductsWithRawSqlJoin(): Promise<RawProductJoin[]> {
    return await prisma.$queryRaw<RawProductJoin[]>`
      SELECT 
        p.id AS "productId",
        p.name AS "productName",
        p.price,
        p.stock,
        c.id AS "categoryId",
        c.name AS "categoryName",
        c.description AS "categoryDescription"
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `;
  }
}

export const productService = new ProductService();
