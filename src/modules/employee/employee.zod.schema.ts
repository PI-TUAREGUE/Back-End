import z from 'zod';

export const employeeSchema = z.object({
  name: z
    .string('Nome é obrigatório.')
    .min(3, 'Nome deve ter mínimo de 3 caracteres.')
    .max(100, 'Nome pode conter um máximo de 20 caracteres.'),

  cpf: z.string('CPF é obrigatório').min(11, 'CPF Incompleto'),

  email: z
    .email('Email é obrigatório.')
    .refine((email) => email.endsWith('@tuaregue.com'), {
      message: `Email deve terminar com ${'Tuaregue'}`,
    }),

  password: z
    .string('Senha é obrigatória.')
    .min(8, 'A senha deve conter um mínimo de 8 caracteres')
    .max(100, 'A senha pode conter um máximo de 100 caracteres.'),
});
