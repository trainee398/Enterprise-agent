# 测试数据集创建总结报告

> 历史快照：2026-09-03 的 RAG 准备材料，2026-09-08 归档。正文中的“当前”“本周”“完成”和路径/命令按当时语境阅读；不代表当前一期范围或产品测试通过。当前入口见[测试资产说明](../../README.md)，状态见[当前状态](../../STATUS.md)。

## 完成情况

### 已创建的核心文件

```
test-datasets/
├── README.md                              # 总览说明
├── GETTING_STARTED.md                     # 快速启动指南
│
├── truth/
│   └── task-a-facts.yaml                  # 任务 A 受控事实集（13 条事实）
│
├── corpus/
│   ├── README.md                          # 文档制作指南
│   └── manifest-v1.yaml                   # 8-12 份受控文档清单（当前待落地）
│
├── retrieval/
│   └── golden-queries-v1.yaml             # 检索黄金用例（14 条）
│
├── answer/
│   └── trust-golden-v1.yaml               # 答案可信度用例（20 条）
│
├── ux/
│   └── ux-tasks-v1.yaml                   # 体验任务（7 条）
│
├── lifecycle/
│   └── lifecycle-cases-v1.yaml            # 生命周期用例（12 条）
│
├── sources/
│   └── registry.md                        # 开源资源登记表（17 个候选）
│
└── [defects, frozen, generated, runs, verified]/  # 待使用的空目录
```

> 质量状态：Truth 已可解析；四个案例文件原始版本是“人类可读规范”，需生成 `.stream.yaml` 后再接入脚本；Corpus 实际文件尚未创建。

### 数据集统计

| 类型 | 数量 | 优先级分布 |
|------|------|-----------|
| **真值事实** | 13 条 | 10 核心 + 2 版本 + 1 干扰 |
| **检索用例** | 14 条 | P0: 10, P1: 4 |
| **答案用例** | 20 条 | P0: 15, P1: 5 |
| **UX 任务** | 7 条 | P0: 5, P1: 2 |
| **生命周期用例** | 12 条 | P0: 10, P1: 2 |
| **开源资源候选** | 17 个 | A: 2, B: 10, C: 5 |
| **总用例数** | **53 条** | **P0: 40, P1: 13** |

---

## 核心特点

### 1. 基于企业 Agent 架构设计

所有用例都严格对应 L0-LX 分层架构：
- L2a 知识索引 → Retrieval Golden
- L6 评估 → Answer / Trust Golden
- L1 接入层 → Lifecycle 用例
- 产品体验 → UX 任务

### 2. 四个独立判定维度（Answer Golden）

不把答案质量压成一个总分：
- ✅ 事实值（Factual Value）
- ✅ 接地（Groundedness）
- ✅ 引用（Citation Support）
- ✅ 拒答（Refusal / Uncertainty）

### 3. 企业 RAG 差分重点覆盖

对应 U2b 五条差分：
- ✅ Connector 对账（Lifecycle LC-001, LC-005, LC-012）
- ✅ 删除传播（Lifecycle LC-009）
- ✅ 版本失效（Lifecycle LC-011, Truth F-09）
- ✅ 权限三处执行（Retrieval R-007, 待补充权限用例）
- ✅ 检索块≠事实（Retrieval R-008, Answer A-008）

### 4. 测试友好的设计

- **受控事实集**：所有真值先定义，再跑产品
- **分层判定**：每层有明确的输入/输出/判定方式
- **可复现**：用例 ID 稳定，证据路径清晰
- **渐进式**：P0 核心链路 → P1 质量增强 → 后续回归

---

## 关键设计原则

### ✅ 做到了

1. **真值先于产品结果**
   - Truth 独立于测试执行
   - 不用模型回答反推真值

2. **一个变量原则**
   - 每个用例只测一个主要维度
   - 便于快速定位问题

3. **分层判定**
   - Retrieval: 看 Top-K
   - Answer: 拆成 4 个维度
   - UX: 观察任务完成

4. **能代码判定的不用 LLM-as-Judge**
   - 日期、数字、人名 → code
   - 禁用词、引用存在 → code
   - 责任归因、语气 → rubric

5. **开源资源作为校准，不替代门槛**
   - 登记制度
   - 采用等级（A/B/C）
   - 自建数据决定发布

### ⚠️ 待完成

1. **实际文档文件**
   - 8-12 份受控文档（PDF/DOCX/TXT 等）
   - 按 corpus/README.md 指引创建

2. **产品契约确认**
   - 支持格式、限制、行为语义
   - 可观测性（能提供哪些 ID/日志）

3. **权限测试用例补充**
   - 跨用户隔离
   - 权限三处执行的完整验证

4. **第一轮测试执行**
   - P0 核心链路（40 条用例）
   - 证据归档
   - 缺陷报告

---

## 如何使用这套数据集

### 第一步：阅读入门文档
📖 **GETTING_STARTED.md** - 快速启动指南

包含：
- 数据集总览
- 第一轮测试（P0 核心链路）执行计划
- 常见问题 Q&A
- 下一步行动

### 第二步：确认产品契约
在 `corpus/` 创建文档前，先确认：
- 支持的文件格式
- 大小限制
- 处理方式（同步/异步）
- 更新语义（覆盖/去重/并存）
- 引用能力
- 无答案行为

### 第三步：创建受控文档
根据 `truth/task-a-facts.yaml`，在 `corpus/` 创建：
- DOC-01: 项目 A 基本信息
- DOC-02: 项目说明（标题层级）
- DOC-03: 交付清单（表格）
- DOC-04: 中英文混合
- DOC-06: 项目 B（干扰）
- DOC-08: 对抗内容
- DOC-ERR-01/02/03: 异常文件

### 第四步：执行测试
按 GETTING_STARTED.md 的"第一轮测试"执行：
1. 上传与处理（30 分钟）
2. 检索层（1 小时）
3. 答案可信度（1 小时）
4. 体验与恢复（1 小时）

### 第五步：归档证据
在 `runs/build-<version>-<date>/` 保存：
- 原始文件
- 解析文本
- Chunk 预览
- Top-K 结果
- 答案与引用
- 截图与录屏

### 第六步：输出报告
- 缺陷报告（按层级分类）
- 门槛检查（P0 用例通过率）
- 风险清单（未覆盖的企业能力）

---

## 与项目文档的对应关系

| 测试数据集 | 回填到长期文档 |
|-----------|----------------|
| Retrieval Golden | 文档 3 L2a、文档 5 retrieval-golden |
| Answer / Trust Golden | 文档 4 Retrieval / Assessment 指标 |
| UX 任务 | 文档 1 产品定位/开放问题 |
| Lifecycle 用例 | 文档 3 测试环境、U2b |
| 开源资源登记 | 文档 5 数据集分类与维护机制 |
| 门槛检查 | 文档 4 发布门槛、文档 8 第 10 节 |

---

## 数据集版本信息

```yaml
dataset_version: kb-v1-dataset-2026-09-03
created_date: 2026-09-03
status: 初始化完成，待执行
total_files: 9
  - README.md
  - GETTING_STARTED.md
  - truth/task-a-facts.yaml
  - corpus/README.md
  - retrieval/golden-queries-v1.yaml
  - answer/trust-golden-v1.yaml
  - ux/ux-tasks-v1.yaml
  - lifecycle/lifecycle-cases-v1.yaml
  - sources/registry.md

total_test_cases: 53
  - retrieval: 14
  - answer: 20
  - ux: 7
  - lifecycle: 12

priority_distribution:
  - P0: 40 (75%)
  - P1: 13 (25%)

estimated_first_round_time: 3-4 小时
```

---

## 下一步行动（优先级排序）

### 🔥 本周必做（P0）

1. **创建实际文档文件**（预计 2 小时）
   - 根据 truth/task-a-facts.yaml
   - 在 corpus/ 创建 8 份核心文档
   - 计算文件哈希
   - 填写 manifest

2. **确认产品契约**（预计 1 小时）
   - 支持格式、限制
   - 行为语义
   - 可观测性

3. **执行第一轮 P0 测试**（预计 3-4 小时）
   - 按 GETTING_STARTED.md 执行
   - 全程留证（文件、日志、截图）
   - 输出缺陷报告

### 📅 后续计划（P1）

1. **扩展用例**（下周）
   - 同义问法
   - 边界用例
   - 权限隔离完整验证
   - 扩展到 60+ 条

2. **引入开源专项集**（按需）
   - BEIR 小子集（检索校准）
   - RAGTruth（可信度校准）
   - 记录映射和适配

3. **回填长期文档**（持续）
   - 用例 → 文档 3、5
   - 指标 → 文档 4
   - 门槛 → 文档 8

4. **建立回归机制**（V2）
   - Bad case 回流
   - 冻结版本管理
   - 自动化执行（可选）

---

## 成果交付

### 已交付
✅ 完整的测试数据集结构  
✅ 53 条可执行测试用例  
✅ 13 条受控事实真值  
✅ 快速启动指南  
✅ 开源资源登记制度  

### 待交付
⏳ 8-12 份实际文档文件  
⏳ 第一轮测试执行报告  
⏳ 缺陷报告与门槛检查  
⏳ 回填到文档 3、4、5  

---

## 联系信息

**数据集维护者**: AI 应用测试工程师  
**创建日期**: 2026-09-03  
**版本**: kb-v1-dataset-2026-09-03  
**对应文档**: 
- docs/08-知识库V1测试准备与数据集设计.md
- docs/09-开源测试集调研与知识库V1数据集规划.md

---

## 附录：文件清单

```
test-datasets/
├── README.md                              (4.1 KB)
├── GETTING_STARTED.md                     (8.5 KB)
├── truth/task-a-facts.yaml                (已创建)
├── corpus/README.md                       (已创建)
├── retrieval/golden-queries-v1.yaml       (已创建)
├── answer/trust-golden-v1.yaml            (已创建)
├── ux/ux-tasks-v1.yaml                    (已创建)
├── lifecycle/lifecycle-cases-v1.yaml      (已创建)
└── sources/registry.md                    (已创建)
```

所有文件已创建完毕，结构清晰，可直接使用。
