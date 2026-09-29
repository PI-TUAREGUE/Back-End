//Imports
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './shared/config/swagger';

import { errorHandler } from './shared/middlewares/error.middleware';

//Routes
import employeeRouter from './modules/employee/employee.routes';
import serviceRouter from './modules/service/service.routes';
import authRouter from './modules/auth/auth.routes';
import schedulerRouter from './modules/scheduler/scheduler.routes';

//Init express app
const app = express();

app.use(cors());
app.use(express.json());

//Import routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/employees', employeeRouter);
app.use('/service', serviceRouter);
app.use('/auth', authRouter);
app.use('/scheduler', schedulerRouter);

app.use(errorHandler);

export default app;
