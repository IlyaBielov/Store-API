const Product = require("../models/product");

// async через await Product.find(); помилки ловить express-async-errors
const getAllProductsStatic = async (req, res) => {
    const search = 'aaa';

    const products = await Product.find({ // filter: назва містить search, будь-який регістр
        name: { $regex:search, $options: 'i' }, // $regex — підрядок, а не точний збіг; 'i' — ігнор регістру
    })
    res.status(200).json({ products, nbHits: products.length }) // find завжди дає масив, навіть []
}

const getAllProducts = async (req, res) => {
    const { featured, company, name } = req.query // беремо лише відомі параметри — решта (page тощо) ігнорується
    const queryObj = {} // filter збираємо вручну, а не передаємо req.query як є

    if (featured) {
        queryObj.featured = featured === 'true' // рядок з URL → boolean
    }

    if (company) {
        queryObj.company = company // точний збіг, регістр важливий: 'IKEA' ≠ 'ikea'
    }

    if (name) {
        queryObj.name = { $regex: name, $options: 'i' } // підрядок без регістру: 'albany' знайде 'Albany Sectional'
    }

    const products = await Product.find(queryObj) // порожній queryObj = всі продукти
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
    getAllProductsStatic,
    getAllProducts,
}
