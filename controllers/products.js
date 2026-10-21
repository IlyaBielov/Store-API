const Product = require("../models/product");
const BadRequestError = require("../errors/bad-request");

// async через await Product.find(); помилки ловить express-async-errors
const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({}).select('name price'); // лише ці поля (+ _id завжди)
    res.status(200).json({ products, nbHits: products.length }) // find завжди дає масив, навіть []
}

// Whitelist полів: що можна сортувати / повертати — решта з URL відхиляється з 400
const SORTABLE_FIELDS = ['name', 'price', 'rating', 'company', 'featured', 'createdAt']
const SELECTABLE_FIELDS = ['name', 'price', 'rating', 'company', 'featured', 'createdAt']
const MAX_LIMIT = 100 // щоб ?limit=1000000 не витягнув усю колекцію одним запитом

// Повторений параметр (?sort=a&sort=b) Express віддає масивом — .split на ньому впаде
const assertSingleValues = (query) => {
    Object.entries(query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            throw new BadRequestError(`Query param "${key}" must be passed only once`)
        }
    })
}

// "-name,price" → ['-name', 'price'] з перевіркою кожного поля по whitelist
const parseFieldList = (value, allowed, paramName, { allowDesc }) => {
    return value.split(',').map((item) => {
        const field = allowDesc && item.startsWith('-') ? item.slice(1) : item
        if (!allowed.includes(field)) {
            throw new BadRequestError(`Invalid field in "${paramName}": "${item}"`)
        }
        return item
    })
}

// page/limit: якщо передали — має бути ціле число ≥ 1, інакше 400
const parsePositiveInt = (value, paramName, defaultValue) => {
    if (value === undefined) return defaultValue
    const number = Number(value)
    if (!Number.isInteger(number) || number < 1) {
        throw new BadRequestError(`"${paramName}" must be a positive integer`)
    }
    return number
}

// Спецсимволи regex екрануємо: name=( не ламає запит, name=. шукає крапку, а не "будь-що"
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getAllProducts = async (req, res) => {
    assertSingleValues(req.query)

    const { featured, company, name, sort, fields, numericFilters } = req.query // беремо лише відомі параметри — решта ігнорується
    const queryObj = {} // filter збираємо вручну, а не передаємо req.query як є

    if (featured) {
        if (featured !== 'true' && featured !== 'false') {
            throw new BadRequestError('"featured" must be true or false')
        }
        queryObj.featured = featured === 'true' // рядок з URL → boolean
    }

    if (company) {
        queryObj.company = company // точний збіг, регістр важливий: 'IKEA' ≠ 'ikea'
    }

    if (name) {
        queryObj.name = { $regex: escapeRegex(name), $options: 'i' } // підрядок без регістру: 'albany' знайде 'Albany Sectional'
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
        const options = ['price', 'rating'] // whitelist: лише числові поля схеми
        numericFilters.split(',').forEach((rawFilter) => {
            // price>40 → price-$gt-40 → ['price', '$gt', '40']
            const [field, operator, value, ...extra] = rawFilter.replace(regEx, (match) => `-${operatorMap[match]}-`).split('-')
            const number = Number(value)
            // Що завгодно, крім "поле з whitelist + оператор + число", — помилка клієнта
            if (!options.includes(field) || !operator || !value || extra.length || !Number.isFinite(number)) {
                throw new BadRequestError(`Invalid numeric filter: "${rawFilter}"`)
            }
            // { price: { $gt: 40 } }; [operator] — computed key; spread зберігає діапазон price>40,price<100
            queryObj[field] = { ...queryObj[field], [operator]: number }
        })
    }

    let result = Product.find(queryObj) // без await: це Query, до нього ще чіпляємо .sort()
    if (sort) {
        const sortList = parseFieldList(sort, SORTABLE_FIELDS, 'sort', { allowDesc: true }).join(' ') // URL: -name,price → Mongoose: '-name price'
        result = result.sort(`${sortList} _id`) // _id — стабільний порядок для пагінації
    } else {
        result = result.sort('createdAt _id') // _id — тай-брейк: без нього сторінки дублюють продукти
    }

    if (fields) {
        // лише включення полів: змішати name,-price MongoDB не дозволяє
        const fieldsList = parseFieldList(fields, SELECTABLE_FIELDS, 'fields', { allowDesc: false }).join(' ')
        result = result.select(fieldsList) // projection: БД віддає лише ці поля, не міняє фільтр
    }

    const page = parsePositiveInt(req.query.page, 'page', 1)
    const limit = Math.min(parsePositiveInt(req.query.limit, 'limit', 10), MAX_LIMIT)
    const skip = (page - 1) * limit // page=1 → 0, page=2 → пропускаємо перші limit

    result = result.skip(skip).limit(limit)

    const products = await result // лише тут запит іде в MongoDB
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
    getAllProductsStatic,
    getAllProducts,
}
