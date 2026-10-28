import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService.js";

export class ProductController {
  /**
   * POST /api/products
   * Create product with optional categoryId link
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, stock, categoryId } = req.body;

      if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Product 'name' is required" });
      }

      if (price === undefined || price === null || isNaN(Number(price))) {
        return res.status(400).json({ error: "Valid product 'price' is required" });
      }

      const product = await productService.create({
        name: name.trim(),
        description: description ? String(description).trim() : null,
        price,
        stock: stock !== undefined ? Number(stock) : 0,
        categoryId: categoryId ? Number(categoryId) : null,
      });

      return res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products
   * Fetch all products with Category JOIN and optional filtering
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, categoryId, categoryName, minPrice, maxPrice, limit, offset, includeCategory } =
        req.query;

      const result = await productService.getAll({
        search: search as string,
        categoryId: categoryId ? Number(categoryId) : undefined,
        categoryName: categoryName as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
        includeCategory: includeCategory !== "false",
      });

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/sql-join
   * Demonstrates an explicit SQL LEFT JOIN via Prisma $queryRaw
   */
  async getRawSqlJoin(_req: Request, res: Response, next: NextFunction) {
    try {
      const rawJoinResults = await productService.getProductsWithRawSqlJoin();
      return res.json({
        type: "Explicit SQL LEFT JOIN query via Prisma $queryRaw",
        count: Array.isArray(rawJoinResults) ? rawJoinResults.length : 0,
        data: rawJoinResults,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   * Fetch a single product by ID with Category JOIN
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const product = await productService.getById(id);

      if (!product) {
        return res.status(404).json({ error: `Product with ID ${id} not found` });
      }

      return res.json(product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id
   * Update product and its linked category
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const { name, description, price, stock, categoryId } = req.body;

      const product = await productService.update(id, {
        name: name ? String(name).trim() : undefined,
        description: description !== undefined ? (description ? String(description).trim() : null) : undefined,
        price: price !== undefined ? price : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : undefined,
      });

      return res.json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const deletedProduct = await productService.delete(id);

      return res.json({
        message: "Product deleted successfully",
        deletedProduct,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
