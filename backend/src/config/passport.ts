import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import User from '../models/user';
import { PassportStatic } from 'passport';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
    id: number;
    iat?: number;
    exp?: number;
}

const configurePassport = (passport: PassportStatic): void => {
    const options: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET as string,
    };

    passport.use(
        new JwtStrategy(options, async (payload: JwtPayload, done) => {
            try {
                const user = await User.findByPk(payload.id);
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (err) {
                return done(err, false);
            }
        }),
    );
};

export default configurePassport;
