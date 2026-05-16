import { lazy } from 'react';
import { RocketOutlined } from '@ant-design/icons';
import { registerTool } from '@/tools/registry';

registerTool({
  id: 'version-track',
  name: '版本跟踪',
  icon: <RocketOutlined />,
  group: '项目跟踪',
  routes: [
    {
      path: '/versions',
      element: lazy(() => import('./VersionListPage')),
      title: '版本跟踪',
      showInMenu: true,
    },
    {
      path: '/versions/:id',
      element: lazy(() => import('./VersionDetailPage')),
      title: '版本详情',
      showInMenu: false,
    },
  ],
});
