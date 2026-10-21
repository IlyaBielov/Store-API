const Product = require("../models/product");

// async через await Product.find(); помилки ловить express-async-errors
const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({ // filter: лише документи з featured: true
        featured: true
    })
    res.status(200).json({ products, nbHits: products.length }) // find завжди дає масив, навіть []
}

const getAllProducts = async (req, res) => {
    res.status(200).json({ msg: 'Products route' })
}

module.exports = {
    getAllProductsStatic,
    getAllProducts,
}
