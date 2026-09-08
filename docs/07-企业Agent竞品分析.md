# 文档 7 · 企业 Agent 竞品分析

> 文档归属（2026-09-08 整理）：长期企业 Agent 学习与评测草稿，保留原学习状态，不是当前知识库一期的实现说明或验收要求。当前工作见[一期范围记录](00-知识库一期范围与待确认事项.md)。

> 状态：骨架 + 初步对照表（第 1 课联网核实；深度分析由第 7 课填充）
> 覆盖：Glean / Microsoft Copilot Studio / Atlassian Rovo / ServiceNow / Notion / Salesforce Agentforce

## 初步对照表（2026-08，来源：各产品官方文档与发布说明）

| 产品 | 2026 年已做到 | 对我们的参考 |
| --- | --- | --- |
| Atlassian Rovo | Jira Delivery Agent 开箱即用：自动监控看板，识别停滞/逾期/无主任务；日报、交付健康检查、干系人摘要三类自动化模板；Teamwork Graph（150 亿级连接）提供跨工具上下文；Agent 可嵌入 Jira Automation 规则 | 领导设想的"项目进度自动跟踪 + 自动提醒"在 Jira 生态内已实现；必须回答"我们比它多做什么" |
| Microsoft Copilot Studio | 事件触发自主 Agent GA（2025-03）：邮件到达/表更新/文档创建等触发，生成式编排决定调用哪个工具；Activity 页审计每次触发的推理与动作；已知局限：触发以创建者凭据运行 | 事件触发 + 审计的产品化参考；凭据模型的权限风险正是测试要点 |
| Glean | Enterprise Graph（2025 秋 GA）+ 内容触发 Agent（Jira 工单满足条件、Gong 通话、Slack 消息等即触发）、定时触发、跨系统 100+ 动作、权限感知检索、Agent 版本管理 | 知识底座 + 触发式 Agent 的最成熟形态，"Enterprise Context"概念的直接对标 |
| ServiceNow | Sense–Decide–Act–Secure 平台叙事（Knowledge 2026）；AI Agent Orchestrator 协调多 Agent；Context Engine 自带上下文/血缘/权限；AI Control Tower 集中治理；Action Fabric 开放给第三方 Agent | Context Engine ≈ 我们 Fact Layer 设想的商业化对应物；治理设计（Control Tower）值得对标 |
| Salesforce Agentforce | Data Cloud / Data 360 数据变化直接触发 Agent（记录变更/阈值/平台事件/外部 API）；Flow 集成；Agent 落地强依赖 Data Cloud 数据底座 | 佐证"先统一数据底座，再谈主动 Agent"的路线 |
| Notion | Custom Agents GA（2026-02）：日程/邮件/数据库更新/Slack 事件触发；MCP 连接外部系统；企业搜索 Connector 尊重源权限；官方明确提示 Prompt Injection 风险并建仪表护栏 | 轻量触发式 Agent 参考；官方将注入列为核心风险，验证了我们治理层的必要性 |

## 核心结论（第 1 课版本，待深化）

1. "事件触发 + 主动提醒"在 2026 年已是行业标配，不构成差异化。
2. 我们可能的差异化：跨系统证据链（Jira + GitLab + 飞书 + 文档 + 数仓）、核实式追问（不采信单方说法）、防骚扰跟进策略、带证据包且不归责的审慎升级、贴合国内工具链（飞书等）、以及评测体系本身。
3. 需警惕：不要把行业已有能力包装成我们的创新。

## 待填充大纲（第 7 课）

### 1. 逐产品深度分析
每个产品按统一框架：
- [ ] 数据底座（连接器数量、权限模型、结构化/非结构化处理）
- [ ] 上下文构建（图谱/索引/语义层）
- [ ] 触发机制（事件类型、延迟、去重）
- [ ] 行动能力（工具数量、写操作管控）
- [ ] 跟进与升级（是否有状态机、是否只到"通知"为止）
- [ ] 治理（审计、HITL、注入防护）
- [ ] 评测（官方提供什么评测工具）
- [ ] 定价与部署模式

### 2. 能力矩阵
- [ ] 6 产品 × 上述 8 维度打分矩阵

### 3. 差异化定位与 build vs buy 建议
- [ ] 哪些层直接用现成产品、哪些自建
- [ ] 我们的测试体系如何成为竞争力
