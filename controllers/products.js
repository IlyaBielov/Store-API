const Product = require("../models/product");

// async через await Product.find(); помилки ловить express-async-errors
const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({ // filter: лише документи з featured: true
        featured: true
    })
    res.status(200).json({ products, nbHits: products.length }) // find завжди дає масив, навіть []
}

const getAllProducts = async (req, res) => {
    const { featured } = req.query // беремо лише відомі параметри — решта (page тощо) ігнорується
    const queryObj = {} // filter збираємо вручну, а не передаємо req.query як є

    if (featured) {
        queryObj.featured = featured === 'true' // рядок з URL → boolean
    }

    const products = await Product.find(queryObj) // порожній queryObj = всі продукти
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
    getAllProductsStatic,
    getAllProducts,
}
