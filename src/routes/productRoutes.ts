import { Router } from "express";
import { productController } from "../controllers/productController.js";

export const productRouter = Router();

// Dedicated SQL JOIN endpoint demonstration
productRouter.get("/sql-join", (req, res, next) => productController.getRawSqlJoin(req, res, next));

// RESTful CRUD routes for Products with relational joins
productRouter.post("/", (req, res, next) => productController.create(req, res, next));
productRouter.get("/", (req, res, next) => productController.getAll(req, res, next));
productRouter.get("/:id", (req, res, next) => productController.getById(req, res, next));
productRouter.put("/:id", (req, res, next) => productController.update(req, res, next));
productRouter.delete("/:id", (req, res, next) => productController.delete(req, res, next));
