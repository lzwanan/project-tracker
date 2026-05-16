import { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Select, Space, Tag, Popconfirm, message, Typography, Breadcrumb, Empty, Spin, Collapse, Table } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CaretRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { initiativeApi, type Initiative, type MilestoneWithRisks, type InitiativeRisk } from '@/services/initiative';
import { personnelApi, type Personnel } from '@/services/personnel';
import { countdownLabel } from '@/services/dateUtils';
import { useAuth, guestProps } from '@/context/AuthContext';

const { Text } = Typography;

const SEVERITY_MAP: Record<string, { color: string; label: string }> = {
  CRITICAL: { color: 'red', label: '严重' }, HIGH: { color: 'orange', label: '高危' },
  MEDIUM: { color: 'gold', label: '中等' }, LOW: { color: 'green', label: '低' },
};
const RISK_STATUS: Record<string, { color: string; label: string }> = {
  IDENTIFIED: { color: 'default', label: '已识别' }, MITIGATING: { color: 'processing', label: '处理中' },
  RESOLVED: { color: 'success', label: '已解决' }, ACCEPTED: { color: 'warning', label: '已接受' },
};
const MS_STATUS: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'default', label: '待完成' }, COMPLETED: { color: 'success', label: '已完成' }, OVERDUE: { color: 'error', label: '已超期' },
};

export default function InitiativeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [riskModal, setRiskModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<InitiativeRisk | null>(null);
  const [riskMsId, setRiskMsId] = useState<number | null>(null);
  const [msModal, setMsModal] = useState(false);
  const [editingMs, setEditingMs] = useState<MilestoneWithRisks | null>(null);
  const [form] = Form.useForm();
  const { isGuest } = useAuth();

  const fetchDetail = async () => {
    if (!id) return; setLoading(true);
    try {
      const [res, pRes]: any = await Promise.all([initiativeApi.detail(Number(id)), personnelApi.all()]);
      setInitiative(res.data); setPersonnelList(pRes.data || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchDetail(); }, [id]);

  const personOptions = personnelList.map((p) => ({ value: `${p.name}(${p.employeeId})`, label: `${p.name}(${p.employeeId})` }));
  const milestones = initiative?.milestones || [];
  const totalRisks = milestones.reduce((s, m) => s + (m.risks?.length || 0), 0);
  const resolvedRisks = milestones.reduce((s, m) => s + (m.risks?.filter((r) => r.status === 'RESOLVED' || r.status === 'ACCEPTED').length || 0), 0);

  const updateMs = (updater: (prev: MilestoneWithRisks[]) => MilestoneWithRisks[]) => {
    if (!initiative) return;
    setInitiative({ ...initiative, milestones: updater([...milestones]) });
  };

  /* -- milestone handlers -- */
  const handleAddMs = () => { setEditingMs(null); form.resetFields(); form.setFieldsValue({ targetDate: dayjs(), status: 'PENDING' }); setMsModal(true); };
  const handleEditMs = (m: MilestoneWithRisks) => {
    setEditingMs(m);
    form.setFieldsValue({ ...m, targetDate: m.targetDate ? dayjs(m.targetDate) : dayjs(), actualDate: m.actualDate ? dayjs(m.actualDate) : undefined });
    setMsModal(true);
  };
  const handleMsSubmit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, targetDate: (values.targetDate as Dayjs)?.format?.('YYYY-MM-DD') || null, actualDate: (values.actualDate as Dayjs)?.format?.('YYYY-MM-DD') || null };
    if (editingMs?.id) {
      await initiativeApi.updateMilestone(Number(id), editingMs.id, payload);
      updateMs((prev) => prev.map((m) => m.id === editingMs.id ? { ...m, ...payload, risks: m.risks } as MilestoneWithRisks : m));
      message.success('已更新');
    } else {
      const res: any = await initiativeApi.addMilestone(Number(id), payload);
      updateMs((prev) => [...prev, { ...payload, id: res.data.id, initiativeId: Number(id), risks: [] }]);
      message.success('已添加');
    }
    setMsModal(false);
  };
  const handleDeleteMs = async (msId: number) => {
    await initiativeApi.deleteMilestone(Number(id), msId);
    updateMs((prev) => prev.filter((m) => m.id !== msId));
    message.success('已删除');
  };

  /* -- risk handlers (under a milestone) -- */
  const handleAddRisk = (msId: number) => { setEditingRisk(null); setRiskMsId(msId); form.resetFields(); form.setFieldsValue({ identifiedDate: dayjs(), severity: 'MEDIUM', status: 'IDENTIFIED' }); setRiskModal(true); };
  const handleEditRisk = (r: InitiativeRisk) => { setEditingRisk(r); setRiskMsId(r.milestoneId!); form.setFieldsValue({ ...r, identifiedDate: r.identifiedDate ? dayjs(r.identifiedDate) : dayjs(), resolutionDate: r.resolutionDate ? dayjs(r.resolutionDate) : undefined, owner: r.owner || undefined }); setRiskModal(true); };
  const handleRiskSubmit = async () => {
    if (!riskMsId) return;
    const values = await form.validateFields();
    const payload = { ...values, identifiedDate: (values.identifiedDate as Dayjs)?.format?.('YYYY-MM-DD') || null, resolutionDate: (values.resolutionDate as Dayjs)?.format?.('YYYY-MM-DD') || null };
    if (editingRisk?.id) {
      await initiativeApi.updateRisk(Number(id), riskMsId, editingRisk.id, payload);
      message.success('已更新');
    } else {
      await initiativeApi.addRisk(Number(id), riskMsId, payload);
      message.success('已添加');
    }
    setRiskModal(false); fetchDetail();
  };
  const handleDeleteRisk = async (msId: number, riskId: number) => {
    await initiativeApi.deleteRisk(Number(id), msId, riskId);
    fetchDetail();
  };

  const riskColumns: ColumnsType<InitiativeRisk> = [
    { title: '风险', dataIndex: 'title', key: 'title', width: 180, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: '严重', dataIndex: 'severity', key: 'severity', width: 70, render: (s: string) => { const c = SEVERITY_MAP[s] || { color: 'default', label: s }; return <Tag color={c.color} style={{ borderRadius: 20, fontSize: 11 }}>{c.label}</Tag>; } },
    { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: (s: string) => { const c = RISK_STATUS[s] || { color: 'default', label: s }; return <Tag color={c.color} style={{ borderRadius: 20, fontSize: 11 }}>{c.label}</Tag>; } },
    { title: '责任人', dataIndex: 'owner', key: 'owner', width: 110 },
    { title: '闭环时间', dataIndex: 'resolutionDate', key: 'resolutionDate', width: 110, render: (v: string) => { const cl = countdownLabel(v); return <span>{v || '-'}{v ? <Text style={{ fontSize: 10, color: cl.color, fontWeight: 600, display: 'block' }}>{cl.text}</Text> : null}</span>; } },
    { title: '进度', dataIndex: 'progress', key: 'progress', ellipsis: true, render: (v: string) => v ? <Text style={{ fontSize: 12, color: '#475569' }}>{v}</Text> : '-' },
    { title: '', key: 'action', width: 100,
      render: (_, r) => <Space size={0}>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditRisk(r)} {...guestProps(isGuest)} />
        <Popconfirm title="确定删除?" onConfirm={() => handleDeleteRisk(r.milestoneId!, r.id!)}><Button type="link" size="small" danger icon={<DeleteOutlined />} {...guestProps(isGuest)} /></Popconfirm>
      </Space> },
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!initiative) return <Empty description="专项不存在" />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: <a onClick={() => navigate('/initiatives')}>专项跟踪</a> }, { title: initiative.name }]} />

      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04)', marginBottom: 20 }}
        styles={{ body: { padding: '24px 28px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{initiative.name}</div>
            <Text style={{ color: '#64748b', display: 'block' }}>{initiative.description || '暂无描述'}</Text>
            <Space style={{ marginTop: 8 }} size={8}>
              {initiative.owner && <Tag color="blue" style={{ borderRadius: 20, fontWeight: 600 }}>负责人: {initiative.owner}</Tag>}
              <span style={{ fontSize: 13, color: '#64748b' }}>{initiative.startDate || '?'} ~ {initiative.endDate || '?'}</span>
              <Tag color={initiative.status === 'COMPLETED' ? 'success' : initiative.status === 'ON_HOLD' ? 'warning' : 'processing'} style={{ borderRadius: 20, fontWeight: 600 }}>
                {initiative.status === 'COMPLETED' ? '已完成' : initiative.status === 'ON_HOLD' ? '已暂停' : '进行中'}
              </Tag>
            </Space>
          </div>
          <Space size={16}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: resolvedRisks === totalRisks && totalRisks > 0 ? '#22c55e' : '#3b82f6' }}>{resolvedRisks}/{totalRisks}</div>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>风险解决</Text>
            </div>
          </Space>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>里程碑</Text>
        <Button icon={<PlusOutlined />} onClick={handleAddMs} style={{ borderRadius: 10, fontWeight: 600 }} {...guestProps(isGuest)}>添加里程碑</Button>
      </div>

      {milestones.length === 0 ? <Empty description="暂无里程碑" /> : milestones.map((ms) => {
        const risks = ms.risks || [];
        const msDone = risks.every((r) => r.status === 'RESOLVED' || r.status === 'ACCEPTED');
        const effectiveStatus = msDone && risks.length > 0 ? 'COMPLETED' : ms.status;
        const msTag = MS_STATUS[effectiveStatus] || { color: 'default', label: effectiveStatus };
        const cl = countdownLabel(ms.targetDate);
        return (
          <Card key={ms.id} style={{ borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: 'none', marginBottom: 12 }}
            styles={{ body: { padding: '16px 24px' } }}
            title={
              <Space size={8}>
                <Text strong style={{ fontSize: 15 }}>{ms.name}</Text>
                <Tag color={msTag.color} style={{ borderRadius: 20 }}>{msTag.label}</Tag>
                {ms.targetDate && <Text style={{ fontSize: 12, color: cl.color, fontWeight: 600 }}>{ms.targetDate} {cl.text}</Text>}
              </Space>
            }
            extra={
              <Space size={0}>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditMs(ms)} {...guestProps(isGuest)}>编辑</Button>
                <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAddRisk(ms.id!)} {...guestProps(isGuest)}>+风险</Button>
                <Popconfirm title="确定删除? 风险一并删除" onConfirm={() => handleDeleteMs(ms.id!)}><Button type="link" size="small" danger icon={<DeleteOutlined />} {...guestProps(isGuest)}>删除</Button></Popconfirm>
              </Space>
            }>
            {risks.length === 0 ? (
              <Text style={{ color: '#cbd5e1', fontSize: 13 }}>暂无风险</Text>
            ) : (
              <Table columns={riskColumns} dataSource={risks} rowKey="id" pagination={false} size="small" showHeader={true} />
            )}
          </Card>
        );
      })}

      <Modal title={editingRisk ? '编辑风险' : '添加风险'} open={riskModal} onOk={handleRiskSubmit} onCancel={() => setRiskModal(false)} destroyOnClose okButtonProps={{ style: { borderRadius: 10 } }} width={580}>
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="title" label="风险标题" rules={[{ required: true }]}><Input placeholder="风险标题" style={{ borderRadius: 10 }} /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea style={{ borderRadius: 10 }} rows={2} /></Form.Item>
          <Space size={12} style={{ width: '100%', display: 'flex' }}>
            <Form.Item name="severity" label="严重程度" style={{ flex: 1 }}><Select style={{ borderRadius: 10, width: '100%' }}>
              {Object.entries(SEVERITY_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
            </Select></Form.Item>
            <Form.Item name="status" label="状态" style={{ flex: 1 }}><Select style={{ borderRadius: 10, width: '100%' }}>
              {Object.entries(RISK_STATUS).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
            </Select></Form.Item>
          </Space>
          <Form.Item name="owner" label="责任人">
            <Select showSearch placeholder="选择或输入责任人" allowClear style={{ borderRadius: 10 }}
              options={personOptions} filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())} />
          </Form.Item>
          <Space size={12} style={{ width: '100%', display: 'flex' }}>
            <Form.Item name="identifiedDate" label="识别日期" style={{ flex: 1 }}><DatePicker style={{ width: '100%', borderRadius: 10 }} /></Form.Item>
            <Form.Item name="resolutionDate" label="闭环时间" style={{ flex: 1 }}><DatePicker style={{ width: '100%', borderRadius: 10 }} /></Form.Item>
          </Space>
          <Form.Item name="progress" label="处理进度"><Input.TextArea placeholder="当前处理进展..." style={{ borderRadius: 10 }} rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingMs ? '编辑里程碑' : '添加里程碑'} open={msModal} onOk={handleMsSubmit} onCancel={() => setMsModal(false)} destroyOnClose okButtonProps={{ style: { borderRadius: 10 } }}>
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input placeholder="里程碑名称" style={{ borderRadius: 10 }} /></Form.Item>
          <Space size={12} style={{ width: '100%', display: 'flex' }}>
            <Form.Item name="targetDate" label="目标日期" style={{ flex: 1 }}><DatePicker style={{ width: '100%', borderRadius: 10 }} /></Form.Item>
            <Form.Item name="actualDate" label="实际完成" style={{ flex: 1 }}><DatePicker style={{ width: '100%', borderRadius: 10 }} /></Form.Item>
          </Space>
          <Form.Item name="status" label="状态"><Select style={{ borderRadius: 10 }}>
            {Object.entries(MS_STATUS).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select></Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}
