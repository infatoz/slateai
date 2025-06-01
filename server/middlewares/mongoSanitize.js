const sanitizeMongo = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeMongo(obj[key]);
    }

    if (key.includes('$') || key.includes('.')) {
      delete obj[key];
    }
  }
};

const mongoSanitizeMiddleware = (req, res, next) => {
  sanitizeMongo(req.body);
  sanitizeMongo(req.query);
  sanitizeMongo(req.params);
  next();
};

module.exports = mongoSanitizeMiddleware;
