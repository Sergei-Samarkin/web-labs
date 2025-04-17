const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const { sequelize, authenticateDB} = require('./config/db.js');
//authenticateDB();

app.get('/',(req, res) => {
    res.json({ message: 'Сервер работает'});
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
}).on('error', (err) => {
    console.error('Ошибка запуска сервера:', err.message);
});

const User = require('./models/user');
const Event = require('./models/event');

(async () => {
  await authenticateDB();

  await sequelize.sync({ alter: true }); // или force: true если хочешь всё пересоздавать
  console.log(' Модели синхронизированы');

  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
})();