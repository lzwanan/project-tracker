import request from './request';

export interface BackupFileInfo {
  name: string;
  size: number;
  time: string;
  source: string;
}

export interface BackupProgress {
  taskId: string;
  type: string;
  totalTables: number;
  doneTables: number;
  currentTable: string;
  percent: number;
  status: string;
  filename?: string;
}

export const systemApi = {
  startBackup: () => request.post('/system/backup'),
  getBackupProgress: (taskId: string) => request.get(`/system/backup/progress/${taskId}`),
  listBackups: () => request.get('/system/backups'),
  downloadBackup: (filename: string) => request.get(`/system/backups/download/${filename}`, { responseType: 'blob' }),
  restoreBackup: (filename: string) => request.post(`/system/backups/${filename}/restore`),
  getRestoreProgress: (taskId: string) => request.get(`/system/restore/progress/${taskId}`),
};
