import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { EmployeeModel } from '../modules/employee/employee.model';
import { EmployeeRole } from '../modules/employee/roles.enum';
import { EmployeeStatus } from '../modules/employee/status.enum';

dotenv.config();

const testUser = {
  name: 'Usuário de Teste',
  cpf: '00000000000',
  email: 'teste@tuaregue.com',
  password: 'Teste123!',
  roles: [EmployeeRole.ADMIN, EmployeeRole.MECHANIC],
  status: EmployeeStatus.ACTIVE,
};

const seedTestUser = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('O usuário de teste não pode ser criado em produção.');
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI não está definida.');
  }

  await mongoose.connect(mongoUri);

  try {
    const password = await bcrypt.hash(testUser.password, 10);
    const result = await EmployeeModel.updateOne(
      { email: testUser.email },
      {
        $set: {
          ...testUser,
          password,
        },
      },
      { upsert: true, runValidators: true },
    );

    console.log(
      result.upsertedCount > 0
        ? `Usuário de teste criado: ${testUser.email}`
        : `Usuário de teste atualizado: ${testUser.email}`,
    );
  } finally {
    await mongoose.disconnect();
  }
};

seedTestUser().catch((error: unknown) => {
  console.error('Falha ao criar o usuário de teste:', error);
  process.exitCode = 1;
});
