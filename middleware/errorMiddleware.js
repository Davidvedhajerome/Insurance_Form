// Custom error handler
const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Internal Server Error" });
};

module.exports = errorMiddleware;
