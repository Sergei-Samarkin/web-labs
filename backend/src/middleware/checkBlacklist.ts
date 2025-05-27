import { Request, Response, NextFunction } from 'express';
import BlacklistedToken from '../models/BlacklistedToken';

export default async function checkBlacklist(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Нет токена' });

    const token = authHeader.split(' ')[1];

    try {
        const blacklisted = await BlacklistedToken.findOne({ where: { token } });
        if (blacklisted) {
            return res.status(401).json({ message: 'Токен недействителен (выход из системы)' });
        }
        next();
    } catch (error) {
        console.error('Ошибка проверки черного списка токенов:', error);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
}
