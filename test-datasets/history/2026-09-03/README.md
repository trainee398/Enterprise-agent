# 知识库 V1 测试数据集

> 历史快照：2026-09-03 的 RAG 准备材料，2026-09-08 归档。正文中的“当前”“本周”“完成”和路径/命令按当时语境阅读；不代表当前一期范围或产品测试通过。当前入口见[测试资产说明](../../README.md)，状态见[当前状态](../../STATUS.md)。

> 版本：kb-v1-dataset-2026-09-03  
> 状态：初始化  
> 对应文档：docs/08-知识库V1测试准备与数据集设计.md，docs/09-开源测试集调研与知识库V1数据集规划.md

## 当前状态

这套目录目前是“可执行规范 + 待落地语料”，不是已经完成上传测试的成品集：

- `truth/task-a-facts.yaml` 已是可直接解析的真值文件。
- `retrieval/`、`answer/`、`lifecycle/`、`ux/` 下的 `.yaml` 文件保留了说明、Schema 和案例，面向人工阅读；对应的 `.stream.yaml` 是可自动加载的 YAML 多文档流。
- `corpus/manifest-v1.yaml` 已建立文档清单，但实际上传文件仍需按产品支持格式制作并填写哈希、解析真值和证据位置。

生成/校验机器版本：

```bash
ruby test-datasets/tools/extract_yaml_stream.rb \
  test-datasets/retrieval/golden-queries-v1.yaml \
  test-datasets/answer/trust-golden-v1.yaml \
  test-datasets/lifecycle/lifecycle-cases-v1.yaml \
  test-datasets/ux/ux-tasks-v1.yaml
```

## 目录结构

```
test-datasets/
├── sources/          开源资源说明、许可证、版本和原始 ID 映射
├── corpus/           原始上传文件与格式变体
├── truth/            真值表、证据 span、文件哈希
├── retrieval/        queries、qrels、正负例
├── answer/           期望答案、引用、拒答和禁止断言
├── lifecycle/        重传、更新、删除、失败恢复用例
├── ux/               任务脚本、观察记录、截图/录屏索引
├── generated/        模型生成的未审候选
├── verified/         通过代码和人工审查的候选
├── frozen/           已冻结、可回归的版本
├── runs/<build>/     页面状态、解析结果、Top-K、Prompt、回答和指标
└── defects/          缺陷报告与回归结果
```

## 数据集规模

### 当前目标（Release Candidate）

- **文档数量**：8-12 份受控文档，覆盖所有已支持格式
- **检索/回答用例**：40-60 条 Retrieval + 20 条 Answer/Trust
- **生命周期用例**：8-12 条
- **UX 任务**：7 条

### 三档规模对比

| 阶段 | 文档 | 检索/回答用例 | 生命周期 | UX 任务 | 目的 |
|------|------|---------------|----------|---------|------|
| Smoke（半天） | 6 正常 + 3 异常 | 15-20 | 4 | 4 | 证明链路能跑 |
| Release Candidate | 8-12 受控 | 40-60 + 20 | 8-12 | 7 | V1 发布前主要回归集 |
| Regression（后续） | 30-50 | 150-300 | 20+ | 10+ | 模型/配置变更后回归 |

## 命名规范

所有测试用例使用稳定 ID：

- `KBV1-DOC-*`    上传文档
- `KBV1-F-*`      标准事实
- `KBV1-R-*`      Retrieval Golden
- `KBV1-A-*`      Answer / Trust Golden
- `KBV1-E2E-*`    端到端场景
- `KBV1-UX-*`     体验任务

## 版本管理

- 数据集版本格式：`kb-v1-golden-YYYY-MM-DD.N`
- 每次运行记录：build、Parser、Embedding、Rerank、Prompt 版本
- 文件哈希：所有原始文件保存 SHA-256

## 使用原则

1. **真值先于产品结果**：先定义真值，再跑产品
2. **分层判定**：不把所有层压成一个总分
3. **开源资源登记**：任何外部数据进入前先登记
4. **一个变量原则**：每个变体只改变一个主要变量
5. **证据完整**：原始文件、解析文本、Top-K、上下文、答案全程留痕

## 快速开始

### 第 1 步：确认产品契约
先向开发确认支持格式、限制、处理状态、重传/删除语义、引用能力。

### 第 2 步：冻结最小自建集
在 `corpus/` 建立 8-12 份受控文档，在 `truth/` 建立真值表。

### 第 3 步：跑 P0 核心链路
```
上传状态 → 解析文本 → Chunk → 索引 → Top-K → 上下文 → 答案 → 引用
```

### 第 4 步：加入开源专项集（可选）
BEIR 小子集、RAGTruth、RGB、CRUD-RAG 等。

### 第 5 步：冻结回归并回填文档
回填到文档 3、4、5，记录 bad case。

## 注意事项

### 必须做
- ✅ 每条用例有清晰的期望和判定方式
- ✅ 数字、日期、人名精确核对
- ✅ 引用位置真实支撑答案
- ✅ 无答案场景明确拒答
- ✅ 权限、版本、删除传播

### 不要做
- ❌ 不要用模型生成的答案当 Ground Truth
- ❌ 不要把未实现的能力写成"已通过"
- ❌ 不要用 LLM-as-Judge 判数字、日期、权限
- ❌ 不要把所有层压成一个总分
- ❌ 不要为了数据量下载整个大型 benchmark

## 参考文档

- [文档 8：知识库 V1 测试准备与数据集设计](../../../docs/08-知识库V1测试准备与数据集设计.md)
- [文档 9：开源测试集调研与知识库 V1 数据集规划](../../../docs/09-开源测试集调研与知识库V1数据集规划.md)
- [文档 3：企业 Agent 测试方案](../../../docs/03-企业Agent测试方案V0.1.md)
- [文档 5：Golden Dataset 设计规范](../../../docs/05-EnterpriseGoldenDataset设计规范.md)
