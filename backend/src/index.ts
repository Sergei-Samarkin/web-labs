import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import morgan from 'morgan';
import setupSwagger from './swagger';
import authRoutes from '@/routes/auth';
import eventsRouter from '@/routes/events';
import pubRoutes from '@/routes/public';
import { sequelize, authenticateDB } from '@/config/db';
import configurePassport from '@/config/passport';
import path from 'path';
import moduleAlias from 'module-alias';

// Set up module aliases for runtime
moduleAlias.addAliases({
    '@': path.join(__dirname, '..', 'src'),
});

dotenv.config();

const app = express();
app.use(express.json());
// Configure CORS to allow credentials and required headers
app.use(cors({
    origin: 'http://localhost:4000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
    });
});

// Global error handler
app.use((err: Error & { statusCode?: number }, req: express.Request, res: express.Response) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: err.name || 'Error',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
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
