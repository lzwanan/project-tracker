import type { ToolConfig, ToolRoute } from './types';

const toolMap = new Map<string, ToolConfig>();

export function registerTool(config: ToolConfig) {
  if (toolMap.has(config.id)) {
    console.warn(`Tool "${config.id}" already registered, skipping.`);
    return;
  }
  toolMap.set(config.id, config);
}

export function getAllTools(): ToolConfig[] {
  return Array.from(toolMap.values());
}

export function getAllRoutes(): ToolRoute[] {
  return getAllTools().flatMap((tool) => tool.routes);
}

export function getMenuItems(): { key: string; label: string; icon: React.ReactNode; group: string }[] {
  return getAllTools().flatMap((tool) =>
    tool.routes
      .filter((r) => r.showInMenu !== false)
      .map((r) => ({
        key: r.path,
        label: tool.name,
        icon: tool.icon,
        group: tool.group,
      }))
  );
}
