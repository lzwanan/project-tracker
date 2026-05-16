import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Card, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ColumnsType } from 'antd/es/table';
import { roleApi, type SysRole } from '@/services/personnel';
import { useAuth, guestProps } from '@/context/AuthContext';

const { Text } = Typography;

const ROLE_ICON_COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

export default function RolePage() {
  const [data, setData] = useState<SysRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SysRole | null>(null);
  const [form] = Form.useForm();
  const { isGuest } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try { const res: any = await roleApi.list(); setData(res.data || []); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => { setEditingRole(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: SysRole) => { setEditingRole(r); form.setFieldsValue(r); setModalOpen(true); };
  const handleDelete = async (id: number) => { await roleApi.delete(id); message.success('已删除'); fetchData(); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingRole?.id) { await roleApi.update(editingRole.id, values); message.success('已更新'); }
    else { await roleApi.create(values); message.success('已添加'); }
    setModalOpen(false); fetchData();
  };

  const columns: ColumnsType<SysRole> = [
    {
      title: '角色',
      key: 'info',
      width: 280,
      render: (_, r, idx) => {
        const c = ROLE_ICON_COLORS[idx % ROLE_ICON_COLORS.length];
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyOutlined style={{ fontSize: 18, color: c }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{r.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{r.code}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (v: string) => v ? <span style={{ color: '#475569', fontSize: 13 }}>{v}</span> : <span style={{ color: '#cbd5e1' }}>-</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} style={{ fontWeight: 500 }} {...guestProps(isGuest)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ fontWeight: 500 }} {...guestProps(isGuest)}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
      <Card
        style={{
          borderRadius: 16,
          border: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        }}
        styles={{ body: { padding: '24px 28px' } }}
        title={<span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>角色管理</span>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ borderRadius: 12, height: 36, fontWeight: 600, boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}
            {...guestProps(isGuest)}
          >
            添加角色
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} size="middle" showHeader={data.length > 0} />
      </Card>

      <Modal
        title={<span style={{ fontSize: 17, fontWeight: 700 }}>{editingRole ? '编辑角色' : '添加角色'}</span>}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        okButtonProps={{ style: { borderRadius: 10 } }}
        cancelButtonProps={{ style: { borderRadius: 10 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input placeholder="例如：版本负责人" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="code" label="角色编码" rules={[{ required: true }]}>
            <Input prefix={<KeyOutlined style={{ color: '#94a3b8' }} />} placeholder="例如：VERSION_OWNER" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="角色职责说明" style={{ borderRadius: 10 }} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}
