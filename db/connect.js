const mongoose = require('mongoose')

const connectDB = (url) => {
  return mongoose.connect(url) // повертає Promise — чекаємо його в start()
}

module.exports = connectDB
