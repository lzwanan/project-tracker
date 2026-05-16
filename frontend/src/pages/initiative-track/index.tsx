import { lazy } from 'react';
import { AimOutlined } from '@ant-design/icons';
import { registerTool } from '@/tools/registry';

registerTool({
  id: 'initiative-track',
  name: '专项跟踪',
  icon: <AimOutlined />,
  group: '项目跟踪',
  routes: [
    {
      path: '/initiatives',
      element: lazy(() => import('./InitiativeListPage')),
      title: '专项跟踪',
      showInMenu: true,
    },
    {
      path: '/initiatives/:id',
      element: lazy(() => import('./InitiativeDetailPage')),
      title: '专项详情',
      showInMenu: false,
    },
  ],
});
