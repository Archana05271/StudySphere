
// Removes MongoDB operator keys and unwanted control characters.
function clean(value) {
  if (Array.isArray(value)) {
    return value.map(clean);
  }

  if (value && typeof value === 'object') {
    const sanitized = {};

    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }

      sanitized[key] = clean(value[key]);
    }

    return sanitized;
  }

  if (typeof value === 'string') {
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  }

  return value;
}

export default function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = clean(req.body);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = clean(req.params);
  }

  // Express 4 may expose req.query through a getter.
  // Sanitize query values without replacing req.query.
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      const sanitized = clean({ [key]: req.query[key] });
      if (Object.hasOwn(sanitized, key)) {
        req.query[key] = sanitized[key];
      } else {
        delete req.query[key];
      }
    }
  }

  next();
}
