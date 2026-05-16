import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Select, Space, Card, Tag, Popconfirm, message, DatePicker,
  Avatar, Typography, Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { oncallApi, type MonthlyOncall } from '@/services/oncall';
import { personnelApi, type Personnel } from '@/services/personnel';
import { useAuth, guestProps } from '@/context/AuthContext';

const { Text } = Typography;

export default function OncallPage() {
  const [data, setData] = useState<MonthlyOncall[]>([]);
  const [loading, setLoading] = useState(false);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MonthlyOncall | null>(null);
  const [form] = Form.useForm();
  const { isGuest } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [oncallRes, pRes]: any = await Promise.all([oncallApi.list(), personnelApi.all()]);
      setData(oncallRes.data || []);
      setPersonnelList(pRes.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = () => { setEditingRecord(null); form.resetFields(); form.setFieldsValue({ yearMonth: dayjs() }); setModalOpen(true); };
  const handleEdit = (r: MonthlyOncall) => {
    setEditingRecord(r);
    form.setFieldsValue({ yearMonth: dayjs(r.yearMonth), oncallPersonId: r.oncallPersonId, backupPersonId: r.backupPersonId || undefined });
    setModalOpen(true);
  };
  const handleDelete = async (id: number) => { await oncallApi.delete(id); message.success('已删除'); fetchData(); };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, yearMonth: (values.yearMonth as Dayjs).format('YYYY-MM') };
    if (editingRecord?.id) { await oncallApi.update(editingRecord.id, payload); message.success('已更新'); }
    else { await oncallApi.create(payload); message.success('已添加'); }
    setModalOpen(false);
    fetchData();
  };

  const columns: ColumnsType<MonthlyOncall> = [
    {
      title: '月份', dataIndex: 'yearMonth', key: 'yearMonth', width: 130,
      render: (v: string) => <Tag color="blue" style={{ borderRadius: 20, fontWeight: 700, fontSize: 14, padding: '2px 14px' }}>{v}</Tag>,
      sorter: (a, b) => a.yearMonth.localeCompare(b.yearMonth),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Oncall 人员', key: 'oncallPerson', width: 220,
      render: (_, r) => {
        const p = r.oncallPerson;
        if (!p) return <Text style={{ color: '#cbd5e1' }}>-</Text>;
        return (
          <Space size={8}>
            <Avatar size={28} style={{ background: '#6366f1' }}>{p.name?.charAt(0)}</Avatar>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>{p.employeeId}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: '备份人员', key: 'backupPerson', width: 220,
      render: (_, r) => {
        const p = r.backupPerson;
        if (!p) return <Text style={{ color: '#cbd5e1' }}>-</Text>;
        return (
          <Space size={8}>
            <Avatar size={28} style={{ background: '#8b5cf6' }}>{p.name?.charAt(0)}</Avatar>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>{p.employeeId}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: '操作', key: 'action', width: 150,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} {...guestProps(isGuest)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id!)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} {...guestProps(isGuest)}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card
        style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '24px 28px' } }}
        title={<span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Oncall 排班</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ borderRadius: 12, height: 36, fontWeight: 600, boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }} {...guestProps(isGuest)}>
            添加排班
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="middle" pagination={false}
          locale={{ emptyText: <Empty description="暂无排班记录" /> }} />
      </Card>

      <Modal title={editingRecord ? '编辑排班' : '添加排班'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} destroyOnClose
        okButtonProps={{ style: { borderRadius: 10 } }} cancelButtonProps={{ style: { borderRadius: 10 } }}>
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="yearMonth" label="月份" rules={[{ required: true }]}>
            <DatePicker picker="month" format="YYYY-MM" style={{ width: '100%', borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="oncallPersonId" label="Oncall 人员" rules={[{ required: true }]}>
            <Select showSearch placeholder="选择人员" optionFilterProp="label"
              options={personnelList.map((p) => ({ value: p.id, label: `${p.name}(${p.employeeId})` }))}
              style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="backupPersonId" label="备份人员">
            <Select allowClear showSearch placeholder="选择备份人员（可选）" optionFilterProp="label"
              options={personnelList.map((p) => ({ value: p.id, label: `${p.name}(${p.employeeId})` }))}
              style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}
