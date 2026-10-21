// 4 аргументи — так Express розпізнає error-middleware (next потрібен, хоч і не юзаємо)
const errorHandlerMiddleware = async (err, req, res, next) => {
  // Наші очікувані помилки (BadRequestError) — клієнту зрозумілий текст і їхній статус
  if (err.statusCode) {
    return res.status(err.statusCode).json({ msg: err.message })
  }
  // Страховка: Mongoose не зміг привести значення до типу схеми — це теж вина запиту
  if (err.name === 'CastError') {
    return res.status(400).json({ msg: `Invalid value for ${err.path}` })
  }
  console.log(err)
  return res.status(500).json({ msg: 'Something went wrong, please try again' })
}

module.exports = errorHandlerMiddleware
