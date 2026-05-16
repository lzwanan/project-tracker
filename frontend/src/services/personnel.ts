import request from './request';

export interface Personnel {
  id?: number;
  employeeId: string;
  name: string;
  email: string;
  roles?: SysRole[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SysRole {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export const personnelApi = {
  list: (params: { page: number; size: number; keyword?: string }) =>
    request.get('/personnel', { params }),

  all: () => request.get('/personnel/all'),

  withRoles: () => request.get('/personnel/with-roles'),

  create: (data: Personnel) => request.post('/personnel', data),

  update: (id: number, data: Personnel) => request.put(`/personnel/${id}`, data),

  delete: (id: number) => request.delete(`/personnel/${id}`),

  getRoles: (id: number) => request.get(`/personnel/${id}/roles`),

  assignRoles: (id: number, roleIds: number[]) => request.put(`/personnel/${id}/roles`, { roleIds }),

  exportTemplate: () => request.get('/personnel/export/template', { responseType: 'blob' }),
  importFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/personnel/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const roleApi = {
  list: () => request.get('/roles'),
  create: (data: SysRole) => request.post('/roles', data),
  update: (id: number, data: SysRole) => request.put(`/roles/${id}`, data),
  delete: (id: number) => request.delete(`/roles/${id}`),
};
