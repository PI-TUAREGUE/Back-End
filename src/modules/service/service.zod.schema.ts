import z from 'zod';

export const serviceSchema = z.object({
  name: z
    .string('Nome é obrigatório')
    .min(3, 'Nome deve ter um mínimo de 3 caracteres.')
    .max(100, 'Nome pode conter um máximo de 100 caracteres.'),

  status: z.enum(['Ativo', 'Inativo']),
});
