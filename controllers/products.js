const Product = require("../models/product");

// async через await Product.find(); помилки ловить express-async-errors
const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({}).select('name price'); // лише ці поля (+ _id завжди)
    res.status(200).json({ products, nbHits: products.length }) // find завжди дає масив, навіть []
}

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, fields, numericFilters } = req.query // беремо лише відомі параметри — решта (page тощо) ігнорується
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

    if (numericFilters) {
        const operatorMap = { // людські оператори з URL → оператори MongoDB
            '>' : '$gt',
            '>=' : '$gte',
            '=' : '$eq',
            '<' : '$lt',
            '<=' : '$lte',
        }

        const regEx = /\b(<|>|>=|=|<=)\b/g // \b — оператор між словом і числом: price>=40
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`) // price>40 → price-$gt-40
        const options = ['price', 'rating'] // whitelist: лише числові поля схеми
        filters.split(',').forEach((filter) => {
            const [field, operator, value] = filter.split('-')
            if (options.includes(field)) {
                // { price: { $gt: 40 } }; [operator] — computed key; spread зберігає діапазон price>40,price<100
                queryObj[field] = { ...queryObj[field], [operator]: Number(value) }
            }
        })
    }

    let result = Product.find(queryObj) // без await: це Query, до нього ще чіпляємо .sort()
    if (sort) {
        const sortList = sort.split(',').join(' ') // URL: -name,price → Mongoose: '-name price'
        result = result.sort(sortList.includes('_id') ? sortList : `${sortList} _id`) // _id — стабільний порядок для пагінації
    } else {
        result = result.sort('createdAt _id') // _id — тай-брейк: без нього сторінки дублюють продукти
    }

    if (fields) {
        const fieldsList = fields.split(',').join(' ') // той самий формат, що й у sort
        result = result.select(fieldsList) // projection: БД віддає лише ці поля, не міняє фільтр
    }

    const page = Number(req.query.page) || 1 // рядок → число; NaN чи 0 → дефолт
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit // page=1 → 0, page=2 → пропускаємо перші limit

    result = result.skip(skip).limit(limit)

    const products = await result // лише тут запит іде в MongoDB
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
    getAllProductsStatic,
    getAllProducts,
}
