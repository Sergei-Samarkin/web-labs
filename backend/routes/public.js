const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const apiKeyMiddleware = require('../middleware/apiKey');

/**
 * @swagger
 * /public/events:
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
router.get('/events', 
  apiKeyMiddleware,
  async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};

    if (category) {
      where.category = category;
    }

    const events = await Event.findAll({ where });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения мероприятий', error: err.message });
  }
});

/**
 * @swagger
 * /public/events/{id}:
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
router.get('/events/:id', 
  apiKeyMiddleware,
  async (req, res) => {
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

module.exports = router;