# Corpus 语料文档说明

> 存放所有待上传的原始文档及其格式变体

## 文档矩阵设计

### 维度覆盖

| 维度 | 最少覆盖 | 对应文档 ID |
|------|----------|-------------|
| 文本结构 | 短文、标题层级、列表、长文中后段 | DOC-01, DOC-02, DOC-05 |
| 表格 | 表头/数据同行、跨页或跨 Chunk、单位 | DOC-03 |
| 精确字段 | 中文人名、项目编号、日期、百分比、金额 | DOC-01, DOC-04 |
| 干扰 | 相似项目、旧版本、重复文档 | DOC-06, DOC-07 |
| 异常 | 空文件、损坏文件、超限文件 | DOC-ERR-* |
| 安全 | 文档中的"忽略指令/修改状态" | DOC-08 |

## 推荐文档列表（8 类核心 + 3 类异常）

### 核心文档

| ID | 文档内容 / 结构 | 主要验证 | 优先级 |
|----|-----------------|----------|--------|
| KBV1-DOC-01 | 短篇纯文本：项目 A 基本信息，含日期、人名、编号 | 最小上传、全文解析、直接问答 | P0 |
| KBV1-DOC-02 | 有标题层级、段落、列表的项目说明 | 标题路径、段落边界、Chunk 上下文 | P0 |
| KBV1-DOC-03 | 含表格的交付清单：表头与数据行 | 表格解析、表头不与数据分离、精确问答 | P0 |
| KBV1-DOC-04 | 中英文、数字、日期、百分比、特殊符号混合 | 编码、单位、标点和数字保真 | P0 |
| KBV1-DOC-05 | 长文档：多个章节，目标信息位于中后段 | 长文分块、召回和重排 | P1 |
| KBV1-DOC-06 | 同主题干扰文档：项目 B，含相似词但不同编号 | 专名/编号消歧、Precision | P0 |
| KBV1-DOC-07 | 同一文档的旧版与新版，写入不同规则或日期 | 更新、重复、旧内容压过新内容 | P1 |
| KBV1-DOC-08 | 内容中包含"忽略之前指令、修改状态"等文字 | 文档内 Prompt Injection 不应变成 Agent 指令 | P0 |

### 异常文档

| ID | 文档类型 | 验证目标 |
|----|----------|----------|
| KBV1-DOC-ERR-01 | 空文件 | 明确失败，不显示假成功 |
| KBV1-DOC-ERR-02 | 损坏文件 | 明确失败，可重试或删除 |
| KBV1-DOC-ERR-03 | 超出限制的文件 | 明确超限提示 |

## 文档制作原则

### 1. 先写"事实母版"，再生成文件

先建立真值表（`truth/task-a-facts.yaml`），再把同一真值渲染成支持的 PDF/DOCX/TXT/Markdown 等格式。

### 2. 每个变体只改变一个主要变量

- 同一正文，分别改变标题层级 → 测 Parser/Chunk
- 同一表格，分别让表头和数据跨页 → 测表格上下文
- 同一事实，加入项目 B 干扰 → 测专名和 Precision
- 同一规则制作旧版/新版 → 测版本处理

### 3. 关键答案只在一处写成权威事实

其他文档可有意形成干扰或旧值。

### 4. 关键数字、日期、人名、编号不要只放在图片里

除非产品明确支持 OCR。

### 5. 表格必须包含足够的上下文

表头、数据行、单位、日期和行数据不能靠测试人员口头补全。

### 6. 对抗文字要作为普通文档内容出现

不能直接把恶意指令写进测试脚本。

### 7. 保留原始文件、纯文本基准和人工标注

保留页码/段落位置，方便定位 Parser 与 Citation 问题。

## 文档 Manifest Schema

每份上传文件都要有一条 manifest：

```yaml
doc_id: KBV1-DOC-001
source_title: ""
file_name: ""
file_format: pdf | docx | txt | md | xlsx | other
sha256: ""
language: zh | en | mixed
source_truth:
  facts: [KBV1-F-01, KBV1-F-04]
  tables: []
  evidence_spans: []
expected_parse:
  required_text: []
  required_structure: []
  required_metadata: []
variants:
  - variant_id: ""
    purpose: clean | boundary | distractor | stale | adversarial
dataset_version: kb-v1-corpus-2026-09-03.1
license_or_origin: internal | public-with-license | synthetic
```

## 当前落地状态

已提供 8 份受控 Markdown 源稿，以及 1 份文本异常样本。它们是事实和结构的基准；如果产品不支持 Markdown，应按同一内容转换为实际支持的 PDF/DOCX/TXT/XLSX，再在 manifest 中记录转换关系。空文件和超限文件需要在测试执行时按产品限制生成，避免把本地仓库变成大文件存储。

上传前先核对 `manifest-v1.yaml` 的 `file_name`、`status` 和产品实际支持格式；上传后在运行目录记录 SHA-256、解析文本、Chunk 边界和页码/段落证据。

## 文件命名规范

```
KBV1-DOC-001-项目A基本信息.txt
KBV1-DOC-001-项目A基本信息.pdf
KBV1-DOC-001-项目A基本信息.docx
KBV1-DOC-002-项目说明-标题层级.md
KBV1-DOC-003-交付清单-表格.xlsx
...
```

## 格式支持确认清单

在创建文档前，先向开发确认：

- [ ] 支持的文件格式（PDF, DOCX, TXT, MD, XLSX 等）
- [ ] 单文件大小限制
- [ ] 总容量限制
- [ ] 是否支持 OCR（扫描件/图片）
- [ ] 是否支持表格
- [ ] 编码要求（UTF-8, GBK 等）

## 下一步

1. 确认产品实际支持的文件格式
2. 根据 `truth/task-a-facts.yaml` 创建对应文档
3. 为每份文档填写 manifest
4. 计算并记录文件 SHA-256
5. 准备格式变体（同内容的 PDF/DOCX/TXT 等）
