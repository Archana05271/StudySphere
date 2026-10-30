
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let status = Number.isInteger(err.status) ? err.status : 500;
  let message = err.message || 'Something went wrong';

  // JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }

  // MongoDB validation errors
  else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(', ') || message;
  }

  // Invalid MongoDB ID
  else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  }

  // Duplicate MongoDB records
  else if (err.code === 11000) {
    status = 409;
    message = 'Duplicate record';
  }

  // Multer file upload errors
  else if (err.name === 'MulterError') {
    status = 400;

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size must not exceed 20 MB';
    } else {
      message = err.message;
    }
  }

  // Unsupported file format
  else if (err.message === 'Unsupported file format') {
    status = 400;
    message = 'Unsupported file format. Upload PDF, PPT, PPTX, DOC, DOCX, ZIP, TXT, XLSX or CSV files.';
  }

  // Handle internal server errors
  if (status >= 500) {
    console.error(
      `[error] ${req.method} ${req.originalUrl} -> ${err.stack || err.message}`
    );

    message = 'Internal server error';
  }

  return res.status(status).json({
    success: false,
    message
  });
};

export default errorHandler;
