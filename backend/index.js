const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
require('./config/passport');
const morgan = require('morgan');
const setupSwagger = require('./swagger');
const authRoutes = require('./routes/auth');
const eventsRouter = require('./routes/events');
const pubRoutes = require('./routes/public');
const rateLimit = require('express-rate-limit');
//const logoutRoute = require('./routes/logout')
//const apiKeyMiddleware = require('./middleware/apiKey.js');
//const apiKeyMiddleware = require('./middleware/apiKey'); 
//const userRoutes = require('./routes/users.js');

const globalLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 часа
  max: 100, // максимум 100 запросов в день с одного IP
  message: {
    message: 'Превышен лимит запросов. Пожалуйста, попробуйте позже.',
  },
});


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());
//app.use(apiKeyMiddleware);
app.use(morgan(':method :url'));
app.use(globalLimiter);

const PORT = process.env.PORT || 3000;
const { sequelize, authenticateDB} = require('./config/db.js');
//authenticateDB();

const User = require('./models/user');
const Event = require('./models/event');

//app.use('/users', userRoutes);
app.use('/events', eventsRouter);
app.use('/auth', authRoutes);
app.use('/public', pubRoutes);
//app.use('logout', logoutRoute)

setupSwagger(app);

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