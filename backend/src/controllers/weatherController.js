const weatherService = require('../services/weatherService');
const { AppError } = require('../utils/errorHandler');

exports.getWeather = async (req, res, next) => {
  try {
    const { city } = req.query;
    const weather = await weatherService.getWeather(city || process.env.DEFAULT_CITY);
    res.json(weather);
  } catch (error) {
    next(new AppError(error.message, error.statusCode || 500));
  }
};