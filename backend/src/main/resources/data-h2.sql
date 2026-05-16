-- 初始化角色数据
MERGE INTO sys_role (id, name, code, description) KEY(code) VALUES
(1, '版本负责人', 'VERSION_OWNER', '负责整体版本的质量和进度'),
(2, 'Oncall人员', 'ONCALL', '版本月度Oncall轮值人员'),
(3, '开发工程师', 'DEVELOPER', '版本开发人员'),
(4, '测试工程师', 'TESTER', '版本测试人员'),
(5, '产品经理', 'PM', '需求定义和串讲'),
(6, '专项负责人', 'INITIATIVE_OWNER', '专项整体负责人'),
(7, '系统管理员', 'ADMIN', '系统管理员，可管理用户和备份'),
(8, '游客', 'GUEST', '游客账户，仅有查询权限');

-- 初始化人员数据
MERGE INTO personnel (id, employee_id, name, email) KEY(employee_id) VALUES
(1, 'E001', '张三', 'zhangsan@example.com'),
(2, 'E002', '李四', 'lisi@example.com'),
(3, 'E003', '王五', 'wangwu@example.com'),
(4, 'admin', '管理员', 'admin@example.com'),
(5, 'guest', '游客', null);

-- 角色分配
MERGE INTO personnel_role (id, personnel_id, role_id) KEY(personnel_id, role_id) VALUES
(1, 1, 7),
(2, 4, 7),
(3, 5, 8);

-- 初始化Oncall排班数据
MERGE INTO monthly_oncall (id, year_month, oncall_person_id, backup_person_id) KEY(year_month) VALUES
(1, '2026-05', 1, 2),
(2, '2026-06', 2, 3),
(3, '2026-07', 3, 1);

-- =================== 版本跟踪种子数据 ===================
-- 版本
MERGE INTO version (id, name, description, status, owner, planned_date) KEY(id) VALUES
(1, '20260630版本', 'Q2末版本发布，包含用户中心改版与支付流程优化', 'IN_PROGRESS', '张三(E001)', '2026-06-30'),
(2, '20260430版本', 'Q1末版本，基础架构升级', 'RELEASED', '李四(E002)', '2026-04-30');

-- 版本需求
MERGE INTO version_requirement (id, version_id, name, req_number, assignee) KEY(id) VALUES
(1, 1, '用户中心改版', 'REQ-001', '张三(E001)'),
(2, 1, '支付流程优化', 'REQ-002', '李四(E002)');

-- 版本阶段（嵌套结构）
MERGE INTO version_stage (id, version_id, parent_id, name, order_seq, status, due_date, assignee) KEY(id) VALUES
-- 需求准入 (parent)
(1, 1, null, '需求准入', 1, 'IN_PROGRESS', null, null),
--   需求串讲
(2, 1, 1, '需求串讲', 1, 'COMPLETED', '2026-05-08', '产品经理'),
--   需求设计
(3, 1, 1, '需求设计', 2, 'COMPLETED', '2026-05-15', '需求责任人'),
--   需求评审 (parent)
(4, 1, 1, '需求评审', 3, 'IN_PROGRESS', null, null),
--     CCB评审议题申报
(5, 1, 4, 'CCB评审议题申报', 1, 'PENDING', '2026-05-18', '需求责任人'),

-- 研发串讲 (parent, per requirement)
(6, 1, null, '研发串讲', 2, 'PENDING', null, null),
(7, 1, 6, '用户中心改版', 1, 'PENDING', '2026-05-22', '张三(E001)'),
(8, 1, 6, '支付流程优化', 2, 'PENDING', '2026-05-22', '李四(E002)'),

-- 测试串讲
(9, 1, null, '测试串讲', 3, 'PENDING', '2026-05-25', '测试工程师'),

-- 需求开发 (parent, per requirement)
(10, 1, null, '需求开发', 4, 'PENDING', null, null),
(11, 1, 10, '用户中心改版', 1, 'PENDING', '2026-06-05', '张三(E001)'),
(12, 1, 10, '支付流程优化', 2, 'PENDING', '2026-06-05', '李四(E002)'),

-- 需求转测 (parent, per requirement)
(13, 1, null, '需求转测', 5, 'PENDING', null, null),
(14, 1, 13, '用户中心改版', 1, 'PENDING', '2026-06-12', '张三(E001)'),
(15, 1, 13, '支付流程优化', 2, 'PENDING', '2026-06-12', '李四(E002)'),

-- 版本发布 (parent)
(16, 1, null, '版本发布', 6, 'PENDING', null, null),
--   发布前检查 (parent)
(17, 1, 16, '发布前检查', 1, 'PENDING', null, null),
(18, 1, 17, '超期包检查', 1, 'PENDING', '2026-06-25', '李四(E002)'),
(19, 1, 17, '漏洞检查', 2, 'PENDING', '2026-06-25', '王五(E003)'),
(20, 1, 17, '版本升级指导书检查', 3, 'PENDING', '2026-06-26', '王五(E003)'),
--   灰度发布 (parent)
(21, 1, 16, '灰度发布', 2, 'PENDING', null, null),
(22, 1, 21, '前端Beta部署', 1, 'PENDING', '2026-06-27', '张三(E001)'),
(23, 1, 21, '后端Beta部署', 2, 'PENDING', '2026-06-27', '李四(E002)'),
--   正式发布 (parent)
(24, 1, 16, '正式发布', 3, 'PENDING', null, null),
--     A局点 (parent)
(25, 1, 24, 'A局点', 1, 'PENDING', null, null),
(26, 1, 25, '前端发布', 1, 'PENDING', '2026-06-29', '张三(E001)'),
(27, 1, 25, '后端发布', 2, 'PENDING', '2026-06-29', '李四(E002)'),
--     B局点 (parent)
(28, 1, 24, 'B局点', 2, 'PENDING', null, null),
(29, 1, 28, '前端发布', 1, 'PENDING', '2026-06-30', '张三(E001)'),
(30, 1, 28, '后端发布', 2, 'PENDING', '2026-06-30', '李四(E002)');

-- 专项数据
MERGE INTO initiative (id, name, description, status, owner, start_date, end_date) KEY(id) VALUES
(1, 'Q2 架构升级专项', '数据库迁移至分布式架构 + 服务拆分', 'ACTIVE', '李四(E002)', '2026-04-01', '2026-06-30'),
(2, '安全合规专项', 'GDPR合规 + 渗透测试修复', 'ACTIVE', '张三(E001)', '2026-05-01', '2026-07-31');

-- 专项里程碑
MERGE INTO initiative_milestone (id, initiative_id, name, target_date, status) KEY(id) VALUES
(1, 1, '架构方案评审通过', '2026-04-15', 'COMPLETED'),
(2, 1, '数据迁移完成', '2026-05-30', 'PENDING'),
(3, 1, '服务拆分上线', '2026-06-30', 'PENDING'),
(4, 2, '渗透测试修复完成', '2026-05-20', 'PENDING'),
(5, 2, 'GDPR合规审计通过', '2026-06-30', 'PENDING'),
(6, 2, '安全合规最终验收', '2026-07-31', 'PENDING');

-- 专项风险 (关联里程碑)
MERGE INTO initiative_risk (id, initiative_id, milestone_id, title, description, severity, status, owner, identified_date, resolution_date, progress) KEY(id) VALUES
(1, 1, 1, '数据迁移方案被驳回', '评审委员会对迁移方案有异议', 'HIGH', 'RESOLVED', '王五(E003)', '2026-04-10', '2026-04-15', '已重新修订方案并通过'),
(2, 1, 2, '数据迁移兼容性', '新老数据库字段类型不一致，可能导致关联查询失败', 'HIGH', 'MITIGATING', '王五(E003)', '2026-04-15', '2026-05-30', '已完成 80% 字段映射，剩余 3 表待迁移'),
(3, 1, 2, '数据丢失风险', '迁移过程中可能存在数据丢失', 'CRITICAL', 'MITIGATING', '李四(E002)', '2026-04-20', '2026-05-28', '已做全量备份，灰度迁移验证中'),
(4, 1, 3, '服务拆分性能下降', '拆分后跨服务调用延迟增加 200ms', 'MEDIUM', 'IDENTIFIED', '李四(E002)', '2026-04-20', '2026-05-25', '正在搭建链路追踪，定位瓶颈节点'),
(5, 2, 4, '渗透测试高危漏洞', 'SQL注入漏洞 3 处，XSS 漏洞 5 处', 'CRITICAL', 'MITIGATING', '王五(E003)', '2026-05-05', '2026-05-20', 'SQL注入已修复，XSS 修复中（剩余 2 处）'),
(6, 2, 5, 'GDPR合规文档缺失', '部分数据处理协议未签署', 'HIGH', 'IDENTIFIED', '张三(E001)', '2026-05-08', '2026-06-15', '法务正在起草协议模板'),
(7, 2, 5, '用户数据导出接口不合规', '导出接口未做脱敏处理', 'HIGH', 'MITIGATING', '李四(E002)', '2026-05-10', '2026-06-10', '脱敏方案已确定，开发中'),
(8, 2, 6, '第三方审计排期延后', '外部审计机构排期已满，预计推迟 2 周', 'LOW', 'ACCEPTED', '李四(E002)', '2026-05-10', '2026-06-30', '已接受延迟，调整后续计划');
