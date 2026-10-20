import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Resource not found' },
        },
        required: ['status', 'message'],
      },
      TokenResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
      Employee: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665f1b2d8e2a4c0012345678' },
          name: { type: 'string', example: 'Maria Silva' },
          cpf: { type: 'string', example: '12345678900' },
          email: { type: 'string', format: 'email', example: 'maria@example.com' },
          password: {
            type: 'string',
            description:
              'The employee model currently serializes this field as a password hash.',
          },
          roles: {
            type: 'array',
            items: { type: 'string', enum: ['Administrador', 'Mecânico'] },
          },
          status: { type: 'string', enum: ['Ativo', 'Inativo'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      EmployeeCreate: {
        type: 'object',
        required: ['name', 'cpf', 'email', 'password', 'roles'],
        properties: {
          name: { type: 'string', example: 'Maria Silva' },
          cpf: { type: 'string', example: '12345678900' },
          email: { type: 'string', format: 'email', example: 'maria@example.com' },
          password: { type: 'string', format: 'password', example: 'secret123' },
          roles: {
            type: 'array',
            items: { type: 'string', enum: ['Administrador', 'Mecânico'] },
          },
          status: { type: 'string', enum: ['Ativo', 'Inativo'], default: 'Ativo' },
        },
      },
      Service: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665f1b2d8e2a4c0012345678' },
          iconPath: { type: 'string' },
          name: { type: 'string', example: 'Troca de óleo' },
          status: { type: 'string', enum: ['Ativo', 'Inativo'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ServiceCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          iconPath: { type: 'string' },
          name: { type: 'string', example: 'Troca de óleo' },
          status: { type: 'string', enum: ['Ativo', 'Inativo'], default: 'Ativo' },
        },
      },
      Scheduling: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665f1b2d8e2a4c0012345678' },
          client: { type: 'string', example: 'João Souza' },
          plate: { type: 'string', example: 'ABC-1D23' },
          car: { type: 'string', example: 'Honda Civic' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          employee: { type: 'array', items: { type: 'string' } },
          service: { type: 'array', items: { type: 'string' } },
          status: {
            type: 'string',
            enum: ['Agendado', 'Atrasado', 'Concluído', 'Cancelado', 'Em progresso'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SchedulingCreate: {
        type: 'object',
        required: ['client', 'plate', 'car', 'startDate', 'employee', 'service'],
        properties: {
          client: { type: 'string', example: 'João Souza' },
          plate: { type: 'string', example: 'ABC-1D23' },
          car: { type: 'string', example: 'Honda Civic' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          employee: {
            type: 'array',
            items: { type: 'string', example: '665f1b2d8e2a4c0012345678' },
          },
          invitedEmployees: {
            type: 'array',
            items: { type: 'string', example: '665f1b2d8e2a4c0012345678' },
          },
          service: {
            type: 'array',
            items: { type: 'string', example: '665f1b2d8e2a4c0012345678' },
          },
          status: {
            type: 'string',
            enum: ['Agendado', 'Atrasado', 'Concluído', 'Cancelado', 'Em progresso'],
          },
        },
      },
      Invitation: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665f1b2d8e2a4c0012345678' },
          scheduling: { type: 'string' },
          sender: { type: 'string' },
          receiver: { type: 'string' },
          status: {
            type: 'string',
            enum: ['Pendente', 'Aceito', 'Recusado', 'Cancelado'],
          },
          respondedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      InvitationCreate: {
        type: 'object',
        required: ['scheduling', 'employeesIds'],
        properties: {
          scheduling: { type: 'string', example: '665f1b2d8e2a4c0012345678' },
          employeesIds: {
            type: 'array',
            items: { type: 'string', example: '665f1b2d8e2a4c0012345678' },
          },
        },
      },
    },
  },
    openapi: '3.0.0',
    info: {
      title: 'Tuaregue Automotiva API',
      version: '1.0.0',
      description: 'API documentation for Tuaregue Automotiva',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    tags: [
      {
        name: 'Employee',
        description: 'Endpoints related to employee operations',
      },
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Invitation',
        description: 'Endpoints related to employee invitations',
      },
      {
        name: 'Scheduling',
        description: 'Endpoints related to workshop scheduling',
      },
      {
        name: 'Service',
        description: 'Endpoints related to workshop services',
      },
    ],
  },
  apis: ['./src/modules/*/*.routes.ts'],
};

const specs = swaggerJSDoc(options);

export default specs;
