import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc, { Options } from 'swagger-jsdoc';
import { Express } from 'express';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Events API',
            version: '1.0.0',
            description: 'Документация API для управления мероприятиями и пользователями',
        },
        produces: ['application/json'],
        consumes: ['application/json'],
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Authorization header using the Bearer scheme.',
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Ошибка авторизации',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Недействительный токен',
                                    },
                                    error: {
                                        type: 'string',
                                        example: 'Unauthorized',
                                    },
                                },
                            },
                        },
                    },
                },
                TokenExpiredError: {
                    description: 'Срок действия токена истек',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Срок действия токена истек',
                                    },
                                    error: {
                                        type: 'string',
                                        example: 'Token expired',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: [`${__dirname}/routes/events.ts`, `${__dirname}/routes/public.ts`, `${__dirname}/routes/auth.ts`],
};

const swaggerSpec = swaggerJsDoc({
    ...options,
    // Enable TypeScript support
    yaml: {
        resolve: {
            file: {
                canRead: /.(yaml|yml|json|js|ts)$/i,
            },
        },
    },
});

export function setupSwagger(app: Express): void {
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
        }),
    );
}

export default setupSwagger;
