import { Router } from "express";
import { categoryController } from "../controllers/categoryController.js";

export const categoryRouter = Router();

// Category CRUD & Joins
categoryRouter.post("/", (req, res, next) => categoryController.create(req, res, next));
categoryRouter.get("/", (req, res, next) => categoryController.getAll(req, res, next));
categoryRouter.get("/:id", (req, res, next) => categoryController.getById(req, res, next));
categoryRouter.delete("/:id", (req, res, next) => categoryController.delete(req, res, next));
