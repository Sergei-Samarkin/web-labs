const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../models/user');
const dotenv = require('dotenv');
const router = express.Router();

dotenv.config();

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
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Неверный запрос или email уже существует
 */

router.post("/register",async (req, res) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Заполните все поля' });
        }

        try {
            const existing = await User.findOne({ where: { email } });
            if (existing) {
            return res.status(400).json({ message: 'Email уже зарегистрирован' });
            }

            const user = await User.create({ name, email, password });
            res.status(201).json({ message: 'Пользователь зарегистрирован', user: { id: user.id, name: user.name, email: user.email } });
        } catch (err) {
            res.status(500).json({ message: 'Ошибка регистрации', error: err.message });
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

router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Заполните все поля' });
        }
        try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Неверный email или пароль' });
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Неверный email или пароль' });
    
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        } catch (err) {
        res.status(500).json({ message: 'Ошибка авторизации', error: err.message });
        }
  });

module.exports = router;
