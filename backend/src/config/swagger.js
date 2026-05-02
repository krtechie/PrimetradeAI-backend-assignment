const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Application API',
      version: '1.0.0',
      description: 'Scalable REST API with JWT authentication and role-based access control',
      contact: {
        name: 'PrimeTradeAI',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from login response',
        },
      },
      schemas: {
        // Auth schemas
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },
        // Task schemas
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', maxLength: 200, example: 'My first task' },
            description: { type: 'string', example: 'Task description here' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed'],
              example: 'pending',
            },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 200, example: 'Updated task title' },
            description: { type: 'string', example: 'Updated description' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed'],
              example: 'in_progress',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'My first task' },
            description: { type: 'string', example: 'Task description' },
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TaskResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Task fetched successfully' },
            data: {
              type: 'object',
              properties: {
                task: { $ref: '#/components/schemas/Task' },
              },
            },
          },
        },
        TasksResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Tasks fetched successfully' },
            data: {
              type: 'object',
              properties: {
                tasks: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' },
                },
                count: { type: 'integer', example: 5 },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/v1/*.js'],
};

module.exports = swaggerJsdoc(options);