# Store API

A REST API for a product catalog, built with Express and MongoDB (Mongoose). It supports filtering, sorting, field selection and pagination. Built while following the Store API section of John Smilga's Node.js / Express Udemy course, with extra input validation on top.

## Features

- **Filtering:**
  - `featured` (true/false)
  - `company` (exact match)
  - `name` (case-insensitive substring; regex special characters are escaped)
- **Numeric filters:** `numericFilters=price>40,rating>=4` works on `price` and `rating` and supports the operators `<`, `<=`, `=`, `>`, `>=`. Ranges such as `price>40,price<100` are combined.
- **Sorting:** `sort=-price,name` sorts by whitelisted fields. `_id` is added as a tie-breaker so the order stays stable across pages.
- **Field selection:** `fields=name,price` returns only the whitelisted fields you ask for.
- **Pagination:** `page` and `limit` (default 10, max 100).
- **Validation:** bad input returns `400 { msg }` instead of a silent empty result or a 500. This includes unknown sort or select fields, a malformed numeric filter, a non-integer page or limit, and a repeated query param.

## Tech stack

Node.js, Express 4, MongoDB Atlas, Mongoose 9, express-async-errors, dotenv.

## Getting started

```bash
npm install
```

Create a `.env` file:

```
MONGO_URI=<your MongoDB connection string>
PORT=5000
```

Seed the database with the sample products in `products.json`. This deletes the existing products and inserts 23 new ones:

```bash
node populate.js
```

Start the server:

```bash
npm start
```

## API

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| GET    | `/api/v1/products`        | Products with query options below |
| GET    | `/api/v1/products/static` | Fixed test query (name, price)    |

Query parameters for `/api/v1/products`:

| Param            | Example                  |
| ---------------- | ------------------------ |
| `featured`       | `true`                   |
| `company`        | `ikea`                   |
| `name`           | `albany`                 |
| `numericFilters` | `price>40,rating>=4`     |
| `sort`           | `-price,name`            |
| `fields`         | `name,price,company`     |
| `page` / `limit` | `page=2&limit=5`         |

Example:

```
GET /api/v1/products?company=ikea&numericFilters=price>30&sort=-price&fields=name,price&page=1&limit=5
```

Response: `200 { products: [...], nbHits }`

## Project structure

```
app.js                    # app setup, DB connection, middleware order
populate.js               # seed script (products.json → MongoDB)
models/product.js         # Product schema (validation, enum for company)
routes/products.js
controllers/products.js   # query building, whitelists, validation
middleware/               # not-found, error-handler
errors/                   # BadRequestError
```
