# 企业主动式 Agent 学习知识库

> 从 AI 应用测试工程师视角，系统学习企业主动式 Agent 的架构、数据链路、主动工作机制与评测方法。
> 最终目标：能够参与企业 Agent 的需求分析、架构评审、测试方案设计、Benchmark 建设和质量保障。

## 目录结构

```
README.md                 本文件：导航 + 进度
notes/00-学习路线-V0.2.md  执行用课次计划（验收标准 / 不做清单 / 文档喂养）
glossary.md               术语表（每课结束后追加）
notes/                    每课学习笔记
docs/                     最终要输出的 7 份文档 + 当前版本的实战补充文档
docs/08-知识库V1测试准备与数据集设计.md  当前知识库 V1 测试准备
docs/09-开源测试集调研与知识库V1数据集规划.md  开源资源选型 + 自建数据集规划
```

交互式画布（可在 Cursor 里打开）：
- [学习路线 V0.2](/Users/linhe/.cursor/projects/Users-linhe-Desktop-Workspace-05-Knowledge-Agent-Enterprise-agent/canvases/learning-path-v02.canvas.tsx)
- [U2a RAG 六段](/Users/linhe/.cursor/projects/Users-linhe-Desktop-Workspace-05-Knowledge-Agent-Enterprise-agent/canvases/rag-refresh-u2a.canvas.tsx)

## 学习路线与进度（V0.2）

原 7 课主题保留，执行拆成 10 个可验收课次。第 1 课自检题可并行，**不再挡住开下一课**。

| 阶段 | 课次 | 主题 | 状态 | 主要支撑文档 |
| --- | --- | --- | --- | --- |
| P0 | U1 | 知识地图：整体架构与任务 A 贯穿 | 已完成 | 文档 1 |
| P0 | U0 | 第 1 课自检 5 题（诊断用） | 待作答，不挡路 | 第 01 课笔记文末 |
| P1 | U2a | RAG 与知识库巩固（去年经历回炉） | 已收口 | 第 02 课上笔记 |
| P1 | U2b | 企业 RAG 差分（领导任务 A） | **进行中** | 第 02 课下笔记 |
| P1 | V1 实战 | 知识库第一版测试准备与执行 | **当前优先** | 文档 8 |
| P1 | U3 | Semantic Layer 与口径（领导任务 B，加时） | 计划中 | 文档 2 / 3 / 4 |
| P2 | U4a | Fact Schema 与转述 | 计划中 | 文档 2 |
| P2 | U4b | 冲突、时效、权限继承 | 计划中 | 文档 2 / 4 |
| P3 | U5a | 事件感知 | 计划中 | 文档 6 / 3 |
| P3 | U5b | 评估、决策、行动 | 计划中 | 文档 6 / 4 |
| P3 | U5c | 跟进、升级、回复注入 | 计划中 | 文档 6 / 3 |
| P4 | U6 | 评测收口与上线门禁 | 计划中 | 文档 4 / 5 |
| P4 | U7 | 竞品与 build vs buy | 计划中 | 文档 7 |

相对 V0.1 的关键调整：第 5 课按层拆开；评测随层写、U6 收口；治理在 U2b / U5c / U6 落地。V0.2.1：知识库评测已停练，U2 拆成巩固 + 企业差分。细节见 `notes/00-学习路线-V0.2.md`。

## 最终交付的 7 份文档

| 编号 | 文档 | 当前状态 |
| --- | --- | --- |
| 1 | 企业主动式 Agent 整体架构分析 | 草稿 V0.1（第 1 课后建立） |
| 2 | Enterprise Context / Fact Layer 设计理解 | 骨架 |
| 3 | 企业 Agent 测试方案 V0.1 | 骨架 |
| 4 | Enterprise Agent Evaluation Framework | 骨架 |
| 5 | Enterprise Golden Dataset 设计规范 | 骨架 |
| 6 | Trigger / Follow-up / Escalation Benchmark | 骨架 |
| 7 | 企业 Agent 竞品分析 | 骨架（已含第 1 课的初步对照表） |

## 当前待办

- [ ] 完成 U2b：默写五条差分，闭卷答第 02 课下文末 4 题
- [ ] 按文档 8 准备知识库 V1 最小语料包、黄金问法和体验任务
- [ ] 按文档 9 初筛开源资源，并建立开源数据适配登记
- [ ] 另找空隙闭卷第 1 课自检题（不挡 U2a）
- [ ] 每课次结束：笔记 + glossary + 文档小节 + 四件产出（案例一幕 / 黄金用例 / 缺陷定位 / 90 秒表达）

## 使用约定

- 执行顺序以 `notes/00-学习路线-V0.2.md` 为准；README 只记进度。
- 同一条任务 A 贯穿到底，每课只续写一幕。
- 能代码判定的指标不用 LLM-as-Judge。
- 明确不做：手写 Connector、向量库选型、Embedding 微调、数仓建模课、把全公司事实化。
