import request from './request';

export interface Initiative {
  id?: number;
  name: string;
  description?: string;
  status: string;
  owner?: string;
  startDate?: string;
  endDate?: string;
  actualEndDate?: string;
  milestones?: MilestoneWithRisks[];
}

export interface MilestoneWithRisks {
  id?: number;
  initiativeId?: number;
  name: string;
  targetDate?: string;
  actualDate?: string;
  status: string;
  risks?: InitiativeRisk[];
}

export interface InitiativeRisk {
  id?: number;
  initiativeId?: number;
  milestoneId?: number;
  title: string;
  description?: string;
  severity: string;
  status: string;
  owner?: string;
  identifiedDate?: string;
  resolutionDate?: string;
  progress?: string;
}

export const initiativeApi = {
  list: (params: { page: number; size: number; keyword?: string }) =>
    request.get('/initiatives', { params }),
  detail: (id: number) => request.get(`/initiatives/${id}`),
  create: (data: Initiative) => request.post('/initiatives', data),
  update: (id: number, data: Initiative) => request.put(`/initiatives/${id}`, data),
  delete: (id: number) => request.delete(`/initiatives/${id}`),

  addMilestone: (initiativeId: number, data: any) => request.post(`/initiatives/${initiativeId}/milestones`, data),
  updateMilestone: (initiativeId: number, msId: number, data: any) => request.put(`/initiatives/${initiativeId}/milestones/${msId}`, data),
  deleteMilestone: (initiativeId: number, msId: number) => request.delete(`/initiatives/${initiativeId}/milestones/${msId}`),

  addRisk: (initiativeId: number, msId: number, data: InitiativeRisk) => request.post(`/initiatives/${initiativeId}/milestones/${msId}/risks`, data),
  updateRisk: (initiativeId: number, msId: number, riskId: number, data: InitiativeRisk) => request.put(`/initiatives/${initiativeId}/milestones/${msId}/risks/${riskId}`, data),
  deleteRisk: (initiativeId: number, msId: number, riskId: number) => request.delete(`/initiatives/${initiativeId}/milestones/${msId}/risks/${riskId}`),
};
