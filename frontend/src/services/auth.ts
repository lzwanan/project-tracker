import request from './request';

export const authApi = {
  captcha: () => request.get('/auth/captcha'),
  login: (employeeId: string, password: string, remember?: string, captcha?: string) =>
    request.post('/auth/login', { employeeId, password, remember, captcha }),
  logout: () => request.post('/auth/logout'),
  me: () => request.get('/auth/me'),
  changePassword: (oldPassword: string, newPassword: string) => request.post('/auth/change-password', { oldPassword, newPassword }),
  resetPassword: (userId: number, newPassword: string) => request.post(`/auth/reset-password/${userId}`, { newPassword }),
};

export const accessLogApi = {
  list: (page: number, size: number) => request.get('/system/access-logs', { params: { page, size } }),
  cleanOld: () => request.delete('/system/access-logs/clean'),
};
