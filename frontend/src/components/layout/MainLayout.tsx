import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Space, Modal, Form, Input, message, Dropdown, Avatar, Tag } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, KeyOutlined, LockOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenuItems } from '@/tools/registry';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTheme, type ThemeKey } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const LOGO_GRADIENTS: Record<ThemeKey, [string, string]> = {
  default:      ['#3b82f6', '#8b5cf6'],
  dark:         ['#60a5fa', '#a78bfa'],
  mui:          ['#1976d2', '#42a5f5'],
  cute:         ['#f472b6', '#fb7185'],
  illustration: ['#52C41A', '#237804'],
  minimal:      ['#4b5563', '#9ca3af'],
  vibrant:      ['#f43f5e', '#fb923c'],
  ocean:        ['#0891b2', '#06b6d4'],
  nature:       ['#22c55e', '#10b981'],
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<ReturnType<typeof getMenuItems>>([]);
  const { current } = useTheme();
  const { user, isGuest, logout } = useAuth();
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdForm] = Form.useForm();
  const isDark = current === 'dark';
  const isIllustration = current === 'illustration';
  const isCute = current === 'cute';
  const gradient = LOGO_GRADIENTS[current] || LOGO_GRADIENTS.default;

  /* ---------- 各主题适配的颜色 / 样式 ---------- */
  let siderBg: string, siderBorder: string, logoTextColor: string;
  let headerBg: string, headerBorder: string, contentBg: string;
  let collapseBg: string, collapseHoverBg: string, collapseColor: string;
  let versionColor: string, dividerColor: string;
  let menuTheme: 'light' | 'dark' = 'light';

  if (isDark) {
    siderBg = '#141414'; siderBorder = 'rgba(255,255,255,0.08)';
    headerBg = '#141414'; headerBorder = 'rgba(255,255,255,0.08)';
    contentBg = '#000000'; logoTextColor = '#e5e7eb';
    collapseBg = 'rgba(255,255,255,0.06)'; collapseHoverBg = 'rgba(255,255,255,0.1)';
    collapseColor = '#9ca3af'; versionColor = '#4b5563'; dividerColor = 'rgba(255,255,255,0.05)';
    menuTheme = 'dark';
  } else if (isIllustration) {
    siderBg = '#FFF9F0'; siderBorder = '3px solid #2C2C2C';
    headerBg = '#FFF9F0'; headerBorder = '3px solid #2C2C2C';
    contentBg = '#FFF3E0'; logoTextColor = '#2C2C2C';
    collapseBg = '#FFF3E0'; collapseHoverBg = '#FFE0B2';
    collapseColor = '#2C2C2C'; versionColor = '#795548'; dividerColor = '2px solid #2C2C2C';
  } else if (isCute) {
    siderBg = 'rgba(255,245,247,0.85)'; siderBorder = '2px solid #fce7f3';
    headerBg = 'rgba(255,255,255,0.7)'; headerBorder = '2px solid #fce7f3';
    contentBg = '#FFF5F7'; logoTextColor = '#be185d';
    collapseBg = 'rgba(236,72,153,0.06)'; collapseHoverBg = 'rgba(236,72,153,0.12)';
    collapseColor = '#ec4899'; versionColor = '#f9a8d4'; dividerColor = '1px solid #fce7f3';
  } else {
    siderBg = 'rgba(255,255,255,0.72)'; siderBorder = '1px solid rgba(0,0,0,0.06)';
    headerBg = 'rgba(255,255,255,0.6)'; headerBorder = '1px solid rgba(0,0,0,0.05)';
    contentBg = '#f8fafc'; logoTextColor = '#0f172a';
    collapseBg = 'rgba(0,0,0,0.03)'; collapseHoverBg = 'rgba(0,0,0,0.06)';
    collapseColor = '#94a3b8'; versionColor = '#cbd5e1'; dividerColor = '1px solid rgba(0,0,0,0.05)';
  }

  const backdrop = isIllustration ? 'none' : 'blur(20px)';

  useEffect(() => { setMenuItems(getMenuItems()); }, []);

  const selectedKeys = [location.pathname];
  const menuGroups = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <Layout style={{ height: '100vh', background: contentBg }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={232}
        style={{ background: siderBg, backdropFilter: backdrop, WebkitBackdropFilter: backdrop, borderRight: siderBorder }}>
        <div style={{ height: 60, display: 'flex', alignItems: 'center', paddingLeft: collapsed ? 22 : 22, gap: 12, borderBottom: dividerColor }}>
          <div style={{ width: 36, height: 36, borderRadius: isIllustration ? 8 : 12, background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isIllustration ? `3px 3px 0 #1B5E20` : `0 4px 12px ${gradient[0]}40` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={isIllustration ? 3 : 2.5} strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="9" strokeOpacity="0.5" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
            </svg>
          </div>
          {!collapsed && <Text strong style={{ fontSize: 16, color: logoTextColor, letterSpacing: -0.3, whiteSpace: 'nowrap', fontWeight: 800 }}>事项跟踪</Text>}
        </div>
        <Menu mode="inline" theme={menuTheme} selectedKeys={selectedKeys}
          style={{ borderRight: 0, marginTop: 12, padding: '0 8px', background: 'transparent' }}
          items={Object.entries(menuGroups).map(([group, items]) => ({
            key: group,
            label: <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.35, paddingLeft: 4 }}>{group}</span>,
            type: 'group' as const,
            children: items.map((item) => ({ key: item.key, icon: item.icon, label: item.label, style: { borderRadius: isCute ? 16 : isIllustration ? 8 : 10, marginBottom: 2, height: 40, lineHeight: '40px' } })),
          }))}
          onClick={({ key }) => navigate(key)} />
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center' }}>
          {!collapsed && <Text style={{ fontSize: 10, color: versionColor }}>Project Tracker v1.0</Text>}
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: headerBg, backdropFilter: backdrop, WebkitBackdropFilter: backdrop, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, borderBottom: headerBorder }}>
          <div onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: 'pointer', width: 34, height: 34, borderRadius: isIllustration ? 6 : 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: collapseColor, fontSize: 15, transition: 'all 0.2s', background: collapseBg }}
            onMouseEnter={(e) => { e.currentTarget.style.background = collapseHoverBg; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = collapseBg; e.currentTarget.style.color = collapseColor; }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeSwitcher />
            {user ? (
              <Dropdown menu={{ items: [
                { key: 'pwd', icon: <KeyOutlined />, label: '修改密码', onClick: () => setPwdModalOpen(true) },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: () => { logout(); navigate('/login'); } },
              ]}} placement="bottomRight">
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 8 }}>
                  <Avatar size={28} style={{ background: '#6366f1' }} icon={<UserOutlined />} />
                  <Text style={{ fontSize: 13, fontWeight: 500, color: logoTextColor }}>{user.name}</Text>
                  {isGuest && <Tag color="orange" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}>游客</Tag>}
                </div>
              </Dropdown>
            ) : (
              <Link to="/login">
                <Button type="primary" size="small" style={{ borderRadius: 8 }}>登录</Button>
              </Link>
            )}
          </div>
        </Header>
        <Content style={{ background: contentBg, overflow: 'auto', padding: 28 }}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>

      <Modal title="修改密码" open={pwdModalOpen} onOk={async () => {
        const values = await pwdForm.validateFields();
        try { await authApi.changePassword(values.oldPassword, values.newPassword); message.success('密码修改成功'); setPwdModalOpen(false); }
        catch { message.error('密码修改失败'); }
      }} onCancel={() => setPwdModalOpen(false)} destroyOnClose okButtonProps={{ style: { borderRadius: 10 } }}>
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="oldPassword" label="原密码" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 4, message: '至少4位' }]}>
            <Input.Password prefix={<KeyOutlined />} style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
