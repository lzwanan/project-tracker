import { lazy } from 'react';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { registerTool } from '@/tools/registry';

registerTool({
  id: 'role',
  name: '角色管理',
  icon: <SafetyCertificateOutlined />,
  group: '基础配置',
  routes: [
    {
      path: '/roles',
      element: lazy(() => import('./RolePage')),
      title: '角色管理',
      showInMenu: true,
    },
  ],
});
