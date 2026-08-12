export const AppointmentStatus = {
  Scheduled: 'Agendado',
  Completed: 'Concluído',
  Cancelled: 'Cancelado',
  NoShow: 'Não compareceu',
} as const;

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
