require('dotenv').config(); // окремий скрипт — свій dotenv, app.js тут не запускається

const connectDB = require('./db/connect');
const Product = require('./models/product');

const jsonProducts = require('./products.json'); // require сам парсить JSON у масив


const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        await Product.deleteMany() // без фільтра — видаляє все, щоб не було дублів
        await Product.create(jsonProducts) // масив → вставка всіх, з валідацією схеми

        console.log('Success.')
        process.exit(0) // інакше відкрите з'єднання Mongoose тримає процес живим
    } catch (err) {
        console.log(err);
        process.exit(1) // ненульовий код = скрипт завершився з помилкою
    }
}

start();
