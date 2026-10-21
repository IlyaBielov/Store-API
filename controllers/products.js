const Product = require("../models/product");

// async через await Product.find(); помилки ловить express-async-errors
const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({ // filter: лише документи з featured: true
        featured: true
    })
    res.status(200).json({ products, nbHits: products.length }) // find завжди дає масив, навіть []
}

const getAllProducts = async (req, res) => {
    const products = await Product.find(req.query) // ?featured=true → { featured: 'true' }, Mongoose приводить тип за схемою
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
    getAllProductsStatic,
    getAllProducts,
}
