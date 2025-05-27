import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import Event from '@/models/event';
import passport from 'passport';
import checkBlacklist from '@/middleware/checkBlacklist';

const router = Router();

export interface IEvent {
    id?: number;
    title: string;
    description?: string;
    category?: 'Концерт' | 'Лекция' | 'Выставка' | 'Встреча';
    date: Date;
    createdBy: number;
    createdAt?: Date;
    updatedAt?: Date;
}

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

router.post(
    '',
    passport.authenticate('jwt', { session: false }),
    checkBlacklist as unknown as RequestHandler,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { title, description, category, date } = req.body as Partial<IEvent>;
            const createdBy = req.user?.id;

            if (!title || !date) {
                res.status(400).json({ message: 'Обязательные поля: title, date' });
                return;
            }

            const event = await Event.create({ title, description, category, date, createdBy } as IEvent);
            res.status(201).json(event);
        } catch (error: unknown) {
            const err = error as Error;
            next(err);
        }
    },
);

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
router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    checkBlacklist as unknown as RequestHandler,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const event = await Event.findByPk(req.params.id);
            if (!event) {
                res.status(404).json({ message: 'Мероприятие не найдено' });
                return;
            }

            // Check if the current user is the creator of the event
            if (event.createdBy !== req.user?.id) {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Вы не являетесь создателем этого мероприятия',
                });
                return;
            }

            const { title, description, category, date } = req.body as Partial<IEvent>;
            await event.update({ title, description, category, date });
            res.json(event);
        } catch (error: unknown) {
            const err = error as Error;
            next(err);
        }
    },
);

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
router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    checkBlacklist as unknown as RequestHandler,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const event = await Event.findByPk(req.params.id);
            if (!event) {
                res.status(404).json({ message: 'Мероприятие не найдено' });
                return;
            }

            await event.destroy();
            res.json({ message: 'Мероприятие удалено' });
        } catch (error: unknown) {
            const err = error as Error;
            next(err);
        }
    },
);

export default router;
