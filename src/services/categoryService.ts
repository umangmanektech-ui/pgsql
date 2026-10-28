import type { Category, Prisma, Product } from "@prisma/client";
import { prisma } from "../config/db.js";

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
}

export type CategoryWithCount = Category & {
  _count: {
    products: number;
  };
};

export type CategoryWithProducts = Category & {
  products: Product[];
};

export class CategoryService {
  /**
   * Create a new category
   */
  async create(data: CreateCategoryInput): Promise<Category> {
    return await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  /**
   * Get all categories with product counts (Aggregate JOIN)
   */
  async getAll(): Promise<CategoryWithCount[]> {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Get single category by ID with all its products (One-to-Many JOIN)
   */
  async getByIdWithProducts(id: number): Promise<CategoryWithProducts | null> {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Update category by ID
   */
  async update(id: number, data: UpdateCategoryInput): Promise<Category> {
    const updateData: Prisma.CategoryUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    return await prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete category by ID
   */
  async delete(id: number): Promise<Category> {
    return await prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryService = new CategoryService();
