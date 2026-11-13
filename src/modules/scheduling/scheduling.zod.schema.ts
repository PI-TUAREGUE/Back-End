import z from 'zod';

export const schedulingSchema = z.object({
  client: z
    .string('Nome do cliente é obrigatório.')
    .min(3, 'Nome do serviço deve conter um mínimo de 3 caracteres.')
    .max(100, 'Nome do serviço pode conter um máximo de 20 caracteres.'),

  clientTel: z
    .string('Telefone do cliente é obrigatório.')
    .min(11, 'Número inválido')
    .max(16, 'Número inválido'),

  plate: z
    .string('Placa do veículo é obrigatória.')
    .min(8, 'Placa inválida.')
    .max(8, 'Placa inválida.'),

  car: z
    .string('Nome do veículo é obrigatório.')
    .min(3, 'Nome do veículo deve conter um mínimo de 3 caracteres.'),

  startDate: z.string('Data de começo é obrigatório.'),

  endDate: z.string('Data de finalização é obrigatório.'),

  employee: z.array(
    z.string('Ao menos um mecânico deve ser incluído no agendamento.'),
  ),

  invitedEmployees: z.array(z.string()).optional(),

  editors: z.array(z.string()).optional(),

  service: z.array(
    z.string('Ao meno um serviço deve ser incluído no agendamento.'),
  ),

  status: z.enum([
    'Agendado',
    'Atrasado',
    'Concluído',
    'Cancelado',
    'Em progresso',
  ]),
});
