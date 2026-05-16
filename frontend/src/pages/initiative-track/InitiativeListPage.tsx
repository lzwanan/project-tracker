import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Space, Card, Tag, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { initiativeApi, type Initiative, type MilestoneWithRisks } from '@/services/initiative';
import { useAuth, guestProps } from '@/context/AuthContext';

const { Text } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'processing', label: '进行中' },
  COMPLETED: { color: 'success', label: '已完成' },
  ON_HOLD: { color: 'warning', label: '已暂停' },
};

export default function InitiativeListPage() {
  const [data, setData] = useState<Initiative[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Initiative | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isGuest } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await initiativeApi.list({ page, size: 10, keyword: keyword || undefined });
      setData(res.data.records || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  }, [page, keyword]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: Initiative) => {
    setEditing(r);
    form.setFieldsValue({ ...r, startDate: r.startDate ? dayjs(r.startDate) : undefined, endDate: r.endDate ? dayjs(r.endDate) : undefined });
    setModalOpen(true);
  };
  const handleDelete = async (id: number) => { await initiativeApi.delete(id); message.success('已删除'); fetchData(); };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, startDate: (values.startDate as Dayjs)?.format?.('YYYY-MM-DD') || null, endDate: (values.endDate as Dayjs)?.format?.('YYYY-MM-DD') || null };
    if (editing?.id) { await initiativeApi.update(editing.id, payload); message.success('已更新'); }
    else { await initiativeApi.create(payload); message.success('已添加'); }
    setModalOpen(false); fetchData();
  };

  const columns: ColumnsType<Initiative> = [
    {
      title: '专项', key: 'info', width: 260,
      render: (_, r) => (
        <div>
          <a onClick={() => navigate(`/initiatives/${r.id}`)} style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', cursor: 'pointer' }}>
            {r.name}
          </a>
          {r.owner && <Text style={{ fontSize: 12, color: '#6366f1', display: 'block' }}>负责人: {r.owner}</Text>}
        </div>
      ),
    },
    {
      title: '周期', key: 'period', width: 180,
      render: (_, r) => <Text style={{ fontSize: 13 }}>{r.startDate || '?'} ~ {r.endDate || '?'}</Text>,
    },
    {
      title: '风险', key: 'risks', width: 100,
      render: (_, r) => {
        const ms = r.milestones || [];
        const risks = ms.flatMap((m) => m.risks || []);
        const critical = risks.filter((x) => x.severity === 'CRITICAL').length;
        const high = risks.filter((x) => x.severity === 'HIGH').length;
        return (
          <Space size={4}>
            {critical > 0 && <Tag color="red">{critical} 严重</Tag>}
            {high > 0 && <Tag color="orange">{high} 高危</Tag>}
            {risks.length === 0 && <Text style={{ color: '#cbd5e1' }}>无</Text>}
          </Space>
        );
      },
    },
    {
      title: '里程碑', key: 'milestones', width: 100,
      render: (_, r) => {
        const ms = r.milestones || [];
        const done = ms.filter((m) => m.status === 'COMPLETED').length;
        return <Text>{done}/{ms.length}</Text>;
      },
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => { const c = STATUS_MAP[s] || { color: 'default', label: s }; return <Tag color={c.color} style={{ borderRadius: 20, fontWeight: 600 }}>{c.label}</Tag>; } },
    {
      title: '操作', key: 'action', width: 180,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/initiatives/${r.id}`)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} {...guestProps(isGuest)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(r.id!)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} {...guestProps(isGuest)}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '24px 28px' } }}
        title={<span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>专项跟踪</span>}
        extra={
          <Space>
            <Input prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="搜索专项名称" allowClear style={{ width: 180, borderRadius: 10 }}
              onPressEnter={(e: any) => { setKeyword(e.target.value); setPage(1); }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ borderRadius: 12, height: 36, fontWeight: 600 }} {...guestProps(isGuest)}>添加专项</Button>
          </Space>
        }>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="middle"
          pagination={{ current: page, pageSize: 10, total, showTotal: (t) => <Text style={{ color: '#94a3b8' }}>共 {t} 条</Text>, onChange: (p) => setPage(p) }} />
      </Card>

      <Modal title={editing ? '编辑专项' : '添加专项'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} destroyOnClose okButtonProps={{ style: { borderRadius: 10 } }}>
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="name" label="专项名称" rules={[{ required: true }]}>
            <Input placeholder="例如: Q2架构升级专项" style={{ borderRadius: 10 }} /></Form.Item>
          <Form.Item name="owner" label="负责人"><Input placeholder="张三(E001)" style={{ borderRadius: 10 }} /></Form.Item>
          <Space size={12} style={{ width: '100%' }}>
            <Form.Item name="startDate" label="开始日期" style={{ flex: 1 }}><DatePicker style={{ width: '100%', borderRadius: 10 }} /></Form.Item>
            <Form.Item name="endDate" label="结束日期" style={{ flex: 1 }}><DatePicker style={{ width: '100%', borderRadius: 10 }} /></Form.Item>
          </Space>
          <Form.Item name="description" label="描述"><Input.TextArea style={{ borderRadius: 10 }} rows={2} /></Form.Item>
          {editing && <Form.Item name="status" label="状态"><Select style={{ borderRadius: 10 }}>
            <Select.Option value="ACTIVE">进行中</Select.Option>
            <Select.Option value="COMPLETED">已完成</Select.Option>
            <Select.Option value="ON_HOLD">已暂停</Select.Option>
          </Select></Form.Item>}
        </Form>
      </Modal>
    </motion.div>
  );
}
