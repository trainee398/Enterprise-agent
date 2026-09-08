# 文档 2 · Enterprise Context / Fact Layer 设计理解

> 文档归属（2026-09-08 整理）：长期企业 Agent 学习与评测草稿，保留原学习状态，不是当前知识库一期的实现说明或验收要求。当前工作见[一期范围记录](00-知识库一期范围与待确认事项.md)。

> 状态：骨架（主体内容由第 3–4 课填充；第 1 课已确立基本定位）
> 目标：能在架构评审中讲清 Fact Layer 是什么、不是什么、怎么建、怎么测

## 已确立的结论（第 1 课）

- Fact Layer 是设计模式而非行业成熟组件：跨系统、带来源/权威度/时间/权限/溯源的结构化事实断言库，本质是 Agent 的"证据库"。
- 行业最接近对应物：ServiceNow Context Engine、Glean Knowledge Graph、Palantir Ontology；与数仓 Fact Table 同名不同义。
- Enterprise Context ≈ Agent 评估某个具体情境时，从事实层 + 检索临时组装出的工作上下文。
- 转述事实单独立档："某人说过 X"是事实，"X 为真"是待核实主张。

## 待填充大纲

### 1. 概念定位：是什么 / 不是什么
- [ ] 与 Knowledge Graph 的区别（KG 是通用图谱；Fact Layer 是带时效与溯源的断言子集）
- [ ] 与 Semantic Layer 的区别（指标口径定义 vs 事实实例存储；两者如何协作）
- [ ] 与 RAG Context 的区别（临时检索拼装 vs 持久结构化断言）
- [ ] 与数据库/数仓的区别（面向业务运行/分析 vs 面向 Agent 判断）
- [ ] 与 Agent Memory / 时序知识图谱（Zep、Graphiti 一类）的关系

### 2. Fact Schema 设计
- [ ] 字段逐一论证：fact_id / subject / predicate / value / unit / period / source / source_type / source_version / authority / confidence / permission / freshness / last_verified / provenance
- [ ] 实体消歧与 ID 体系（两个张三问题）
- [ ] 转述事实（utterance）的建模方式

### 3. Fact 生命周期
- [ ] 产生：结构化直采 vs 非结构化抽取（两条路径的可信度差异）
- [ ] 更新：什么触发重抽取/重验证
- [ ] 冲突处理：权威源优先级（system_of_record）、多源对账、人工仲裁入口
- [ ] 失效与回滚：错误事实如何撤销，下游引用如何联动
- [ ] Temporal Fact：时点值 vs 区间值、valid_from / valid_to、历史版本

### 4. 权限与溯源
- [ ] 权限继承规则：源文档受限 → 抽出的事实如何受限
- [ ] Provenance 链：fact → 抽取任务 → 原始记录/文档版本
- [ ] 聚合泄露问题：多条可见事实拼出不可见结论

### 5. 测试策略（测试工程师视角）
- [ ] 字段级抽取准确率的评测集构造
- [ ] 冲突消解 golden case 设计
- [ ] 新鲜度与失效联动测试
- [ ] 权限继承与跨用户隔离测试
- [ ] Derived Fact 的确定性单测与边界用例
- [ ] Ground Truth 来源：谁有资格认定"事实的真值"

### 6. 企业实际案例
- [ ] Q2 销售额多源冲突案例（财务 1.28 亿 / BI 12800 万 / 周报约 1.3 亿 / Excel 1.31 亿）的完整处理流程
- [ ] 项目进度事实链案例（任务A：Jira + 飞书 + 会议纪要）

### 7. 面试 / 会议表达（1–2 分钟）
- [ ] 待课程完成后撰写
