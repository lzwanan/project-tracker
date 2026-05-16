import request from './request';

export interface Version {
  id?: number;
  name: string;
  description?: string;
  status: string;
  owner?: string;
  plannedDate?: string;
  actualDate?: string;
  requirements?: VersionRequirement[];
  stages?: Stage[];
  createdAt?: string;
}

export interface VersionRequirement {
  id?: number;
  versionId?: number;
  name: string;
  reqNumber?: string;
  assignee?: string;
}

export interface Stage {
  id?: number;
  versionId?: number;
  parentId?: number | null;
  name: string;
  orderSeq?: number;
  status: string;
  dueDate?: string;
  assignee?: string;
  children?: Stage[];
}

export const versionApi = {
  list: (params: { page: number; size: number; keyword?: string; sortBy?: string; sortOrder?: string; status?: string }) =>
    request.get('/versions', { params }),
  detail: (id: number) => request.get(`/versions/${id}`),
  create: (data: Version) => request.post('/versions', data),
  update: (id: number, data: Version) => request.put(`/versions/${id}`, data),
  delete: (id: number) => request.delete(`/versions/${id}`),

  getRequirements: (versionId: number) => request.get(`/versions/${versionId}/requirements`),
  addRequirement: (versionId: number, data: VersionRequirement) => request.post(`/versions/${versionId}/requirements`, data),
  updateRequirement: (versionId: number, reqId: number, data: VersionRequirement) => request.put(`/versions/${versionId}/requirements/${reqId}`, data),
  deleteRequirement: (versionId: number, reqId: number) => request.delete(`/versions/${versionId}/requirements/${reqId}`),

  addStage: (versionId: number, data: Stage) => request.post(`/versions/${versionId}/stages`, data),
  updateStage: (versionId: number, stageId: number, data: Stage) => request.put(`/versions/${versionId}/stages/${stageId}`, data),
  deleteStage: (versionId: number, stageId: number) => request.delete(`/versions/${versionId}/stages/${stageId}`),

  copy: (id: number, newName: string) => request.post(`/versions/${id}/copy`, null, { params: { newName } }),
  exportTemplate: () => request.get('/versions/export/template', { responseType: 'blob' }),
  importFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/versions/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
