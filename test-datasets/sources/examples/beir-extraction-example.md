# BEIR 提取示例：干扰文档测试

> 实战示例：从 BEIR 提取干扰文档思路并适配到任务 A
> 完成时间：约 2-3 小时

---

## 📋 提取目标

从 BEIR 的 NFCorpus 子集提取：
- 干扰文档设计思路
- qrels 结构
- 相关度判定方法

**不提取**：
- ❌ 公开语料内容（生物医学文章）
- ❌ 英文查询和文档
- ❌ 平均分和排名

---

## 步骤 1: 理解 BEIR 的干扰文档设计

### BEIR 中的相似但不相关案例

```yaml
# BEIR NFCorpus 真实案例（简化）
query_id: "nfcorpus_q5"
query_text: "What are the side effects of calcium supplements?"

relevant_docs:
  - doc_id: "MED-2748"
    title: "Calcium supplement adverse effects"
    relevance: 2  # 高度相关
    content: "Calcium supplements can cause... [具体副作用]"

distractor_docs:
  - doc_id: "MED-2750"
    title: "Benefits of calcium supplements"  # 相似主题
    relevance: 0  # 不相关
    why_distractor: "同样关于钙补充剂，但聚焦益处而非副作用"
  
  - doc_id: "MED-2751"
    title: "Vitamin D side effects"  # 相关领域
    relevance: 0
    why_distractor: "同样关于副作用，但是不同补充剂"
```

### 提取的设计模式

```yaml
distractor_patterns:
  pattern_1:
    name: "相似主题，不同焦点"
    structure:
      query_focus: "副作用"
      relevant: "钙补充剂的副作用"
      distractor: "钙补充剂的益处"  # 主题相同，焦点不同
  
  pattern_2:
    name: "相似实体类型，不同实体"
    structure:
      query_entity: "钙补充剂"
      relevant: "关于钙补充剂"
      distractor: "关于维生素D"  # 都是补充剂，但不是查询的那个
  
  pattern_3:
    name: "相似关键词，不同语义"
    structure:
      query_keywords: ["calcium", "supplement"]
      relevant: "calcium supplement side effects"
      distractor: "calcium in natural food sources"  # 有关键词但语境不同
```

---

## 步骤 2: 适配到任务 A

### 适配模式 1: 相似主题，不同焦点

```yaml
# 原始 BEIR 模式
query: "钙补充剂的副作用"
relevant: "钙补充剂副作用文档"
distractor: "钙补充剂益处文档"

# 适配到任务 A
case_id: KBV1-R-021
query: "任务 A 的截止日期是什么？"
intent: 测试"日期"焦点，避免"完成度"干扰

input_documents:
  - KBV1-DOC-01:  # 相关文档
      content: "任务 A 截止日期为 2026-08-30"
      relevance: 2
  
  - KBV1-DOC-DISTRACTOR-01:  # 干扰文档
      title: "任务 A 进度报告"
      content: "任务 A 完成度 60%，预计按时完成"
      relevance: 0
      why_distractor: "同样关于任务A，但聚焦进度而非日期"

must_retrieve: [KBV1-DOC-01]
must_not_retrieve: [KBV1-DOC-DISTRACTOR-01]
expected_answer: "2026-08-30"

test_dimension: "日期查询不应被进度信息干扰"
```

### 适配模式 2: 相似实体类型，不同实体

```yaml
# 原始 BEIR 模式
query: "钙补充剂"
relevant: "关于钙补充剂"
distractor: "关于维生素D"

# 适配到任务 A（已存在：KBV1-R-010）
case_id: KBV1-R-010
query: "任务 B 的完成度是多少？"
intent: 测试编号消歧，避免任务 A 混淆

input_documents:
  - KBV1-DOC-01:  # 干扰文档
      content: "任务 A 完成度 60%"
      relevance: 0  # 对任务B查询不相关
  
  - KBV1-DOC-06:  # 相关文档
      content: "任务 B 完成度 80%"
      relevance: 2

must_retrieve: [KBV1-DOC-06]
must_not_retrieve: [KBV1-DOC-01]
expected_answer: "80%"
forbidden_answer: "60%"  # 不可返回任务A的数据

test_dimension: "专名（编号）优先于相似词"
```

### 适配模式 3: 相似关键词，不同语义

```yaml
# 新创建用例
case_id: KBV1-R-022
query: "李四负责的具体工作是什么？"
intent: 测试人名+工作内容，避免其他人混淆

input_documents:
  - KBV1-DOC-03:  # 相关文档
      content: "李四 | 接口适配 | 2026-08-28"
      relevance: 2
  
  - KBV1-DOC-DISTRACTOR-02:  # 干扰文档
      title: "项目成员列表"
      content: "张三负责任务A，李四负责接口，王五负责测试"
      relevance: 0
      why_distractor: "提到李四但不是详细工作描述"

must_retrieve:
  - doc_id: KBV1-DOC-03
    fact_id: KBV1-F-05
    evidence_span: "李四 | 接口适配 | 2026-08-28"

expected_answer: "接口适配"
acceptable_variants:
  - "接口适配，计划日期 2026-08-28"
  - "负责接口适配工作"

forbidden:
  - 只答"负责接口"（过于简略，应包含具体交付物）
  - 混入其他人的工作

test_dimension: "精确查找人名对应的详细信息"
```

---

## 步骤 3: 提取 qrels 结构

### BEIR 的 qrels 格式

```python
# qrels.tsv
query_id    corpus_id    score
q1          doc1         2      # 高度相关
q1          doc2         1      # 相关
q1          doc3         0      # 不相关
```

### 适配到项目的三级判定

```yaml
relevance_mapping:
  beir_score_2:  # 高度相关
    adapted_to: must_retrieve
    definition: "包含问题直接答案的文档"
    example: "查询日期 → 包含具体日期的文档"
  
  beir_score_1:  # 相关
    adapted_to: allowed_adjacent_chunks
    definition: "相关但不直接回答，或邻接块"
    example: "日期在标题下一段，标题块也相关"
  
  beir_score_0:  # 不相关
    adapted_to: must_not_retrieve
    definition: "干扰文档，相似但不相关"
    example: "查询任务A → 任务B的文档"
```

### 实例化到用例

```yaml
case_id: KBV1-R-023
query: "任务 A 有几个未关闭的 P1？"

relevance_annotations:
  KBV1-DOC-01:
    score: 2  # must_retrieve
    reason: "直接包含答案：5个未关闭P1"
    evidence_span: KBV1-F-03
  
  KBV1-DOC-02:
    score: 1  # allowed_adjacent
    reason: "会议纪要提到P1问题，但没有具体数字"
    use: "可以作为上下文但不足以回答"
  
  KBV1-DOC-06:
    score: 0  # must_not_retrieve
    reason: "项目B的P1统计，干扰文档"
    distractor_type: "similar_metric_different_entity"

must_retrieve:
  - doc_id: KBV1-DOC-01
    chunk_must_contain: "5 个未关闭 P1"

allowed_adjacent_chunks:
  - doc_id: KBV1-DOC-02
    condition: "若检索也返回会议纪要，不算错误"

must_not_retrieve:
  - doc_id: KBV1-DOC-06
    reason: "不同项目"

expected_answer: "5"
forbidden:
  - "约5个"
  - "5个左右"
  - 任何来自项目B的数字
```

---

## 步骤 4: 创建干扰文档

### 根据提取的模式创建

```markdown
# KBV1-DOC-DISTRACTOR-01.md - 任务 A 进度报告

## 任务 A 进度概览

截至 2026-08-28，任务 A 当前完成度为 60%。

### 关键里程碑
- ✅ 需求分析（已完成）
- 🔄 开发阶段（进行中）
- ⏳ 测试阶段（未开始）

### 风险与挑战
目前进度符合预期，预计能按时完成任务。团队正在全力推进开发工作。

---

# 设计意图
distractor_design:
  target_query: "任务 A 的截止日期是什么？"
  why_distractor:
    - 标题包含"任务 A"（与查询匹配）
    - 讨论时间相关内容（"截至 2026-08-28"）
    - 但实际没有截止日期信息
  
  expected_system_behavior:
    correct: "不检索此文档，或检索但不用于回答"
    incorrect: "误以为'截至 2026-08-28'是截止日期"
  
  test_dimension: "区分'当前时间'和'截止时间'"
```

```markdown
# KBV1-DOC-DISTRACTOR-02.md - 项目成员列表

## 项目 A 团队成员

| 姓名 | 角色 | 主要职责 |
|------|------|----------|
| 张三 | PM | 负责任务 A 整体协调 |
| 李四 | 开发 | 负责接口相关工作 |
| 王五 | 测试 | 负责测试用例编写 |

---

# 设计意图
distractor_design:
  target_query: "李四负责的具体工作是什么？"
  why_distractor:
    - 包含"李四"（与查询匹配）
    - 包含"负责"关键词
    - 但表述过于简略："负责接口相关工作"
    - 真正详细答案在 DOC-03 表格："接口适配 | 2026-08-28"
  
  expected_system_behavior:
    correct: "检索到 DOC-03 表格，返回'接口适配'"
    acceptable: "同时返回两处，但优先详细信息"
    incorrect: "只返回'负责接口相关工作'（过于模糊）"
  
  test_dimension: "详细信息优先于概要信息"
```

---

## 步骤 5: 记录提取过程

### 填写提取记录

```yaml
extraction_record:
  source: "BEIR / NFCorpus"
  extraction_date: "2026-09-03"
  extractor: "AI 应用测试工程师"
  
  what_extracted:
    patterns:
      - name: "相似主题，不同焦点"
        beir_example: "calcium supplement: side effects vs benefits"
        adapted_to: "任务A: 日期 vs 进度"
        case_id: KBV1-R-021
      
      - name: "相似实体类型，不同实体"
        beir_example: "calcium vs vitamin D"
        adapted_to: "任务A vs 任务B"
        case_id: KBV1-R-010 (已存在)
      
      - name: "相似关键词，不同语义"
        beir_example: "calcium supplement vs calcium in food"
        adapted_to: "李四负责: 概要 vs 详细"
        case_id: KBV1-R-022, KBV1-R-023
    
    structures:
      - qrels 三级相关度
      - 干扰文档类型分类
  
  what_created:
    new_cases: 3
      - KBV1-R-021: 日期 vs 进度干扰
      - KBV1-R-022: 人名+工作详细查询
      - KBV1-R-023: 数字查询+项目干扰
    
    new_documents: 2
      - KBV1-DOC-DISTRACTOR-01: 任务A进度报告
      - KBV1-DOC-DISTRACTOR-02: 项目成员列表
  
  what_not_used:
    - BEIR 的公开语料（生物医学文章）
    - 英文查询
    - 排名评分（NDCG/MRR）
  
  adaptation_notes:
    - 保留：干扰文档设计思路
    - 保留：相关度三级判定
    - 改变：语料从生物医学 → 企业项目
    - 改变：语言从英文 → 中文
    - 改变：实体从补充剂 → 任务/人名
  
  files_updated:
    - test-datasets/retrieval/golden-queries-v1.yaml (新增 3 条)
    - test-datasets/corpus/KBV1-DOC-DISTRACTOR-01.md (新建)
    - test-datasets/corpus/KBV1-DOC-DISTRACTOR-02.md (新建)
    - test-datasets/sources/registry.md (更新 BEIR 行)
```

---

## 📊 提取成果

### 新增用例统计

```yaml
new_cases_summary:
  total: 3
  p0: 2
  p1: 1
  
  coverage:
    - 日期查询 + 进度干扰
    - 人名查询 + 详细度区分
    - 数字查询 + 项目干扰
  
  test_dimensions:
    - 焦点精确性
    - 实体消歧
    - 详细度优先
```

### 可复用模式

```yaml
reusable_patterns:
  - pattern: "相似主题，不同焦点"
    可扩展到:
      - 状态 vs 原因
      - 计划 vs 实际
      - 预算 vs 成本
  
  - pattern: "相似实体，不同实例"
    可扩展到:
      - 项目 A/B/C
      - 用户组 1/2/3
      - 版本 v1/v2
  
  - pattern: "概要 vs 详细"
    可扩展到:
      - 列表 vs 详细描述
      - 摘要 vs 完整纪要
      - 简称 vs 全称
```

---

## ⏱️ 实际用时

```yaml
time_breakdown:
  步骤1_理解BEIR: 30 min
  步骤2_适配模式: 60 min
  步骤3_提取结构: 30 min
  步骤4_创建干扰文档: 45 min
  步骤5_记录过程: 15 min
  
  total: 180 min (3 hours)
```

---

## ✅ 检查清单

完成后确认：
- [x] 已填写 sources/registry.md
- [x] 保留了 BEIR 的出处信息
- [x] 明确标注"借鉴思路，不用原数据"
- [x] 新用例基于自建真值（task-a-facts.yaml）
- [x] 干扰文档设计意图清晰
- [x] 更新了用例文件
- [x] 记录了提取过程

---

**下一步**: 用同样方法从 RAGTruth 提取幻觉分类，从 RGB 提取无答案场景

---

版本: kb-v1-beir-extraction-example-2026-09-03  
维护者: AI 应用测试工程师
