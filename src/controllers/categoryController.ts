import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/categoryService.js";

export class CategoryController {
  /**
   * POST /api/categories
   * Create a new category
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;

      if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Category 'name' is required" });
      }

      const category = await categoryService.create({
        name: name.trim(),
        description: description ? String(description).trim() : null,
      });

      return res.status(201).json({
        message: "Category created successfully",
        category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/categories
   * List all categories with product count (Aggregate JOIN)
   */
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAll();
      return res.json({
        count: categories.length,
        categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/categories/:id
   * Get category with all associated products (One-to-Many JOIN)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }

      const category = await categoryService.getByIdWithProducts(id);

      if (!category) {
        return res.status(404).json({ error: `Category with ID ${id} not found` });
      }

      return res.json(category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/categories/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }

      const deleted = await categoryService.delete(id);

      return res.json({
        message: "Category deleted successfully",
        category: deleted,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
