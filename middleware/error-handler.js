// 4 аргументи — так Express розпізнає error-middleware (next потрібен, хоч і не юзаємо)
const errorHandlerMiddleware = async (err, req, res, next) => {
  console.log(err)
  return res.status(500).json({ msg: 'Something went wrong, please try again' })
}

module.exports = errorHandlerMiddleware
