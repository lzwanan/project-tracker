import React from 'react';

export interface ToolRoute {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType>;
  title: string;
  showInMenu?: boolean;
}

export interface ToolConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  group: string;
  routes: ToolRoute[];
}
