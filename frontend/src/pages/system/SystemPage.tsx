import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Button, Table, Space, Tag, Typography, Progress, Popconfirm, message, Empty } from 'antd';
import { CloudUploadOutlined, CloudDownloadOutlined, ReloadOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ColumnsType } from 'antd/es/table';
import { systemApi, type BackupFileInfo, type BackupProgress } from '@/services/system';
import { useAuth, guestProps } from '@/context/AuthContext';

const { Text } = Typography;

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

export default function SystemPage() {
  const [files, setFiles] = useState<BackupFileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [nextBackupTime, setNextBackupTime] = useState('');
  const { isGuest } = useAuth();

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    const next = new Date();
    if (h < 12) { next.setHours(12, 0, 0, 0); }
    else if (h < 24) { next.setHours(24, 0, 0, 0); next.setDate(next.getDate() + 1); next.setHours(0, 0, 0, 0); }
    else { next.setHours(12, 0, 0, 0); next.setDate(next.getDate() + 1); }
    setNextBackupTime(next.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await systemApi.listBackups();
      setFiles(res.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const pollProgress = (taskId: string, type: 'backup' | 'restore') => {
    clearTimer();
    const api = type === 'backup' ? systemApi.getBackupProgress : systemApi.getRestoreProgress;
    timerRef.current = setInterval(async () => {
      try {
        const res: any = await api(taskId);
        if (res.data) {
          setProgress(res.data);
          if (res.data.status === 'completed') {
            clearTimer();
            setProgress(null);
            fetchFiles();
            message.success(type === 'backup' ? '备份完成' : '恢复完成');
          } else if (res.data.status === 'failed') {
            clearTimer();
            setProgress(null);
            message.error(`${type === 'backup' ? '备份' : '恢复'}失败: ` + res.data.currentTable);
          }
        }
      } catch { clearTimer(); setProgress(null); }
    }, 500);
  };

  const handleBackup = async () => {
    const res: any = await systemApi.startBackup();
    if (res.data) pollProgress(res.data, 'backup');
  };

  const handleRestore = async (filename: string) => {
    const res: any = await systemApi.restoreBackup(filename);
    if (res.data) pollProgress(res.data, 'restore');
  };

  const handleDownload = async (filename: string) => {
    const res: any = await systemApi.downloadBackup(filename);
    const blob = new Blob([res], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => () => clearTimer(), []);

  const columns: ColumnsType<BackupFileInfo> = [
    { title: '文件名', dataIndex: 'name', key: 'name', width: 280, ellipsis: true,
      render: (v: string) => <Text style={{ fontFamily: 'Consolas,monospace', fontSize: 13 }}>{v}</Text> },
    { title: '大小', dataIndex: 'size', key: 'size', width: 100, render: (v: number) => formatSize(v) },
    { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    { title: '来源', dataIndex: 'source', key: 'source', width: 80,
      render: (s: string) => s === 'manual' ? <Space size={4}><UserOutlined /><Text style={{ fontSize: 12 }}>手动</Text></Space> : <Space size={4}><RobotOutlined /><Text style={{ fontSize: 12 }}>自动</Text></Space> },
    { title: '操作', key: 'action', width: 160,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<CloudDownloadOutlined />} onClick={() => handleDownload(r.name)}>下载</Button>
          <Popconfirm title="恢复将覆盖当前所有数据，不可撤销" onConfirm={() => handleRestore(r.name)} okButtonProps={{ danger: true }}>
            <Button type="link" size="small" danger icon={<ReloadOutlined />} {...guestProps(isGuest)}>恢复</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '24px 28px' } }}
        title={<span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>备份管理</span>}
        extra={
          <Space>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>下次自动: {nextBackupTime}</Text>
            <Button type="primary" icon={<CloudUploadOutlined />} onClick={handleBackup} disabled={!!progress}
              style={{ borderRadius: 12, height: 36, fontWeight: 600 }} {...guestProps(isGuest)}>立即备份</Button>
          </Space>
        }>

        {progress && (
          <div style={{ marginBottom: 20, padding: '16px 20px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text strong style={{ fontSize: 14 }}>
                {progress.type === 'backup' ? '备份' : '恢复'}中...
              </Text>
              <Text style={{ fontSize: 13, color: '#64748b' }}>
                {progress.currentTable} ({progress.doneTables}/{progress.totalTables})
              </Text>
            </div>
            <Progress percent={progress.percent} status="active" strokeColor="#3b82f6" />
          </div>
        )}

        <Table columns={columns} dataSource={files} rowKey="name" loading={loading} size="middle" pagination={false}
          locale={{ emptyText: <Empty description="暂无备份文件" /> }} />
      </Card>
    </motion.div>
  );
}
