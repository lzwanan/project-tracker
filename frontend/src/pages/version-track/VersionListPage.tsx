import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Space, Card, Tag, Popconfirm, message, Progress, Typography, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined, DownloadOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { versionApi, type Version } from '@/services/version';
import { countdownLabel } from '@/services/dateUtils';
import { useAuth, guestProps } from '@/context/AuthContext';

const { Text } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PLANNING: { color: 'default', label: '规划中' },
  IN_PROGRESS: { color: 'processing', label: '进行中' },
  RELEASED: { color: 'success', label: '已上线' },
  CANCELLED: { color: 'error', label: '已取消' },
};

export default function VersionListPage() {
  const [data, setData] = useState<Version[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyTargetId, setCopyTargetId] = useState<number | null>(null);
  const [copyName, setCopyName] = useState('');
  const [editing, setEditing] = useState<Version | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isGuest } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await versionApi.list({ page, size: 10, keyword: keyword || undefined, sortBy, sortOrder, status: statusFilter });
      setData(res.data.records || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  }, [page, keyword, sortBy, sortOrder, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTableChange = (pagination: TablePaginationConfig, _filters: any, sorter: any) => {
    if (pagination.current) setPage(pagination.current);
    if (sorter.order) {
      setSortBy(sorter.columnKey === 'plannedDate' ? 'plannedDate' : 'progress');
      setSortOrder(sorter.order);
    } else {
      setSortBy(undefined);
      setSortOrder(undefined);
    }
  };

  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: Version) => {
    setEditing(r);
    form.setFieldsValue({ ...r, plannedDate: r.plannedDate ? dayjs(r.plannedDate) : undefined });
    setModalOpen(true);
  };
  const handleDelete = async (id: number) => { await versionApi.delete(id); message.success('已删除'); fetchData(); };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, plannedDate: (values.plannedDate as Dayjs)?.format?.('YYYY-MM-DD') || null };
    if (editing?.id) { await versionApi.update(editing.id, payload); message.success('已更新'); }
    else { await versionApi.create(payload); message.success('已添加'); }
    setModalOpen(false); fetchData();
  };
  const handleCopy = (r: Version) => { setCopyTargetId(r.id!); setCopyName(r.name + '-副本'); setCopyModalOpen(true); };
  const handleCopyConfirm = async () => {
    if (!copyTargetId || !copyName.trim()) { message.warning('请输入新版本名称'); return; }
    await versionApi.copy(copyTargetId, copyName.trim());
    message.success('复制成功'); setCopyModalOpen(false); fetchData();
  };
  const handleExportTemplate = async () => {
    const res: any = await versionApi.exportTemplate();
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '版本导入模板.xlsx'; a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = async (file: File) => {
    try { await versionApi.importFile(file); message.success('导入成功'); fetchData(); } catch { message.error('导入失败'); }
    return false;
  };

  const columns: ColumnsType<Version> = [
    {
      title: '版本', key: 'info', width: 260,
      render: (_, r) => (
        <div>
          <a onClick={() => navigate(`/versions/${r.id}`)} style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', fontFamily: 'Consolas,monospace', cursor: 'pointer' }}>
            {r.name}
          </a>
          {r.owner && <Text style={{ fontSize: 12, color: '#6366f1', display: 'block' }}>负责人: {r.owner}</Text>}
        </div>
      ),
    },
    {
      title: '上线时间', dataIndex: 'plannedDate', key: 'plannedDate', width: 130,
      sorter: true,
      render: (v: string, r) => {
        const cl = countdownLabel(v);
        return <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{v || '-'}</div>
          {v && r.status !== 'RELEASED' && <Text style={{ fontSize: 11, color: cl.color, fontWeight: 600 }}>{cl.text}</Text>}
        </div>;
      },
    },
    {
      title: '进度', key: 'progress', width: 150, sorter: true,
      render: (_, r) => {
        const stages = r.stages || [];
        const all = stages.flatMap(s => [s, ...(s.children || [])]);
        const done = all.filter(s => s.status === 'COMPLETED' || s.status === 'SKIPPED').length;
        const pct = all.length > 0 ? Math.round((done / all.length) * 100) : 0;
        return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={pct} size="small" style={{ width: 80, margin: 0 }} strokeColor={pct===100?'#22c55e':'#3b82f6'} />
          <Text style={{ fontSize: 11, color: '#64748b' }}>{done}/{all.length}</Text>
        </div>;
      },
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (s: string) => { const c = STATUS_MAP[s]||{color:'default',label:s}; return <Tag color={c.color} style={{borderRadius:20,fontWeight:600}}>{c.label}</Tag>; } },
    {
      title: '操作', key: 'action', width: 200,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/versions/${r.id}`)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} {...guestProps(isGuest)}>编辑</Button>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(r)} {...guestProps(isGuest)}>复制</Button>
          <Popconfirm title="确定删除?" onConfirm={()=>handleDelete(r.id!)}><Button type="link" size="small" danger icon={<DeleteOutlined />} {...guestProps(isGuest)}>删除</Button></Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}}>
      <Card style={{borderRadius:16,border:'none',boxShadow:'0 1px 2px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04)'}} styles={{body:{padding:'24px 28px'}}}
        title={<span style={{fontSize:18,fontWeight:700,color:'#0f172a'}}>版本跟踪</span>}
        extra={
          <Space>
            <Input prefix={<SearchOutlined style={{color:'#94a3b8'}}/>} placeholder="搜索版本名称" allowClear style={{width:180,borderRadius:10}}
              onPressEnter={(e:any)=>{setKeyword(e.target.value);setPage(1);}} />
            <Select allowClear placeholder="状态" style={{width:110,borderRadius:10}} value={statusFilter} onChange={(v)=>{setStatusFilter(v);setPage(1);}}
              options={Object.entries(STATUS_MAP).map(([k,v])=>({value:k,label:v.label}))} />
            <Upload beforeUpload={handleImport} showUploadList={false} accept=".xlsx" {...guestProps(isGuest)}><Button icon={<UploadOutlined/>} style={{borderRadius:10}} {...guestProps(isGuest)}>导入</Button></Upload>
            <Button icon={<DownloadOutlined/>} onClick={handleExportTemplate} style={{borderRadius:10}} {...guestProps(isGuest)}>模板</Button>
            <Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd} style={{borderRadius:12,height:36,fontWeight:600}} {...guestProps(isGuest)}>添加版本</Button>
          </Space>
        }>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="middle" onChange={handleTableChange}
          pagination={{current:page,pageSize:10,total,showTotal:(t)=><Text style={{color:'#94a3b8'}}>共 {t} 条</Text>,onChange:(p)=>setPage(p)}}/>
      </Card>

      <Modal title={editing?'编辑版本':'添加版本'} open={modalOpen} onOk={handleSubmit} onCancel={()=>setModalOpen(false)} destroyOnClose okButtonProps={{style:{borderRadius:10}}}>
        <Form form={form} layout="vertical" style={{marginTop:20}}>
          <Form.Item name="name" label="版本名称" rules={[{required:true}]}><Input placeholder="20260630版本" style={{borderRadius:10}}/></Form.Item>
          <Form.Item name="owner" label="版本责任人"><Input placeholder="张三(E001)" style={{borderRadius:10}}/></Form.Item>
          <Form.Item name="plannedDate" label="计划上线时间"><DatePicker style={{width:'100%',borderRadius:10}}/></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea style={{borderRadius:10}} rows={2}/></Form.Item>
          {editing && <Form.Item name="status" label="状态"><Select style={{borderRadius:10}}>
            <Select.Option value="PLANNING">规划中</Select.Option>
            <Select.Option value="IN_PROGRESS">进行中</Select.Option>
            <Select.Option value="RELEASED">已上线</Select.Option>
            <Select.Option value="CANCELLED">已取消</Select.Option>
          </Select></Form.Item>}
        </Form>
      </Modal>

      <Modal title="复制版本" open={copyModalOpen} onOk={handleCopyConfirm} onCancel={() => setCopyModalOpen(false)} okText="确认复制" okButtonProps={{style:{borderRadius:10}}}>
        <Form layout="vertical" style={{marginTop:20}}>
          <Form.Item label="新版本名称" required>
            <Input value={copyName} onChange={e => setCopyName(e.target.value)} placeholder="请输入新版本名称" style={{borderRadius:10}}/>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}
