import { useEffect, useState, useCallback } from 'react';
import { Table, Card, Typography, Tag, Button, Popconfirm, message, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ColumnsType } from 'antd/es/table';
import { accessLogApi } from '@/services/auth';
import dayjs from 'dayjs';
import { useAuth, guestProps } from '@/context/AuthContext';

const { Text } = Typography;

interface AccessLogItem {
  id: number;
  username: string;
  ip: string;
  method: string;
  path: string;
  userAgent: string;
  createTime: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'green', POST: 'blue', PUT: 'orange', DELETE: 'red',
};

export default function AccessLogPage() {
  const { isGuest } = useAuth();
  const [data, setData] = useState<AccessLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await accessLogApi.list(page, 20);
      setData(res.data.records || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCleanOld = async () => {
    try {
      const res: any = await accessLogApi.cleanOld();
      message.success(`已删除 ${res.data} 条记录`);
      fetchData();
    } catch { message.error('删除失败'); }
  };

  const columns: ColumnsType<AccessLogItem> = [
    { title: '用户', dataIndex: 'username', key: 'username', width: 100 },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 140, render: (v: string) => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '方法', dataIndex: 'method', key: 'method', width: 70,
      render: (v: string) => <Tag color={METHOD_COLORS[v] || 'default'} style={{ borderRadius: 20, fontWeight: 600 }}>{v}</Tag> },
    { title: '路径', dataIndex: 'path', key: 'path', ellipsis: true, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: '设备', dataIndex: 'userAgent', key: 'userAgent', width: 200, ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 11, color: '#94a3b8' }}>{v}</Text> },
    { title: '时间', dataIndex: 'createTime', key: 'createTime', width: 170,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '24px 28px' } }}
        title={<span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>访问记录</span>}
        extra={
          <Space>
            <Popconfirm title="删除一周前的记录?" onConfirm={handleCleanOld}>
              <Button icon={<DeleteOutlined />} {...guestProps(isGuest)} size="small" danger style={{ borderRadius: 10 }}>清理旧记录</Button>
            </Popconfirm>
          </Space>
        }>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="small"
          pagination={{ current: page, pageSize: 20, total, showTotal: (t) => <Text style={{ color: '#94a3b8' }}>共 {t} 条</Text>, onChange: (p) => setPage(p) }} />
      </Card>
    </motion.div>
  );
}
