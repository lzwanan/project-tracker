import { lazy } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { registerTool } from '@/tools/registry';

registerTool({
  id: 'system',
  name: '备份管理',
  icon: <SettingOutlined />,
  group: '系统管理',
  routes: [
    {
      path: '/system',
      element: lazy(() => import('./SystemPage')),
      title: '备份管理',
      showInMenu: true,
    },
  ],
});
