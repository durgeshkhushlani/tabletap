function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found: ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Mongoose validation / bad ObjectId errors are client mistakes, not server faults.
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    const message = err.name === 'CastError' ? `Invalid ${err.path}` : Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : err.status || 500;
  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
