const express = require('express');
const router = express.Router();

const { getAllProducts, getAllProductsStatic } = require("../controllers/products");

router.route('/').get(getAllProducts); // GET /api/v1/products
router.route('/static').get(getAllProductsStatic); // GET /api/v1/products/static — тестовий запит

module.exports = router;
