const BlacklistedToken = require('../models/BlacklistedToken');

module.exports = async function checkBlacklist(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Нет токена' });

  const token = authHeader.split(' ')[1];

  const blacklisted = await BlacklistedToken.findOne({ where: { token } });
  if (blacklisted) {
    return res.status(401).json({ message: 'Токен недействителен (выход из системы)' });
  }

  next();
};