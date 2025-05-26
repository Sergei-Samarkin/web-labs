/**
 * @swagger
 * tags:
 *   name: Events
 *   description: API для управления мероприятиями
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - date
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор
 *         title:
 *           type: string
 *           description: Название мероприятия
 *         description:
 *           type: string
 *           description: Описание мероприятия
 *         category:
 *           type: DataTypes.ENUM('концерт', 'лекция', 'выставка', 'встреча'),
 *           description: Категория события
 *         date:
 *           type: string
 *           format: date-time
 *           description: Дата и время мероприятия
 *         createdBy:
 *           type: integer
 *           description: ID пользователя-организатора
 *       example:
 *         id: 1
 *         title: Хакатон 2025
 *         description: Технический конкурс
 *         category: Встреча
 *         date: 2025-06-01T12:00:00Z
 *         createdBy: 1
 */

const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const passport = require('passport');
const { Op } = require('sequelize');
const checkBlacklist = require('../middleware/checkBlacklist');

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создать новое мероприятие
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - title
 *               - date
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название мероприятия
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Дата и время мероприятия
 *             example:
 *               title: Хакатон 2025
 *               date: 2026-06-01T12:00:00Z
 *     responses:
 *       201:
 *         description: Мероприятие успешно создано
 *       400:
 *         description: Ошибка валидации
 */

router.post('', 
  passport.authenticate('jwt', { session: false }),
  checkBlacklist,
  async (req, res) => {
  
    try {
      const { title, description, category, date } = req.body;
      const createdBy = req.user.id;

      if (!title || !date) {
        return res.status(400).json({ message: 'Обязательные поля: title, date' });
      }
      const event = await Event.create({ title, description, category, date, createdBy });
      res.status(201).json(event);
    } catch (err) {
      res.status(500).json({ message: 'Ошибка при создании мероприятия', error: err.message });
    }
});


/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновить мероприятие по ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название мероприятия
 *               description:
 *                 type: string
 *                 description: Описание мероприятия
 *               category:
 *                 type: string
 *                 enum: [Концерт, Лекция, Выставка, Встреча]
 *                 description: Категория мероприятия
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Дата и время мероприятия
 *             example:
 *               title: Обновлённое мероприятие
 *               description: Подробности обновления
 *               category: Лекция
 *               date: 2025-06-01T18:00:00Z
 *     responses:
 *       200:
 *         description: Мероприятие успешно обновлено
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка сервера
 */

router.put('/:id', 
  passport.authenticate('jwt', { session: false }),
  checkBlacklist,
  async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }

    const { title, description, category, date } = req.body;
    await event.update({ title, description, category, date });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении мероприятия', error: err.message });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Удалить мероприятие по ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия
 *     responses:
 *       200:
 *         description: Мероприятие успешно удалено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Мероприятие удалено
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при удалении мероприятия
 */

router.delete('/:id', 
  passport.authenticate('jwt', { session: false }),
  checkBlacklist,
  async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }

    await event.destroy();
    res.json({ message: 'Мероприятие удалено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении мероприятия', error: err.message });
  }
});

module.exports = router;
