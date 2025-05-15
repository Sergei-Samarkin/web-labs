const dotenv = require('dotenv');
dotenv.config();

module.exports = function apiKeyMiddleware(req, res, next) {
  const clientKey = req.headers['x-api-key'];
  const serverKey = process.env.API_KEY;

  if (!clientKey || clientKey !== serverKey) {
    return res.status(403).json({ message: 'Недействительный или отсутствующий API-ключ' });
  }

  next();
};