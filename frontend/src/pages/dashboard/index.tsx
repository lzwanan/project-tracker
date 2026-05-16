import { lazy } from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import { registerTool } from '@/tools/registry';

registerTool({
  id: 'dashboard',
  name: '项目看板',
  icon: <CalendarOutlined />,
  group: '项目跟踪',
  routes: [
    {
      path: '/dashboard',
      element: lazy(() => import('./DashboardPage')),
      title: '项目看板',
      showInMenu: true,
    },
  ],
});
