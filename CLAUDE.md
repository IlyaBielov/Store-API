# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

This is section **04-store-api** of a Node.js/Express Udemy course. The directory is a *starter* project that Ilya fills in by coding along with the videos. Files in `controllers/`, `models/`, `routes/`, and `populate.js` begin essentially empty and grow as the section progresses.

A completed reference implementation lives at `../04-store-api/final/` — consult it when you need to see the target architecture or resolve ambiguity about what a lesson is building toward. Do **not** copy-paste from `final/`; Ilya is learning and wants to type the code himself. Offer snippets inline in chat or explain approaches instead.

## Commands

- `npm install` — install dependencies
- `npm start` — runs `nodemon app.js` (auto-reloads on file changes)
- `node populate.js` — seeds MongoDB from `products.json` (deletes existing products first). Requires `MONGO_URI` in `.env`.

There is no lint or test setup in this starter.

## Environment

Create a `.env` file (gitignored) with:
- `MONGO_URI` — MongoDB connection string
- `PORT` — optional, defaults to 3000

## Architecture

Standard layered Express + Mongoose REST API. Once fleshed out:

- **app.js** — entry point. Loads `dotenv` and `express-async-errors` (lets async controllers throw; errors bubble to the error middleware without explicit try/catch). Mounts `productsRouter` at `/api/v1/products`, followed by `notFound` and `errorHandler` middleware. Wraps `app.listen` in an async `start()` that awaits `connectDB(process.env.MONGO_URI)` first — the server should not start without a DB connection.
- **db/connect.js** — thin wrapper returning `mongoose.connect(url, ...)`.
- **models/product.js** — Mongoose schema (`name`, `price`, `featured`, `rating`, `createdAt`, `company` with enum).
- **routes/products.js** — Express router; maps `/` and `/static` to controller functions.
- **controllers/products.js** — the meat of the lesson. `getAllProductsStatic` is a hardcoded example query; `getAllProducts` builds a Mongoose query incrementally from `req.query` params (`featured`, `company`, `name` regex, `numericFilters` like `price>40,rating>=4`, `sort`, `fields`, `page`, `limit`). The pattern: build a `queryObject`, call `Product.find(queryObject)`, then chain `.sort()` / `.select()` / `.skip()` / `.limit()` before awaiting.
- **middleware/** — `not-found.js` (404 fallback) and `error-handler.js` (final error sink, currently returns generic 500).

## Course workflow

- When Ilya asks for help implementing something, explain the concept and show the code inline — don't write it to his files unless he explicitly asks.
- If he's stuck, compare his code against `../final/` mentally and point out specific differences rather than dumping the whole reference.
- Keep explanations tied to what the current lesson is teaching (e.g. query string parsing, Mongoose chaining, async error handling).
