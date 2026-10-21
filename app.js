require('dotenv').config(); // Завантажує змінні з .env у process.env (MONGO_URI, PORT)
require('express-async-errors'); // async-помилки самі йдуть в errorHandler, без try/catch

const express = require('express');
const app = express();

const connectDB = require('./db/connect');
const productsRouter = require('./routes/products');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// middleware
app.use(express.json()); // парсить JSON-тіло запиту в req.body

// routes
app.get('/', (req, res) => {
    res.send(`
        <h1>Store API</h1>
        <a href="/api/v1/products">products route</a>
    `)
})


// products route
app.use('/api/v1/products', productsRouter); // усі шляхи router'а з цим префіксом

// errors middleware — строго після роутів: спрацьовують, коли ніхто не відповів
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI); // без БД сервер не стартує
        console.log('Connected to the database...')

        app.listen(port, () => console.log(`Server is listening on port ${port}...`));
    } catch (error) {
        console.log(error);
    }
}

start()
