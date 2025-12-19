// @desc    Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    // Log to console for dev
    console.error(err.stack);
  
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      error = { message, statusCode: 404 };
    }
  
    // Mongoose duplicate key
    if (err.code === 11000) {
      const message = 'Duplicate field value entered';
      error = { message, statusCode: 400 };
    }
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      error = { message, statusCode: 400 };
    }
  
    // Multer errors
    if (err.name === 'MulterError') {
      let message = 'File upload error';
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File size too large. Maximum 5MB allowed.';
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        message = 'Too many files. Maximum 10 files allowed.';
      }
      error = { message, statusCode: 400 };
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      const message = 'Invalid token';
      error = { message, statusCode: 401 };
    }
  
    // JWT expired
    if (err.name === 'TokenExpiredError') {
      const message = 'Token expired';
      error = { message, statusCode: 401 };
    }
  
    // Default error
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  };
  
  export default errorHandler;