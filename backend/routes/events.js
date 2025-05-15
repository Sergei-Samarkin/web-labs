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
 *         - createdBy
 *         - location
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
 *         location: Москва
 *         date: 2025-06-01T12:00:00Z
 *         createdBy: 1
 */

const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const passport = require('passport');
const { Op } = require('sequelize');

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создать новое мероприятие
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Мероприятие успешно создано
 *       400:
 *         description: Ошибка валидации
 */

const DAILY_EVENT_LIMIT = parseInt(process.env.DAILY_EVENT_LIMIT) || 5;
router.post('/events', 
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
  
    try {
      const { title, description, category, date, createdBy } = req.body;

      if (!title || !date || !createdBy) {
        return res.status(400).json({ message: 'Обязательные поля: title, date, createdBy' });
      }

    // Получаем текущую дату и дату 24 часа назад
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Считаем количество событий, созданных этим пользователем за последние 24 часа
    const eventCount = await Event.count({
      where: {
        createdBy,
        createdAt: {
          [Op.gte]: yesterday,
        },
      },
    });

    if (eventCount >= DAILY_EVENT_LIMIT) {
      return res.status(429).json({
        message: `Превышен лимит создания событий. Лимит: ${DAILY_EVENT_LIMIT} событий в сутки.`,
      });
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
 *     summary: Обновить мероприятие
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Мероприятие обновлено
 *       404:
 *         description: Мероприятие не найдено
 */
router.put('/events/:id', 
  passport.authenticate('jwt', { session: false }),
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
 *     summary: Удалить мероприятие
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Мероприятие удалено
 *       404:
 *         description: Мероприятие не найдено
 */
router.delete('/events/:id', 
  passport.authenticate('jwt', { session: false }),
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
