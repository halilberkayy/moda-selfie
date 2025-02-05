const Joi = require('joi');

const schemas = {
  photoAnalysis: Joi.object({
    photo: Joi.string()
      .required()
      .min(100)
      .message('Geçerli bir fotoğraf verisi gereklidir'),
  }),

  productQuery: Joi.object({
    tags: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .message('En az bir etiket gereklidir'),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .message('Limit 1-50 arasında olmalıdır'),
    
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .message('Sayfa numarası 1 veya daha büyük olmalıdır'),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const validationResult = schema.validate(req.body);
    
    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.details[0].message
      });
    }
    
    req.validatedData = validationResult.value;
    next();
  };
};

module.exports = {
  validate,
  schemas
}; 