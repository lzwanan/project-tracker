import request from './request';

export interface DashboardEvent {
  id: number;
  title: string;
  type: 'version' | 'oncall' | 'initiative';
  subtype?: string;
  status: string;
  startDate: string;
  endDate: string;
  color: string;
  owner?: string;
  link: string;
}

export const dashboardApi = {
  events: (year: number, month?: number) => request.get('/dashboard/events', { params: { year, month } }),
};
