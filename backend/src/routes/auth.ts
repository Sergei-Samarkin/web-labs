import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '@/models/user';
import dotenv from 'dotenv';
import BlacklistedToken from '@/models/BlacklistedToken';
import passport from 'passport';

dotenv.config();

const router = Router();

interface CustomJwtPayload extends JwtPayload {
    id: number;
    username?: string;
    email?: string;
}

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API для управления пользователями
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор пользователя
 *         name:
 *           type: string
 *           description: Имя пользователя
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя
 *         password:
 *           type: string
 *           description: Пароль пользователя
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата регистрации
 *       example:
 *         id: 1
 *         name: Иван Иванов
 *         email: ivan@example.com
 *         createdAt: 2025-05-14T10:30:00Z
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Создать нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Имя пользователя
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *             example:
 *               name: Иван Иванов
 *               email: ivan@example.com
 *               password: yourpassword123
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Неверный запрос или email уже существует
 */

router.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ message: 'Заполните все поля' });
        return;
    }

    try {
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'Email уже зарегистрирован' });
            return;
        }

        const user = await User.create({ name, email, password });
        res.status(201).json({
            message: 'Пользователь зарегистрирован',
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err: unknown) {
        const error = err as Error;
        res.status(500).json({ message: 'Ошибка регистрации', error: error.message });
        next(error);
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *             example:
 *               email: ivan@example.com
 *               password: yourpassword123
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *       400:
 *         description: Неверный email или пароль / Ошибка в запросе
 *       500:
 *         description: Внутренняя ошибка сервера
 */

router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Заполните все поля' });
        return;
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Неверный email или пароль' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Неверный email или пароль' });
            return;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: '1d',
        });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err: unknown) {
        const error = err as Error;
        res.status(500).json({ message: 'Ошибка авторизации', error: error.message });
        next(error);
    }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход пользователя из системы
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Успешный выход из системы
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Вы успешно вышли из системы
 *       401:
 *         description: Токен недействителен или отсутствует
 *       500:
 *         description: Внутренняя ошибка сервера
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход пользователя из системы
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход из системы
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Вы успешно вышли из системы
 *       401:
 *         description: Токен недействителен или отсутствует
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post(
    '/logout',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization || req.headers.Authorization as string;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ message: 'Токен отсутствует или неверный формат' });
                return;
            }

            const token = authHeader.split(' ')[1];
            
            // Проверяем, не заблокирован ли уже токен
            const existingToken = await BlacklistedToken.findOne({ where: { token } });
            if (existingToken) {
                res.status(200).json({ message: 'Токен уже недействителен' });
                return;
            }

            // Верифицируем токен
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;
            
            await BlacklistedToken.create({
                token,
                expiresAt: new Date(decoded.exp! * 1000),
            });

            res.status(200).json({ message: 'Выход выполнен успешно' });
        } catch (err: unknown) {
            const error = err as Error;
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Недействительный токен' });
            } else {
                res.status(500).json({ message: 'Ошибка при выходе', error: error.message });
                next(error);
            }
        }
    }
);

export default router;
