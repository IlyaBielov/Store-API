const Product = require("../models/product");

// async через await Product.find(); помилки ловить express-async-errors
const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({}).sort("-name price"); // "-" = спадання; price — тай-брейк при однаковому name
    res.status(200).json({ products, nbHits: products.length }) // find завжди дає масив, навіть []
}

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort } = req.query // беремо лише відомі параметри — решта (page тощо) ігнорується
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

    let result = Product.find(queryObj) // без await: це Query, до нього ще чіпляємо .sort()
    if (sort) {
        const sortList = sort.split(',').join(' ') // URL: -name,price → Mongoose: '-name price'
        result = result.sort(sortList)
    } else {
        result = result.sort('createdAt') // порядок за замовчуванням, коли sort не передали
    }
    const products = await result // лише тут запит іде в MongoDB
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
    getAllProductsStatic,
    getAllProducts,
}
