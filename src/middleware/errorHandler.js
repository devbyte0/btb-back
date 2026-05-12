function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
}

module.exports = { errorHandler };
