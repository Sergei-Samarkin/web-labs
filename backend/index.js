const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const setupSwagger = require('./swagger');
const userRoutes = require('./routes/users');
const eventsRouter = require('./routes/events');


dotenv.config({ path: 'G:/Github/web-labs/backend/.env' });

const app = express();
app.use(express.json());
app.use(cors());


app.use(morgan(':method :url'));

const PORT = process.env.PORT || 3000;
const { sequelize, authenticateDB} = require('./config/db.js');
//authenticateDB();

const User = require('./models/user');
const Event = require('./models/event');

app.use('/users', userRoutes);
app.use('/events', eventsRouter);

setupSwagger(app);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

app.get('/',(req, res) => {
    res.json({ message: 'Сервер работает'});
});


(async () => {
  await authenticateDB();

  await sequelize.sync({ alter: true }); // или force: true если хочешь всё пересоздавать
  console.log(' Модели синхронизированы');

  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('Ошибка запуска сервера:', err.message);
  });
})();