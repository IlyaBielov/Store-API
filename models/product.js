const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'product name must be provided'] // [умова, текст помилки]
    },
    price: {
        type: Number,
        required: [true, 'product price must be provided'],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    createdAt: {
        type: Date,
        default: Date.now, // функція, не Date.now() — час береться на кожен документ
    },
    company: {
        type: String,
        enum: { // дозволені лише ці значення, інакше ValidationError
            values: ['ikea', 'liddy', 'caressa', 'marcos'],
            message: '{VALUE} is not supported', // {VALUE} Mongoose підставить сам
        },
    },
})

// JSDoc-тип для WebStorm: поля моделі виводяться зі схеми, а не з TS-перевантажень навмання
/** @type {mongoose.Model<mongoose.InferSchemaType<typeof productSchema>>} */
module.exports = mongoose.model('Product', productSchema); // колекція в БД: 'products'
