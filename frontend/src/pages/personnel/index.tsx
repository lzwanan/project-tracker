import { lazy } from 'react';
import { TeamOutlined } from '@ant-design/icons';
import { registerTool } from '@/tools/registry';

registerTool({
  id: 'personnel',
  name: '人员管理',
  icon: <TeamOutlined />,
  group: '基础配置',
  routes: [
    {
      path: '/personnel',
      element: lazy(() => import('./PersonnelPage')),
      title: '人员管理',
      showInMenu: true,
    },
  ],
});
