const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API',
      version: '1.0.0',
      description: 'Документация API для управления мероприятиями и пользователями',
},
        servers: [
            {
                url: 'http://localhost:4000',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
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
                                        example: 'Недействительный токен'
                                    },
                                    error: {
                                        type: 'string',
                                        example: 'Unauthorized'
                                    }
                                }
                            }
                        }
                    }
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
                                        example: 'Срок действия токена истек'
                                    },
                                    error: {
                                        type: 'string',
                                        example: 'Token expired'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
  apis: [
    './backend/routes/events.js',
    './backend/routes/public.js',
    './backend/routes/auth.js',
  ], 
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
