import request from './request';

export interface MonthlyOncall {
  id?: number;
  yearMonth: string;
  oncallPersonId: number;
  backupPersonId?: number;
  oncallPerson?: any;
  backupPerson?: any;
  createdAt?: string;
}

export const oncallApi = {
  list: (yearMonth?: string) => request.get('/oncalls', { params: { yearMonth } }),
  create: (data: MonthlyOncall) => request.post('/oncalls', data),
  update: (id: number, data: MonthlyOncall) => request.put(`/oncalls/${id}`, data),
  delete: (id: number) => request.delete(`/oncalls/${id}`),
};
