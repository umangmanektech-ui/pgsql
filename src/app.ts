import express, { Request, Response } from "express";
import { productRouter } from "./routes/productRoutes.js";
import { categoryRouter } from "./routes/categoryRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Documentation Route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Product & Category CRUD API with Express, PostgreSQL & Prisma 7 (with Joins)",
    status: "online",
    endpoints: {
      products: {
        "GET /api/products": "List all products (with Category JOIN, query: ?search=&categoryName=&minPrice=&maxPrice=)",
        "GET /api/products/:id": "Get product by ID (with Category JOIN)",
        "GET /api/products/sql-join": "Demonstrates an explicit SQL LEFT JOIN via Prisma $queryRaw",
        "POST /api/products": "Create product { name, description, price, stock, categoryId }",
        "PUT /api/products/:id": "Update product { name, description, price, stock, categoryId }",
        "DELETE /api/products/:id": "Delete product by ID",
      },
      categories: {
        "GET /api/categories": "List all categories with products count (Aggregate JOIN)",
        "GET /api/categories/:id": "Get category with all its products (One-to-Many JOIN)",
        "POST /api/categories": "Create category { name, description }",
        "DELETE /api/categories/:id": "Delete category by ID",
      },
    },
  });
});

// Mount Routes
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Central Error Handling Middleware
app.use(errorHandler);

export default app;
