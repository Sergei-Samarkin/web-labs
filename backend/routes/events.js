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
 *         location:
 *           type: string
 *           description: Место проведения
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



/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить список всех мероприятий
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Список мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения мероприятий', error: err.message });
  }
});


/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Получить мероприятие по ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия
 *     responses:
 *       200:
 *         description: Найденное мероприятие
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Мероприятие не найдено
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения мероприятия', error: err.message });
  }
});


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
router.post('/', async (req, res) => {
  try {
    const { title, description, location, date, createdBy } = req.body;

    if (!title || !date || !createdBy || !location) {
      return res.status(400).json({ message: 'Обязательные поля: title, location, date, createdBy' });
    }

    const event = await Event.create({ title, description, location, date, createdBy });
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
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }

    const { title, description, location, date } = req.body;
    await event.update({ title, description, location, date });
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
router.delete('/:id', async (req, res) => {
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
