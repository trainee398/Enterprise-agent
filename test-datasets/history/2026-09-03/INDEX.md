# 测试数据集文档索引

> 历史快照：2026-09-03 的 RAG 准备材料，2026-09-08 归档。正文中的“当前”“本周”“完成”和路径/命令按当时语境阅读；不代表当前一期范围或产品测试通过。当前入口见[测试资产说明](../../README.md)，状态见[当前状态](../../STATUS.md)。

> 快速查找指南 - 所有文档的快速导航
> 版本：kb-v1-dataset-2026-09-03

---

## 🎯 我想...

### 快速开始测试
→ **[GETTING_STARTED.md](GETTING_STARTED.md)** (8.3 KB) ⭐  
第一轮测试执行指南，3-4 小时可完成

### 了解项目整体情况
→ **[README.md](README.md)** (4.9 KB)  
项目总览、目录结构、使用原则

### 查看当前状态和进度
→ **[STATUS.md](STATUS.md)** (8.0 KB)  
进度仪表板、里程碑、时间表

### 了解还缺什么
→ **[GAPS.md](GAPS.md)** (13.0 KB) ⭐  
6 个缺口详细说明和补齐计划

### 查看完成总结
→ **[SUMMARY.md](SUMMARY.md)** (8.5 KB)  
已完成工作、统计数据、下一步

### 查看交付清单
→ **[DELIVERY.md](DELIVERY.md)** (11.0 KB)  
最终交付物、成果、使用路径

---

## 📂 核心数据文件

### 真值表
**[truth/task-a-facts.yaml](../../truth/task-a-facts.yaml)**  
13 条受控事实 + 4 条扩展（版本、干扰、无答案、对抗）

### 检索用例
**[retrieval/golden-queries-v1.yaml](../../retrieval/golden-queries-v1.yaml)**  
14 条检索黄金问法（P0: 10, P1: 4）

### 答案用例
**[answer/trust-golden-v1.yaml](../../answer/trust-golden-v1.yaml)**  
20 条答案可信度用例（4 维判定）

### 体验任务
**[ux/ux-tasks-v1.yaml](../../ux/ux-tasks-v1.yaml)**  
7 条 UX 任务（首次使用、状态、恢复）

### 生命周期
**[lifecycle/lifecycle-cases-v1.yaml](../../lifecycle/lifecycle-cases-v1.yaml)**  
12 条生命周期用例（上传、更新、删除、重试）

---

## 📖 制作指南

### 如何创建测试文档
**[corpus/README.md](../../corpus/README.md)**  
文档制作原则、命名规范、Manifest Schema

### 如何使用开源资源
**[sources/QUICK_REF.md](../../sources/QUICK_REF.md)** ⭐  
快速参考卡：按需求查找资源、三步提取法

**[sources/EXTRACTION_GUIDE.md](../../sources/EXTRACTION_GUIDE.md)**  
详细提取指南：6 个主要资源的完整提取方法

**[sources/examples/beir-extraction-example.md](../../sources/examples/beir-extraction-example.md)**  
实战示例：BEIR 干扰文档提取全流程（3小时）

**[sources/registry.md](../../sources/registry.md)**  
17 个开源资源登记、A/B/C 等级、下载检查清单

---

## 🗺️ 按角色导航

### 我是测试负责人
**第一次看**:
1. [README.md](README.md) - 了解项目
2. [GETTING_STARTED.md](GETTING_STARTED.md) - 执行测试
3. [GAPS.md](GAPS.md) - 补齐缺口

**扩展用例时**:
1. [sources/QUICK_REF.md](../../sources/QUICK_REF.md) - 开源资源快速查找
2. [sources/EXTRACTION_GUIDE.md](../../sources/EXTRACTION_GUIDE.md) - 详细提取方法
3. [sources/examples/](../../sources/examples) - 参考实战示例

**测试执行时**:
1. [truth/task-a-facts.yaml](../../truth/task-a-facts.yaml) - 查真值
2. 各用例 YAML - 查判定规则
3. [GETTING_STARTED.md](GETTING_STARTED.md) - 查步骤

**报告输出时**:
1. `runs/` 目录 - 归档证据
2. `defects/` 目录 - 记录缺陷
3. [STATUS.md](STATUS.md) - 更新进度

### 我是开发负责人
**需要我确认**:
1. [GAPS.md](GAPS.md) 缺口 1, 3, 4 - 产品契约
2. [corpus/README.md](../../corpus/README.md) - 格式支持
3. [lifecycle/lifecycle-cases-v1.yaml](../../lifecycle/lifecycle-cases-v1.yaml) - 行为语义

**提供可观测性**:
1. upload_id, document_id, chunk_id
2. 处理状态、错误码
3. Top-K 结果、分数

### 我是产品负责人
**关注重点**:
1. [ux/ux-tasks-v1.yaml](../../ux/ux-tasks-v1.yaml) - 体验任务
2. [GAPS.md](GAPS.md) 缺口 1, 6 - 信息架构
3. 测试报告 - 首次使用问题

---

## 🔍 按问题类型导航

### 测试执行问题
| 问题 | 查看文档 | 章节 |
|------|----------|------|
| 如何开始第一轮测试 | GETTING_STARTED.md | 快速启动：第一轮测试 |
| 某个用例怎么判定 | 各用例 YAML | 判定方式、判定规则 |
| 如何归档证据 | GETTING_STARTED.md | 输出阶段 |
| 缺陷怎么报告 | GETTING_STARTED.md | 缺陷报告最小模板 |

### 数据准备问题
| 问题 | 查看文档 | 章节 |
|------|----------|------|
| 如何创建测试文档 | corpus/README.md | 文档制作原则 |
| 文档格式如何转换 | GAPS.md | 缺口 1: 格式变体 |
| 异常文件如何生成 | GAPS.md | 缺口 4: 异常文件 |
| 真值表如何使用 | truth/task-a-facts.yaml | 顶部说明 |

### 用例扩展问题
| 问题 | 查看文档 | 章节 |
|------|----------|------|
| 如何扩展检索用例 | GAPS.md | 缺口 2: 检索用例 |
| 如何补充权限用例 | GAPS.md | 缺口 3: 权限数据 |
| 如何使用开源资源 | sources/QUICK_REF.md ⭐ | 按需求查找、三步提取法 |
| 从开源资源提取 case | sources/EXTRACTION_GUIDE.md | BEIR/RAGTruth/RGB/TAT-QA |
| 提取实战示例 | sources/examples/ | BEIR 完整流程 |
| 模型生成如何审查 | GAPS.md | 缺口 2: 生成方法 |

### 架构理解问题
| 问题 | 查看文档 | 章节 |
|------|----------|------|
| 为什么这样设计 | SUMMARY.md | 核心设计原则 |
| 与 L0-LX 的对应 | README.md | 数据集设计 |
| 与 U2b 的对应 | GAPS.md | 缺口 3: 企业 RAG 差分 |
| 四维判定是什么 | answer/trust-golden-v1.yaml | 四个独立判定维度 |

---

## 📊 按数据类型导航

### 事实数据（Truth）
- **日期**: F-01 (截止日期)
- **百分比**: F-02 (完成度 60%)
- **数字**: F-03 (5 个 P1)
- **人名**: F-04 (张三)
- **表格**: F-05 (李四交付), F-06 (接口阻塞)
- **事件**: F-07 (客户改协议)
- **转述**: F-08 (张三说过)
- **版本**: F-09-OLD/NEW (超时规则)
- **干扰**: F-10 (项目 B)

### 检索用例（Retrieval）
- **精确问法**: R-001 (日期), R-003 (数字), R-004 (人名)
- **时效性**: R-002 (完成度 + 时间)
- **表格**: R-005 (复合字段), R-006 (状态 + 禁止归责)
- **多段落**: R-007 (会议纪要 + 权限)
- **转述**: R-008 (谁说的)
- **多证据**: R-009 (跨文档综合)
- **干扰**: R-010 (专名消歧)
- **拒答**: R-011 (无答案)
- **版本**: R-012 (新旧版本)
- **对抗**: R-013 (Prompt Injection)
- **综合**: R-014 (多事实摘要)

### 答案用例（Answer）
- **事实值**: A-001, A-003, A-004, A-011, A-012
- **时效性**: A-002, A-013
- **表格**: A-005, A-015
- **禁止归责**: A-006
- **引用支撑**: A-007, A-013
- **转述**: A-008
- **拒答**: A-009, A-014, A-018
- **对抗**: A-010
- **版本**: A-016
- **专名**: A-019
- **跨文档**: A-020

### UX 任务
- **上传**: UX-001
- **状态**: UX-002, UX-007
- **提问**: UX-003
- **引用**: UX-004
- **恢复**: UX-005
- **范围**: UX-006

### 生命周期用例
- **上传**: LC-001, LC-002, LC-003, LC-004, LC-012
- **更新**: LC-005, LC-011
- **删除**: LC-009
- **重试**: LC-006
- **状态**: LC-007, LC-008, LC-010

---

## 🎯 按优先级导航

### P0 用例（必须通过）- 40 条
- Retrieval: R-001, R-002, R-003, R-004, R-005, R-006, R-007, R-008, R-010, R-011
- Answer: A-001 到 A-015
- UX: UX-001 到 UX-005
- Lifecycle: LC-001 到 LC-010

### P1 用例（质量增强）- 13 条
- Retrieval: R-009, R-012, R-013, R-014
- Answer: A-016 到 A-020
- UX: UX-006, UX-007
- Lifecycle: LC-011, LC-012

---

## 📅 按执行阶段导航

### 准备阶段
1. [README.md](README.md) - 了解项目
2. [GAPS.md](GAPS.md) - 确认缺口
3. [corpus/README.md](../../corpus/README.md) - 准备文档

### 执行阶段
1. [GETTING_STARTED.md](GETTING_STARTED.md) - 执行步骤
2. [truth/task-a-facts.yaml](../../truth/task-a-facts.yaml) - 查真值
3. 各用例 YAML - 查判定规则

### 输出阶段
1. `runs/` - 归档证据
2. `defects/` - 记录缺陷
3. [STATUS.md](STATUS.md) - 更新进度

### 回归阶段
1. [GAPS.md](GAPS.md) - 扩展用例
2. `frozen/` - 冻结版本
3. `verified/` - 审查通过

---

## 📏 文档大小参考

```
DELIVERY.md         11.0 KB  - 交付总结 ⭐
GAPS.md             13.0 KB  - 缺口跟踪 ⭐
GETTING_STARTED.md   8.3 KB  - 快速启动 ⭐
STATUS.md            8.0 KB  - 项目状态
SUMMARY.md           8.5 KB  - 完成总结
README.md            4.9 KB  - 项目总览

总文档大小: ~54 KB
总代码量: 6,560 行
总文件数: 29 个
```

---

## 🔗 相关文档

### 项目原始文档
- `docs/08-知识库V1测试准备与数据集设计.md`
- `docs/09-开源测试集调研与知识库V1数据集规划.md`

### 学习路线
- `notes/00-学习路线-V0.2.md`
- `notes/第02课下-企业RAG差分.md`

### 架构文档
- `docs/01-企业主动式Agent整体架构分析.md`
- `docs/03-企业Agent测试方案V0.1.md`

---

## 💡 快速提示

### 第一次使用
```bash
1. 读 README.md （5 分钟）
2. 读 GETTING_STARTED.md （10 分钟）
3. 确认产品契约 （30 分钟）
4. 开始执行测试 （3-4 小时）
```

### 遇到问题
```bash
1. 查看本索引找到对应文档
2. 阅读文档对应章节
3. 如仍不清楚，查看具体用例 YAML
4. 记录问题到 defects/
```

### 扩展用例
```bash
1. 读 GAPS.md 缺口 2
2. 参考现有用例 YAML 的 Schema
3. 放入 generated/ 待审查
4. 审查通过移入 verified/
5. 冻结版本移入 frozen/
```

---

**最后更新**: 2026-09-03  
**维护者**: AI 应用测试工程师  
**版本**: kb-v1-dataset-2026-09-03
