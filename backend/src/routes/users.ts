import { Router, Request, Response, NextFunction } from 'express';
import User from '@/models/user';

const router = Router();

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить email пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Email пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 email:
 *                   type: string
 *       404:
 *         description: Пользователь не найден
 */
router.get(
    '/:id',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = parseInt(req.params.id, 10);
            const user = await User.findByPk(userId, {
                attributes: ['id', 'email'],
                raw: true
            });

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json(user);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
