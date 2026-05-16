import { lazy } from 'react';
import { PhoneOutlined } from '@ant-design/icons';
import { registerTool } from '@/tools/registry';

registerTool({
  id: 'oncall',
  name: 'Oncall排班',
  icon: <PhoneOutlined />,
  group: '基础配置',
  routes: [
    {
      path: '/oncalls',
      element: lazy(() => import('./OncallPage')),
      title: 'Oncall排班',
      showInMenu: true,
    },
  ],
});
