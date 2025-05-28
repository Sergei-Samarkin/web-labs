import { Router, Request, Response, NextFunction } from 'express';
import Event from '@/models/event';

const router = Router();

/**
 * @swagger
 * /public/events:
 *   get:
 *     summary: Получить список всех мероприятий
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Категория мероприятия для фильтрации
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
// Handle both /public and /public/events for backward compatibility
router.get(
    '/',
    async (
        req: Request<{}, unknown, unknown, { category?: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { category } = req.query;
            const where: { category?: string } = {};

            if (category) {
                where.category = category;
            }

            const events = await Event.findAll({ 
              where,
              attributes: [
                'id',
                'title',
                'description',
                'category',
                'date',
                'createdBy',
                'createdAt',
                'updatedAt'
              ]
            });
            
            // Ensure createdBy is included in the response
            const formattedEvents = events.map(event => ({
              ...event.get({ plain: true }),
              createdBy: event.createdBy || null
            }));
            
            res.json(formattedEvents);
        } catch (error) {
            next(error);
        }
    },
);

// Keep the old route for backward compatibility
router.get(
    '/events',
    async (
        req: Request<{}, unknown, unknown, { category?: string }>,
        res: Response,
        next: NextFunction,
    ) => {
        // Redirect to the new endpoint
        res.redirect(307, '/public');
    },
);

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
// Get event by ID
router.get('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            res.status(404).json({ message: 'Мероприятие не найдено' });
            return;
        }
        res.json(event);
    } catch (error) {
        console.error('Ошибка при получении мероприятия:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

export default router;
