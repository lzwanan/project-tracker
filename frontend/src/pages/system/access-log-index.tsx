import { lazy } from 'react';
import { LoginOutlined } from '@ant-design/icons';
import { registerTool } from '@/tools/registry';

registerTool({
  id: 'access-log',
  name: '访问记录',
  icon: <LoginOutlined />,
  group: '系统管理',
  routes: [
    {
      path: '/access-logs',
      element: lazy(() => import('./AccessLogPage')),
      title: '访问记录',
      showInMenu: true,
    },
  ],
});
