# Express + PostgreSQL + Prisma 7 (Products & Categories with JOIN Queries)

A clean, modular **Express.js** REST API with **PostgreSQL**, **Prisma 7**, and **TypeScript**, demonstrating **multiple tables** and **relational & SQL JOIN queries**.

---

## 📁 Simple Express Folder Structure

```text
d:/postgress/
├── prisma/
│   └── schema.prisma             # Schema with Product & Category tables (Relations)
├── prisma.config.ts              # Prisma 7 global config (datasource URL)
├── src/
│   ├── config/
│   │   └── db.ts                 # Prisma 7 Client + @prisma/adapter-pg setup
│   ├── controllers/
│   │   ├── productController.ts  # Product Request/Response handlers
│   │   └── categoryController.ts # Category Request/Response handlers
│   ├── services/
│   │   ├── productService.ts     # Product queries + Relational & SQL joins
│   │   └── categoryService.ts    # Category queries + 1-to-Many & Aggregate joins
│   ├── routes/
│   │   ├── productRoutes.ts      # Product REST routes (including /sql-join)
│   │   └── categoryRoutes.ts     # Category REST routes
│   ├── middlewares/
│   │   └── errorHandler.ts       # Centralized error handler
│   ├── app.ts                    # Express app configuration & middlewares
│   └── server.ts                 # Server entry point & lifecycle management
├── .env                          # PostgreSQL database URL
├── package.json                  # Scripts & dependencies
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 🗄️ Relational Schema with Tables

Defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

```prisma
model Category {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("categories")
}

model Product {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  price       Decimal   @db.Decimal(10, 2)
  stock       Int       @default(0)
  categoryId  Int?      @map("category_id")
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("products")
}
```

---

## 🔗 How JOIN Queries are Implemented

### 1. Prisma Relational Eager JOIN (`include: { category: true }`)
Fetches products along with their linked category details:
```typescript
const products = await prisma.product.findMany({
  include: {
    category: true, // Performs a JOIN with the categories table
  },
});
```

### 2. Reverse One-to-Many JOIN & Aggregate Count
Fetches each category with all its associated products and product counts:
```typescript
const categories = await prisma.category.findMany({
  include: {
    products: true,
    _count: { select: { products: true } }, // Aggregate join
  },
});
```

### 3. Filtered JOIN (WHERE condition across relations)
Filters products based on attributes of the joined category:
```typescript
const products = await prisma.product.findMany({
  where: {
    category: {
      name: { contains: "Electronics", mode: "insensitive" },
    },
  },
  include: { category: true },
});
```

### 4. Direct SQL LEFT JOIN (via `prisma.$queryRaw`)
Endpoint `GET /api/products/sql-join`:
```typescript
const result = await prisma.$queryRaw`
  SELECT 
    p.id AS "productId",
    p.name AS "productName",
    p.price,
    p.stock,
    c.id AS "categoryId",
    c.name AS "categoryName"
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  ORDER BY p.id DESC
`;
```

---

## 🌐 REST API Endpoints

### Products
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/products` | Create product (optional `categoryId`) |
| **GET** | `/api/products` | List all products (with Category JOIN) |
| **GET** | `/api/products/:id` | Get single product (with Category details) |
| **GET** | `/api/products/sql-join` | Execute raw SQL `LEFT JOIN` between products and categories |
| **PUT** | `/api/products/:id` | Update product fields and category association |
| **DELETE** | `/api/products/:id` | Delete product by ID |

### Categories
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/categories` | Create category (`name`, `description`) |
| **GET** | `/api/categories` | List all categories with product count (Aggregate JOIN) |
| **GET** | `/api/categories/:id` | Get category with all associated products |
| **DELETE** | `/api/categories/:id` | Delete category by ID |

---

## 🚀 Quick Start Guide

### 1. Push Schema to PostgreSQL
```bash
npm run prisma:push
```

### 2. Start Express Server
```bash
npm run dev
```

### 3. Test Endpoints with cURL

```bash
# 1. Create a Category
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics", "description": "Computers and gadgets"}'

# 2. Create a Product linked to Category ID 1
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Mechanical Keyboard", "price": 89.99, "stock": 40, "categoryId": 1}'

# 3. Get Products with Category JOIN
curl http://localhost:3000/api/products

# 4. Get Category with all its Products joined
curl http://localhost:3000/api/categories/1

# 5. Run explicit SQL LEFT JOIN
curl http://localhost:3000/api/products/sql-join
```
