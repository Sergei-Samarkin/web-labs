import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import morgan from 'morgan';
import setupSwagger from './swagger';
import authRoutes from './routes/auth';
import eventsRouter from './routes/events';
import pubRoutes from './routes/public';
import { sequelize, authenticateDB } from './config/db';
import configurePassport from './config/passport';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
configurePassport(passport);
app.use(passport.initialize());
app.use(morgan(':method :url'));

const PORT = process.env.PORT || 3000;

app.use('/events', eventsRouter);
app.use('/auth', authRoutes);
app.use('/public', pubRoutes);

setupSwagger(app);

app.get('/', (req, res) => {
    res.json({ message: 'Сервер работает' });
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
