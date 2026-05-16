import { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm, message, Table, Typography, Progress, Breadcrumb, Empty, Spin, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { versionApi, type Version, type VersionRequirement, type Stage } from '@/services/version';
import { personnelApi, roleApi, type Personnel, type SysRole } from '@/services/personnel';
import { countdownLabel } from '@/services/dateUtils';
import { useAuth, guestProps } from '@/context/AuthContext';

const { Text } = Typography;

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'default', label: '待开始' },
  IN_PROGRESS: { color: 'processing', label: '进行中' },
  COMPLETED: { color: 'success', label: '已完成' },
  SKIPPED: { color: 'warning', label: '已跳过' },
};

const STAGE_ICON: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircleOutlined style={{ color: '#22c55e' }} />,
  IN_PROGRESS: <ClockCircleOutlined style={{ color: '#3b82f6' }} />,
  PENDING: <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #d1d5db', display: 'inline-block' }} />,
};

export default function VersionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [version, setVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);
  const [reqModal, setReqModal] = useState(false);
  const [editingReq, setEditingReq] = useState<VersionRequirement | null>(null);
  const [stageModal, setStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [parentStageId, setParentStageId] = useState<number | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [roleList, setRoleList] = useState<SysRole[]>([]);
  const [assignRoleFilter, setAssignRoleFilter] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();
  const { isGuest } = useAuth();

  const fetchDetail = async () => {
    if (!id) return; setLoading(true);
    try { const res: any = await versionApi.detail(Number(id)); setVersion(res.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [id]);
  useEffect(() => {
    Promise.all([personnelApi.withRoles(), roleApi.list()]).then(([pRes, rRes]: any[]) => {
      setPersonnelList(pRes.data || []);
      setRoleList(rRes.data || []);
    });
  }, []);

  const stages = version?.stages || [];
  const allStages: Stage[] = [];
  const flatten = (list: Stage[], depth = 0) => { list.forEach(s => { allStages.push({...s, orderSeq: depth}); if (s.children) flatten(s.children, depth + 1); }); };
  flatten(stages);
  const done = allStages.filter(s => s.status === 'COMPLETED').length;
  const pct = allStages.length > 0 ? Math.round((done / allStages.length) * 100) : 0;

  /* ---- requirement handlers ---- */
  const handleAddReq = () => { setEditingReq(null); form.resetFields(); setReqModal(true); };
  const handleEditReq = (r: VersionRequirement) => {
    setEditingReq(r);
    const ids = parseAssignees(r.assignee);
    form.setFieldsValue({ ...r, assigneeIds: ids });
    setReqModal(true);
  };
  const handleReqSubmit = async () => {
    const values = await form.validateFields();
    const selectedIds: number[] = values.assigneeIds || [];
    const assigneeStr = selectedIds
      .map((id) => personnelList.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => `${p!.name}(${p!.employeeId})`)
      .join(',');
    if (editingReq?.id) { await versionApi.updateRequirement(Number(id), editingReq.id, { ...values, assignee: assigneeStr || null }); message.success('已更新'); }
    else { await versionApi.addRequirement(Number(id), { ...values, assignee: assigneeStr || null }); message.success('已添加'); }
    setReqModal(false); fetchDetail();
  };
  const handleDeleteReq = async (reqId: number) => { await versionApi.deleteRequirement(Number(id), reqId); message.success('已删除'); fetchDetail(); };

  /* ---- stage handlers ---- */
  const handleAddStage = (parentId: number | null) => {
    setEditingStage(null); setParentStageId(parentId);
    setAssignRoleFilter(undefined);
    form.resetFields(); setStageModal(true);
  };
  const handleEditStage = (s: Stage) => {
    setEditingStage(s); setParentStageId(s.parentId||null);
    const existingIds = parseAssignees(s.assignee);
    form.setFieldsValue({ name: s.name, status: s.status, dueDate: s.dueDate ? dayjs(s.dueDate) : undefined, assigneeIds: existingIds });
    setAssignRoleFilter(undefined);
    setStageModal(true);
  };

  const parseAssignees = (str?: string): number[] => {
    if (!str) return [];
    const names = str.split(',').map((s) => s.trim()).filter(Boolean);
    return names.map((n) => {
      const found = personnelList.find((p) => `${p.name}(${p.employeeId})` === n);
      return found?.id;
    }).filter((id): id is number => id !== undefined);
  };

  const filteredPersonnel = assignRoleFilter
    ? personnelList.filter((p) => (p.roles || []).some((r) => r.id === assignRoleFilter))
    : personnelList;
  const handleStageSubmit = async () => {
    const values = await form.validateFields();
    const selectedIds: number[] = values.assigneeIds || [];
    const assigneeStr = selectedIds
      .map((id) => personnelList.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => `${p!.name}(${p!.employeeId})`)
      .join(',');
    const payload = { ...values, assignee: assigneeStr || null, dueDate: (values.dueDate as Dayjs)?.format?.('YYYY-MM-DD') || null, parentId: parentStageId };
    if (editingStage?.id) { await versionApi.updateStage(Number(id), editingStage.id, payload); message.success('已更新'); }
    else { await versionApi.addStage(Number(id), payload); message.success('已添加'); }
    setStageModal(false); fetchDetail();
  };
  const handleDeleteStage = async (stageId: number) => { await versionApi.deleteStage(Number(id), stageId); message.success('已删除'); fetchDetail(); };
  const toggleStage = async (s: Stage) => {
    if (!version) return;
    const ns = s.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const newStages = JSON.parse(JSON.stringify(version.stages || [])) as Stage[];

    const setRecursive = (node: Stage) => {
      node.status = ns;
      if (node.children) {
        node.children.forEach(setRecursive);
      }
    };

    const updateNode = (list: Stage[]): boolean => {
      for (const node of list) {
        if (node.id === s.id) {
          setRecursive(node);
          return true;
        }
        if (node.children && updateNode(node.children)) {
          const allDone = node.children.every((c) => c.status === 'COMPLETED');
          if (ns === 'COMPLETED' && allDone) node.status = 'COMPLETED';
          else if (ns === 'PENDING' && node.status === 'COMPLETED') node.status = 'IN_PROGRESS';
          return true;
        }
      }
      return false;
    };
    updateNode(newStages);

    setVersion({ ...version, stages: newStages });
    await versionApi.updateStage(Number(id), s.id!, { status: ns } as any);
  };

  /* ---- requirement table columns ---- */
  const reqColumns: ColumnsType<VersionRequirement> = [
    { title: '需求名称', dataIndex: 'name', key: 'name', width: 240, render: (v: string) => <Text strong style={{fontSize:14}}>{v}</Text> },
    { title: '需求编号', dataIndex: 'reqNumber', key: 'reqNumber', width: 140, render: (v: string) => v ? <Text code style={{fontSize:13}}>{v}</Text> : '-' },
    { title: '责任人', dataIndex: 'assignee', key: 'assignee', width: 160, render: (v: string) => v || '-' },
    {
      title: '操作', key: 'action', width: 150,
      render: (_, r) => <Space size={0}>
        <Button type="link" size="small" icon={<EditOutlined/>} onClick={()=>handleEditReq(r)} {...guestProps(isGuest)}>编辑</Button>
        <Popconfirm title="确定删除?" onConfirm={()=>handleDeleteReq(r.id!)}><Button type="link" size="small" danger icon={<DeleteOutlined/>} {...guestProps(isGuest)}>删除</Button></Popconfirm>
      </Space>,
    },
  ];

  /* ---- render stage tree ---- */
  const toggleCollapse = (sid: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid); else next.add(sid);
      return next;
    });
  };

  const renderStage = (node: Stage, depth: number): React.ReactNode => {
    const tag = STATUS_TAG[node.status] || { color: 'default', label: node.status };
    const cl = countdownLabel(node.dueDate);
    const hasChildren = (node.children?.length || 0) > 0;
    const isCollapsed = collapsedIds.has(node.id!);
    const nameSize = depth === 0 ? 16 : depth === 1 ? 14 : 13;
    const nameWeight = depth <= 1 ? 700 : 500;
    const rowPadding = depth === 0 ? '14px 16px' : depth === 1 ? '11px 16px' : '8px 14px';

    return (
      <div key={node.id}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: rowPadding, marginLeft: depth * 24,
          borderRadius: 10, background: depth === 0 ? '#f8fafc' : '#fff',
          border: depth === 0 ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
          marginBottom: 4, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = depth === 0 ? '#f1f5f9' : '#f8fafc'; }}
          onMouseLeave={e => { e.currentTarget.style.background = depth === 0 ? '#f8fafc' : '#fff'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            {hasChildren && (
              <span onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id!); }}
                style={{ cursor: 'pointer', flexShrink: 0, color: '#64748b', fontSize: 14 }}>
                {isCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
              </span>
            )}
            <span onClick={() => toggleStage(node)} style={{ cursor: 'pointer', flexShrink: 0 }}>
              {STAGE_ICON[node.status] || STAGE_ICON.PENDING}
            </span>
            <div style={{ minWidth: 0 }}>
              <Text style={{
                fontSize: nameSize, fontWeight: nameWeight,
                color: node.status === 'COMPLETED' ? '#94a3b8' : depth === 0 ? '#0f172a' : '#1e293b',
                textDecoration: node.status === 'COMPLETED' ? 'line-through' : 'none',
              }}>{node.name}</Text>
            </div>
            {node.assignee && (
              <Space size={4} wrap style={{ flexShrink: 0 }}>
                {node.assignee.split(',').map((name, i) => (
                  <Tag key={i} style={{ borderRadius: 20, margin: 0 }}>{name.trim()}</Tag>
                ))}
              </Space>
            )}
            {node.dueDate && <Text style={{ fontSize: 12, color: cl.color, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{node.dueDate} {cl.text}</Text>}
            <Tag color={tag.color} style={{ borderRadius: 20, flexShrink: 0 }}>{tag.label}</Tag>
            {hasChildren && <Text style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{node.children!.length} 项</Text>}
          </div>
          <Space size={0} style={{ flexShrink: 0, marginLeft: 8 }}>
            <Button type="link" size="small" icon={<EditOutlined/>} onClick={() => handleEditStage(node)} {...guestProps(isGuest)}>编辑</Button>
            <Button type="link" size="small" icon={<PlusOutlined/>} onClick={() => handleAddStage(node.id!)} {...guestProps(isGuest)}>+子项</Button>
            <Popconfirm title="确定删除? 子项会一并删除" onConfirm={() => handleDeleteStage(node.id!)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined/>} {...guestProps(isGuest)}>删除</Button>
            </Popconfirm>
          </Space>
        </div>
        {!isCollapsed && node.children?.map(child => renderStage(child, depth + 1))}
      </div>
    );
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!version) return <Empty description="版本不存在" />;

  const verCountdown = countdownLabel(version.plannedDate);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: <a onClick={() => navigate('/versions')}>版本跟踪</a> }, { title: version.name }]} />

      {/* 版本信息头 */}
      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04)', marginBottom: 20 }}
        styles={{ body: { padding: '24px 28px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Text style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'Consolas,monospace' }}>{version.name}</Text>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{version.description || '暂无描述'}</div>
            <Space style={{ marginTop: 8 }}>
              {version.owner && <Tag color="blue" style={{ borderRadius: 20, fontWeight: 600 }}>负责人: {version.owner}</Tag>}
              <span style={{ fontSize: 13, color: verCountdown.color, fontWeight: 700 }}>
                {version.plannedDate ? `上线: ${version.plannedDate} ${verCountdown.text}` : ''}
              </span>
            </Space>
          </div>
          <Progress type="circle" percent={pct} size={72} strokeColor={pct === 100 ? '#22c55e' : '#3b82f6'} />
        </div>
      </Card>

      {/* 版本需求 */}
      <Card
        style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: 20 }}
        styles={{ body: { padding: '20px 24px' } }}
        title={<Text style={{ fontSize: 16, fontWeight: 700 }}>版本需求</Text>}
        extra={<Button type="primary" size="small" icon={<PlusOutlined/>} onClick={handleAddReq} style={{ borderRadius: 10 }} {...guestProps(isGuest)}>添加需求</Button>}
      >
        <Table columns={reqColumns} dataSource={version.requirements || []} rowKey="id" pagination={false} size="small"
          locale={{ emptyText: <Empty description="暂无需求"/> }} />
      </Card>

      {/* 阶段树 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>阶段跟踪</Text>
        <Button icon={<PlusOutlined/>} onClick={() => handleAddStage(null)} style={{ borderRadius: 10, fontWeight: 600 }} {...guestProps(isGuest)}>添加阶段</Button>
      </div>
      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }} styles={{ body: { padding: '20px 24px' } }}>
        {stages.length === 0 ? <Empty description="暂无阶段" /> : stages.map(s => renderStage(s, 0))}
      </Card>

      {/* 需求弹窗 */}
      <Modal title={editingReq ? '编辑需求' : '添加需求'} open={reqModal} onOk={handleReqSubmit} onCancel={() => setReqModal(false)} destroyOnClose okButtonProps={{style:{borderRadius:10}}} width={500}>
        <Form form={form} layout="vertical" style={{marginTop:20}}>
          <Form.Item name="name" label="需求名称" rules={[{required:true}]}><Input placeholder="例如: 用户中心改版" style={{borderRadius:10}}/></Form.Item>
          <Form.Item name="reqNumber" label="需求编号"><Input placeholder="REQ-001" style={{borderRadius:10}}/></Form.Item>
          <Form.Item name="assigneeIds" label="责任人">
            <Select mode="multiple" showSearch placeholder="选择人员" optionFilterProp="label" maxTagCount={3}
              style={{ width: '100%', borderRadius: 10 }}
              options={personnelList.map((p) => ({ value: p.id, label: `${p.name}(${p.employeeId})` }))} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 阶段弹窗 */}
      <Modal title={editingStage ? '编辑阶段' : '添加阶段'} open={stageModal} onOk={handleStageSubmit} onCancel={() => setStageModal(false)} destroyOnClose okButtonProps={{style:{borderRadius:10}}} width={560}>
        <Form form={form} layout="vertical" style={{marginTop:20}}>
          <Form.Item name="name" label="名称" rules={[{required:true}]}><Input placeholder="阶段名称" style={{borderRadius:10}}/></Form.Item>
          <Form.Item label="责任人">
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <Select
                allowClear placeholder="按角色筛选（可选）"
                style={{ width: '100%', borderRadius: 10 }}
                value={assignRoleFilter}
                onChange={(v) => { setAssignRoleFilter(v); form.setFieldValue('assigneeIds', []); }}
                options={roleList.map((r) => ({ value: r.id, label: r.name }))}
              />
              <Form.Item name="assigneeIds" noStyle>
                <Select
                  mode="multiple" showSearch placeholder="选择人员"
                  optionFilterProp="label" maxTagCount={3}
                  style={{ width: '100%', borderRadius: 10 }}
                  options={filteredPersonnel.map((p) => ({ value: p.id, label: `${p.name}(${p.employeeId})` }))}
                />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item name="dueDate" label="截止日期"><DatePicker style={{width:'100%',borderRadius:10}}/></Form.Item>
          <Form.Item name="status" label="状态"><Select style={{borderRadius:10}}>
            <Select.Option value="PENDING">待开始</Select.Option>
            <Select.Option value="IN_PROGRESS">进行中</Select.Option>
            <Select.Option value="COMPLETED">已完成</Select.Option>
            <Select.Option value="SKIPPED">已跳过</Select.Option>
          </Select></Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}
