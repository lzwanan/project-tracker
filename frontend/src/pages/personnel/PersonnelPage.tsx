import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Card, Tag, Popconfirm, message, Transfer, Avatar, Typography, Upload,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined, SearchOutlined,
  UserOutlined, MailOutlined, IdcardOutlined, DownloadOutlined, UploadOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ColumnsType } from 'antd/es/table';
import { personnelApi, roleApi, type Personnel, type SysRole } from '@/services/personnel';
import { useAuth, guestProps } from '@/context/AuthContext';

const { Text } = Typography;

const AVATAR_COLORS = ['#6366f1','#3b82f6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6'];
const ROLE_TAG_COLORS = ['blue','purple','cyan','green','orange','red','magenta','geekblue'];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function PersonnelPage() {
  const { isGuest } = useAuth();
  const [data, setData] = useState<Personnel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
  const [allRoles, setAllRoles] = useState<SysRole[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [form] = Form.useForm();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [rolePersonId, setRolePersonId] = useState<number | null>(null);
  const [assignedKeys, setAssignedKeys] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await personnelApi.list({ page, size, keyword: keyword || undefined });
      setData(res.data.records || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  }, [page, size, keyword]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    roleApi.list().then((res: any) => setAllRoles(res.data || []));
  }, []);

  const filteredData = roleFilter
    ? data.filter((p) => (p.roles || []).some((r) => r.id === roleFilter))
    : data;

  const handleAdd = () => { setEditingPerson(null); form.resetFields(); form.setFieldValue('roleIds', []); setModalOpen(true); };
  const handleEdit = (r: Personnel) => {
    setEditingPerson(r);
    const roleIds = (r.roles || []).map((role) => role.id);
    form.setFieldsValue({ ...r, roleIds });
    setModalOpen(true);
  };
  const handleDelete = async (id: number) => { await personnelApi.delete(id); message.success('已删除'); fetchData(); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const { roleIds, ...personnelData } = values;
    if (editingPerson?.id) {
      await personnelApi.update(editingPerson.id, personnelData);
      await personnelApi.assignRoles(editingPerson.id, roleIds || []);
      message.success('已更新');
    } else {
      const res: any = await personnelApi.create(personnelData);
      if (res.data?.id) {
        await personnelApi.assignRoles(res.data.id, roleIds || []);
      }
      message.success('已添加');
    }
    setModalOpen(false); fetchData();
  };

  const handleAssignRoles = async (r: Personnel) => {
    setRolePersonId(r.id!);
    const [res1, res2]: any = await Promise.all([roleApi.list(), personnelApi.getRoles(r.id!)]);
    setAllRoles(res1.data || []);
    setAssignedKeys((res2.data || []).map((x: SysRole) => String(x.id)));
    setRoleModalOpen(true);
  };

  const handleRoleOk = async () => {
    if (rolePersonId != null) { await personnelApi.assignRoles(rolePersonId, assignedKeys.map(Number)); message.success('角色已更新'); fetchData(); }
    setRoleModalOpen(false);
  };

  const handleExportTemplate = async () => {
    const res: any = await personnelApi.exportTemplate();
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '人员导入模板.xlsx'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const res: any = await personnelApi.importFile(file);
      message.success(`导入成功，新增 ${res.data} 人`);
      fetchData();
    } catch { message.error('导入失败'); }
    return false;
  };

  const columns: ColumnsType<Personnel> = [
    {
      title: '姓名',
      key: 'name',
      width: 180,
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={40} style={{ background: avatarColor(r.name), fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
            {r.name?.charAt(0)}
          </Avatar>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{r.name}</span>
        </div>
      ),
    },
    {
      title: '工号',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 130,
      render: (v: string) => (
        <span style={{ fontFamily: "'Consolas','Courier New',monospace", fontSize: 13, fontWeight: 600, color: '#6366f1' }}>
          {v}
        </span>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (v: string) => v ? <Text style={{ fontSize: 13, color: '#475569' }}>{v}</Text> : <Text style={{ fontSize: 13, color: '#d1d5db' }}>-</Text>,
    },
    {
      title: '角色',
      key: 'roles',
      render: (_, r) => {
        const roles = r.roles || [];
        if (!roles.length) return <Tag style={{ borderRadius: 20, color: '#94a3b8', borderStyle: 'dashed' }}>未分配</Tag>;
        return (
          <Space size={6} wrap>
            {roles.map((role, idx) => (
              <Tag key={role.id} color={ROLE_TAG_COLORS[idx % ROLE_TAG_COLORS.length]} style={{ margin: 0, borderRadius: 20, padding: '2px 14px', fontSize: 13, fontWeight: 600 }}>
                {role.name}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} {...guestProps(isGuest)} style={{ fontWeight: 500 }}>编辑</Button>
          <Button type="link" size="small" icon={<SafetyCertificateOutlined />} onClick={() => handleAssignRoles(r)} {...guestProps(isGuest)} style={{ fontWeight: 500 }}>角色</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id!)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ fontWeight: 500 }}>删除</Button>
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
        title={<span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>人员管理</span>}
        extra={
          <Space size={12}>
            <Select
              allowClear
              placeholder="按角色筛选"
              style={{ width: 150, borderRadius: 10 }}
              value={roleFilter}
              onChange={(v) => setRoleFilter(v)}
              options={allRoles.map((r) => ({ value: r.id, label: r.name }))}
            />
            <Input
              placeholder="搜索工号或姓名"
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              allowClear
              style={{ width: 200, borderRadius: 12 }}
              onPressEnter={(e: any) => { setKeyword(e.target.value); setPage(1); }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} {...guestProps(isGuest)} style={{ borderRadius: 12, height: 36, fontWeight: 600, boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
              添加人员
            </Button>
            <Upload beforeUpload={handleImport} showUploadList={false} accept=".xlsx">
              <Button icon={<UploadOutlined />} {...guestProps(isGuest)} style={{ borderRadius: 10 }}>导入</Button>
            </Upload>
            <Button icon={<DownloadOutlined />} onClick={handleExportTemplate} style={{ borderRadius: 10 }}>模板下载</Button>
          </Space>
        }
      >
        <Table
          columns={columns} dataSource={filteredData} rowKey="id" loading={loading} size="middle"
          pagination={{
            current: page, pageSize: size, total: roleFilter ? filteredData.length : total,
            showSizeChanger: true, showTotal: (t) => <Text style={{ color: '#94a3b8', fontSize: 13 }}>共 {t} 条</Text>,
            onChange: (p, s) => { setPage(p); setSize(s); },
          }}
          rowClassName={() => 'personnel-table-row'}
        />
      </Card>

      <Modal title={<span style={{ fontSize: 17, fontWeight: 700 }}>{editingPerson ? '编辑人员' : '添加人员'}</span>} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} destroyOnClose okButtonProps={{ style: { borderRadius: 10 } }} cancelButtonProps={{ style: { borderRadius: 10 } }}>
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="employeeId" label="工号" rules={[{ required: true }]}>
            <Input prefix={<IdcardOutlined style={{ color: '#94a3b8' }} />} placeholder="请输入工号" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="请输入姓名" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="请输入邮箱" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Select mode="multiple" placeholder="选择角色" style={{ borderRadius: 10 }}
              options={allRoles.map((r) => ({ value: r.id, label: r.name }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={<span style={{ fontSize: 17, fontWeight: 700 }}>分配角色</span>} open={roleModalOpen} onOk={handleRoleOk} onCancel={() => setRoleModalOpen(false)} width={540} okButtonProps={{ style: { borderRadius: 10 } }} cancelButtonProps={{ style: { borderRadius: 10 } }}>
        <Transfer
          dataSource={allRoles.map((r) => ({ key: String(r.id), title: r.name, description: r.code }))}
          targetKeys={assignedKeys} onChange={(keys) => setAssignedKeys(keys as string[])}
          render={(item) => item.title} listStyle={{ width: 230, height: 350, borderRadius: 12 }}
          showSearch filterOption={(input, item) => item.title.toLowerCase().includes(input.toLowerCase())}
        />
      </Modal>

      <style>{`
        .personnel-table-row td { padding: 16px 16px !important; }
        .personnel-table-row:hover { background: linear-gradient(90deg, #f8fafc, #f1f5f9) !important; }
      `}</style>
    </motion.div>
  );
}
