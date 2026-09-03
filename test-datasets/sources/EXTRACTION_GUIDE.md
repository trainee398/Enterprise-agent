# 开源测试集 Case 提取与适配指南

> 从开源资源中提取可用测试用例的实战手册
> 版本：kb-v1-extraction-guide-2026-09-03

---

## 🎯 提取策略总览

### 核心原则

**不直接复制，而是适配**：
- ✅ 借鉴用例维度和判定思路
- ✅ 提取可复用的 Schema 和 Rubric
- ✅ 参考错误分类和边界场景
- ❌ 不直接用开源数据替代企业真值
- ❌ 不把公开语料当作企业文档
- ❌ 不用开源平均分作为发布门槛

### 推荐的三步走

```
第 1 步: 提取 Schema 和维度
  ↓
第 2 步: 基于自建数据实例化
  ↓
第 3 步: 少量开源 case 做专项校准
```

---

## 📋 按资源分类提取

### 1. BEIR（检索基准）⭐ P0

**适用场景**: 校准检索层 Top-K、Recall@K、Precision@K

#### 可提取内容

**维度设计**:
```yaml
从 BEIR 提取的维度模式:
  - 直接问法 vs 同义改写
  - 短查询 vs 长查询
  - 精确匹配 vs 语义相似
  - 单文档答案 vs 多文档综合
  - 清晰答案 vs 模糊边界
```

**适配方法**:

1. **选择小子集**（不要全量下载）
   - 推荐: NFCorpus（生物医学，3.6K文档）
   - 推荐: TREC-COVID（COVID研究，171K文档）
   - 推荐: SciFact（科学声明验证，5K文档）

2. **提取 qrels 结构**
   ```python
   # 原始 BEIR qrels 格式
   {
     "query_id": "q1",
     "doc_id": "d1", 
     "relevance": 1  # 0=不相关, 1=相关, 2=高度相关
   }
   
   # 适配到你的项目
   case_id: KBV1-R-015
   query: "任务 A 的截止日期"
   must_retrieve: [KBV1-DOC-01]
   allowed_adjacent: []
   must_not_retrieve: [KBV1-DOC-06]  # 借鉴干扰文档思路
   ```

3. **可提取的测试场景**
   - ✅ 干扰文档测试（相似但不相关）
   - ✅ Top-K 边界测试（前5 vs 前10）
   - ✅ 查询变体测试（同义词、缩写）
   - ✅ 答案在多个文档中出现

#### 提取清单

```yaml
从 BEIR 提取:
  schemas:
    - qrels 三级相关度（不相关/相关/高度相关）
    - 查询类型分类（factoid/list/definition）
  
  test_scenarios:
    - 干扰文档：相似标题但内容无关
    - 多答案：同一问题在2+文档中有答案
    - 边界：Top-5 有答案但 Top-3 没有
  
  metrics:
    - Recall@K (K=1,5,10)
    - Precision@K
    - NDCG@K
    - MRR (Mean Reciprocal Rank)

不从 BEIR 提取:
  - 不复制公开语料（Wikipedia/论文摘要）
  - 不用它的平均分做门槛
  - 不测上传/Parser/Chunk/权限
```

---

### 2. RAGTruth（答案可信度）⭐ P0

**适用场景**: 借鉴答案接地性和幻觉检测维度

#### 可提取内容

**维度设计**:
```yaml
从 RAGTruth 提取的判定维度:
  hallucination_types:
    - contradictory: 与上下文矛盾
    - extrapolatory: 超出上下文范围
    - unverifiable: 无法从上下文验证
    - irrelevant: 答案与问题无关
  
  granularity:
    - sentence_level: 句子级标注
    - span_level: 具体幻觉片段
    - claim_level: 断言级检查
```

**适配方法**:

1. **借鉴错误分类**
   ```yaml
   # 原始 RAGTruth 分类
   contradictory_hallucination: 与检索文档矛盾
   extrapolatory_hallucination: 推断超出文档
   unverifiable: 无法验证
   
   # 适配到你的项目
   case_id: KBV1-A-021
   query: "任务 A 的预算是多少？"
   answerability: unanswerable
   forbidden_claims:
     - type: extrapolatory
       pattern: "预算约.*元"  # 文档未提供，不可推测
     - type: unverifiable
       pattern: "根据经验估算"  # 无依据
   must_refuse: true
   expected_refusal_reason: "文档未提供预算信息"
   ```

2. **提取 Span-level 标注思路**
   ```yaml
   answer: "任务 A 截止日期为 2026-08-30，负责人是李四"
   groundedness_check:
     - span: "2026-08-30"
       evidence: KBV1-F-01
       status: grounded  ✅
     
     - span: "负责人是李四"
       evidence: null
       status: hallucination  ❌
       type: contradictory  # 真值是张三
   ```

3. **可提取的测试场景**
   - ✅ 数字幻觉（编造不存在的数字）
   - ✅ 日期幻觉（混淆多个日期）
   - ✅ 人名幻觉（张冠李戴）
   - ✅ 外推幻觉（"根据趋势推测..."）
   - ✅ 部分正确（答案一半对一半错）

#### 提取清单

```yaml
从 RAGTruth 提取:
  schemas:
    - 幻觉四分类（contradictory/extrapolatory/unverifiable/irrelevant）
    - Span-level 标注格式
    - Claim-level 拆解方法
  
  test_scenarios:
    - 数字幻觉：编造百分比、金额
    - 混合真假：一句话中部分事实、部分幻觉
    - 无依据推测：用"可能"、"估计"掩盖无证据
    - 引用错位：引用存在但不支撑断言
  
  rubrics:
    - 每个断言必须有对应引用
    - 数字/日期不可改写或约化
    - 无证据时必须拒答

不从 RAGTruth 提取:
  - 不复制它的公开语料
  - 不用它的模型打分替代人工判定
  - 不把它的样例当作企业真值
```

---

### 3. RGB（拒答与鲁棒性）⭐ P0

**适用场景**: 设计无答案拒答和干扰上下文测试

#### 可提取内容

**维度设计**:
```yaml
从 RGB 提取的测试维度:
  noise_robustness:
    - 干扰段落：相关但不含答案
    - 反事实文档：故意误导的内容
    - 过时信息：旧版本文档混入
  
  answer_types:
    - answerable: 有明确答案
    - unanswerable: 文档中无答案
    - conflicting: 多文档答案冲突
```

**适配方法**:

1. **借鉴无答案场景设计**
   ```yaml
   # RGB 的无答案分类
   absence_of_info: 信息缺失
   ambiguous: 信息模糊
   conflicting: 信息冲突
   
   # 适配到你的项目
   case_id: KBV1-R-016
   query: "任务 A 的审批人是谁？"
   answerability: unanswerable
   reason: absence_of_info
   input_documents: [KBV1-DOC-01, KBV1-DOC-02]
   must_not_retrieve_answer: true
   expected_behavior: "文档未提供审批人信息，无法回答"
   forbidden_claims:
     - "审批人是.*"  # 不可编造
     - "根据经验判断"  # 不可推测
   ```

2. **借鉴干扰上下文设计**
   ```yaml
   case_id: KBV1-R-017
   query: "任务 A 的完成度"
   input_documents:
     - KBV1-DOC-01  # 正确答案：60%
     - KBV1-DOC-DISTRACTOR-01  # 干扰：提到"完成度"但是任务 B
   must_retrieve: [KBV1-DOC-01]
   must_not_retrieve: [KBV1-DOC-DISTRACTOR-01]
   expected_answer: "60%"
   distractor_type: similar_topic_different_entity
   ```

3. **借鉴反事实文档设计**
   ```yaml
   case_id: KBV1-R-018
   query: "任务 A 截止日期"
   input_documents:
     - KBV1-DOC-01  # 正确：2026-08-30
     - KBV1-DOC-COUNTERFACTUAL  # 反事实：2026-09-30
   expected_behavior: "识别冲突或选择权威来源"
   acceptable_answers:
     - "2026-08-30（来源：项目计划）"
     - "存在冲突：文档 A 说 08-30，文档 B 说 09-30"
   forbidden_answers:
     - "2026-09-30"  # 错误答案
     - "约 8-9 月"  # 掩盖冲突
   ```

#### 提取清单

```yaml
从 RGB 提取:
  schemas:
    - 无答案三分类（缺失/模糊/冲突）
    - 干扰上下文类型
    - 反事实文档设计
  
  test_scenarios:
    - 无答案拒答：预算、联系方式、审批人
    - 干扰文档：项目 B 混入项目 A 查询
    - 版本冲突：新旧文档同时存在
    - 过时信息：删除后仍可检索
  
  expected_behaviors:
    - 明确说明"文档未提供"
    - 不编造、不推测、不用常识补全
    - 冲突时标注来源或拒绝回答

不从 RGB 提取:
  - 不复制公开问答对
  - 不用它的评分模型替代判定规则
```

---

### 4. TAT-QA / PubTables-1M（表格理解）P1

**适用场景**: 测试表格解析和表格+文本联合取证

#### 可提取内容

**维度设计**:
```yaml
从 TAT-QA 提取的表格测试维度:
  table_operations:
    - single_cell: 单个单元格查询
    - row_aggregation: 行级聚合（求和、平均）
    - column_comparison: 列间比较
    - table_text_joint: 表格+正文联合
  
  table_structures:
    - simple: 简单行列
    - merged_cells: 合并单元格
    - multi_level_header: 多级表头
    - cross_table: 跨表查询
```

**适配方法**:

1. **借鉴表格查询类型**
   ```yaml
   # TAT-QA 的查询分类
   single_span: 单单元格答案
   multiple_span: 多单元格
   arithmetic: 需要计算
   count: 计数
   
   # 适配到你的项目
   case_id: KBV1-R-019
   query: "李四负责的交付物和截止日期分别是什么？"
   intent: multiple_span  # 需要两个字段
   input_documents: [KBV1-DOC-03]
   must_retrieve:
     - doc_id: KBV1-DOC-03
       table_id: TABLE-01
       cells: ["row=2, col=负责人", "row=2, col=交付物", "row=2, col=计划日期"]
   expected_answer:
     - 交付物: "接口适配"
     - 日期: "2026-08-28"
   forbidden:
     - 交付物和日期互换
     - 返回其他人的信息
   ```

2. **借鉴表格+文本联合**
   ```yaml
   case_id: KBV1-R-020
   query: "为什么李四的接口被标记为 Blocked？"
   intent: table_text_joint
   input_documents: 
     - KBV1-DOC-03  # 表格：状态=Blocked
     - KBV1-DOC-02  # 会议纪要：客户改协议
   must_retrieve_both: true
   expected_answer_structure:
     - 表格提供状态
     - 文本提供原因
   acceptable: "接口适配状态为 Blocked（表格），会议纪要显示客户要求修改协议"
   forbidden: "李四延期"  # 不可归责
   ```

#### 提取清单

```yaml
从 TAT-QA / PubTables-1M 提取:
  schemas:
    - 表格查询四分类（single/multiple/arithmetic/count）
    - 表格结构分类（简单/合并/多级表头）
    - 表格+文本联合模式
  
  test_scenarios:
    - 单字段查询：负责人、日期、状态
    - 双字段查询：人名+交付物
    - 表头理解：区分"计划日期"和"实际日期"
    - 行列不可互换：第2行第3列 ≠ 第3行第2列
  
  error_patterns:
    - 表头丢失导致字段张冠李戴
    - 合并单元格理解错误
    - 表格被当作纯文本解析

不从 TAT-QA 提取:
  - 不复制财务报告内容
  - 不测试数学推理（如果产品不承诺）
  - 不用它的答案评分替代事实检查
```

---

### 5. CRUD-RAG（生命周期）P1

**适用场景**: 测试重传、更新、删除传播

#### 可提取内容

**维度设计**:
```yaml
从 CRUD-RAG 提取的生命周期维度:
  operations:
    - Create: 上传新文档
    - Read: 查询
    - Update: 更新已有文档
    - Delete: 删除文档
  
  test_focus:
    - 重复上传语义（覆盖/去重/并存）
    - 更新后旧内容是否残留
    - 删除后是否仍可检索（幽灵数据）
    - 版本冲突处理
```

**适配方法**:

1. **借鉴 Update 测试场景**
   ```yaml
   # CRUD-RAG 的更新场景
   before: "回调超时设置为 30 秒"
   after: "回调超时设置为 60 秒"
   query: "回调超时多久？"
   
   # 适配到你的项目
   case_id: KBV1-LC-013
   operation: Update
   initial_state:
     - upload: KBV1-DOC-07-v1.md
     - content: "回调超时 30 秒"
   
   update_action:
     - upload: KBV1-DOC-07-v2.md
     - content: "回调超时 60 秒"
     - behavior: replace  # 或 version_coexist
   
   query: "接口回调超时规范"
   expected_after_update:
     - answer: "60 秒"
     - must_not_answer: "30 秒"
   
   check_points:
     - 旧版 Chunk 是否仍在索引
     - 查询是否返回新版
     - 是否明确标记版本
   ```

2. **借鉴 Delete 传播测试**
   ```yaml
   case_id: KBV1-LC-014
   operation: Delete
   initial_state:
     - upload: [KBV1-DOC-01, KBV1-DOC-02]
     - verify: 可检索到"任务 A 截止日期"
   
   delete_action:
     - delete: KBV1-DOC-01
     - expected_propagation:
         - Vector DB: 删除相关 chunks
         - Cache: 失效
         - 搜索索引: 删除
   
   query: "任务 A 截止日期"
   expected_after_delete:
     - top_k: 不包含 DOC-01 的 chunks
     - answer: "文档未提供" 或从 DOC-02 回答
   
   forbidden:
     - 仍返回 DOC-01 的内容（幽灵数据）
   ```

#### 提取清单

```yaml
从 CRUD-RAG 提取:
  schemas:
    - CRUD 四操作测试框架
    - 状态时间线（before → action → after）
    - 传播检查点
  
  test_scenarios:
    - 重复上传同名文件
    - 更新后旧答案残留
    - 删除后仍可检索
    - 版本新旧混答
  
  check_points:
    - Vector DB 是否更新
    - Cache 是否失效
    - 文档列表是否同步
    - 查询结果是否反映最新状态

不从 CRUD-RAG 提取:
  - 不复制它的业务场景
  - V1 若不支持版本/删除，标记为风险而非缺陷
```

---

### 6. DocLayNet / PubTables-1M（Parser 结构）P1

**适用场景**: 测试文档结构保留（标题、段落、表格）

#### 可提取内容

**维度设计**:
```yaml
从 DocLayNet 提取的结构测试维度:
  layout_elements:
    - title: 标题层级
    - paragraph: 段落边界
    - list: 列表项
    - table: 表格结构
    - header_footer: 页眉页脚
    - caption: 图表标题
  
  test_focus:
    - 标题路径保留（第1章 > 1.1 > 1.1.1）
    - 阅读顺序正确
    - 表格不被打散成纯文本
    - 列表项不丢失
```

**适配方法**:

1. **借鉴结构标注思路**
   ```yaml
   # DocLayNet 的标注
   page_1:
     - element: title, bbox: [x,y,w,h], text: "项目 A 概述"
     - element: paragraph, bbox: [...], text: "..."
     - element: table, bbox: [...], rows: 3, cols: 4
   
   # 适配到你的项目
   doc_id: KBV1-DOC-02
   expected_structure:
     - type: title
       level: 1
       text: "项目 A 说明"
       must_appear_in_chunk: first_chunk
     
     - type: heading
       level: 2
       text: "1. 项目背景"
       parent: "项目 A 说明"
       must_preserve_hierarchy: true
     
     - type: paragraph
       belongs_to: "1. 项目背景"
       must_not_separate_from_heading: true
     
     - type: table
       headers: ["负责人", "交付物", "计划日期"]
       must_preserve_structure: true
       must_not_flatten_to_text: true
   ```

2. **Parser 质量检查点**
   ```yaml
   parser_checks:
     - 标题层级:
         original: "# 第1章\n## 1.1 概述\n### 1.1.1 背景"
         expected: 保留三级层级关系
         forbidden: 全部变平级
     
     - 表格完整性:
         original: 3行4列表格
         expected: 表头+数据行可区分
         forbidden: 表格变成"负责人 李四 交付物 接口适配..."
     
     - 列表项:
         original: "1. 任务A\n2. 任务B\n3. 任务C"
         expected: 保留列表结构
         forbidden: 丢失编号或合并成一段
     
     - 阅读顺序:
         layout: [标题][正文][侧栏][表格]
         expected: 标题→正文→表格，侧栏不插入中间
   ```

#### 提取清单

```yaml
从 DocLayNet / PubTables-1M 提取:
  schemas:
    - 文档元素分类（title/paragraph/list/table/...）
    - 结构层级表示
    - Bbox 标注方法（可选）
  
  test_scenarios:
    - 多级标题保留
    - 表格不被打散
    - 列表项完整
    - 页眉页脚过滤
  
  check_points:
    - 标题路径可追溯
    - 表头与数据行可区分
    - 阅读顺序符合人类理解

不从 DocLayNet 提取:
  - 不要求精确 Bbox（除非产品承诺）
  - 不测 OCR（若产品只处理文本层）
  - 科学论文结构不等于企业文档
```

---

## 🛠️ 实战：提取与适配流程

### 步骤 1: 下载与登记

```bash
# 1. 访问项目主页
# 2. 确认许可证
# 3. 填写 sources/registry.md
# 4. 下载少量样例（不要全量）
# 5. 计算 SHA-256
```

### 步骤 2: 提取维度和 Schema

```yaml
extraction_template:
  source: "BEIR / NFCorpus"
  extraction_date: "2026-09-03"
  
  extracted_schemas:
    - name: "qrels 三级相关度"
      original_format: "query_id, doc_id, relevance (0/1/2)"
      adapted_to: "must_retrieve / allowed_adjacent / must_not_retrieve"
    
    - name: "查询类型"
      original_format: "factoid / list / definition / opinion"
      adapted_to: "日期/数字/人名/表格/转述/无答案"
  
  extracted_scenarios:
    - name: "干扰文档测试"
      description: "相似标题但内容无关"
      adapted_case_ids: [KBV1-R-010, KBV1-R-017]
    
    - name: "多文档答案"
      description: "同一问题在2+文档中有答案"
      adapted_case_ids: [KBV1-R-009, KBV1-R-014]
```

### 步骤 3: 基于自建数据实例化

```python
# 伪代码：适配 BEIR 干扰文档思路到任务 A

def adapt_beir_distractor_to_task_a():
    # BEIR 思路：相似标题、不相关内容
    beir_pattern = {
        "query": "COVID-19 treatment",
        "relevant_doc": "doc_about_covid_treatment",
        "distractor_doc": "doc_about_covid_prevention"  # 相似主题，不同焦点
    }
    
    # 适配到任务 A
    adapted_case = {
        "case_id": "KBV1-R-010",
        "query": "任务 A 的完成度",
        "relevant_doc": "KBV1-DOC-01",  # 项目 A
        "distractor_doc": "KBV1-DOC-06",  # 项目 B，也有"完成度"字段
        "must_retrieve": ["KBV1-DOC-01"],
        "must_not_retrieve": ["KBV1-DOC-06"],
        "expected_answer": "60%",  # 来自自建真值
        "test_dimension": "专名优先于相似词"
    }
    
    return adapted_case
```

### 步骤 4: 少量开源 case 做校准

```yaml
calibration_set:
  # 从 BEIR NFCorpus 选 5-10 条
  - original_query_id: "nfcorpus_q1"
    adapted_query: "某个技术概念的定义"
    purpose: "校准语义检索基线"
    keep_original_doc: true  # 这批保留原文档
    metric: "Recall@10"
    baseline_threshold: 0.80
  
  # 从 RAGTruth 选 3-5 条
  - original_case_id: "ragtruth_halluc_001"
    adapted_query: 基于任务 A 改写
    purpose: "校准幻觉检测"
    use_self_built_doc: true  # 用自建文档
    metric: "幻觉检出率"
    baseline_threshold: 0.90
```

---

## 📊 提取优先级矩阵

| 开源资源 | 提取内容 | 优先级 | 工作量 | 价值 |
|---------|---------|--------|--------|------|
| **BEIR** | 干扰文档、qrels、查询分类 | 🔴 P0 | 2-3h | ⭐⭐⭐⭐⭐ |
| **RAGTruth** | 幻觉分类、span标注、claim拆解 | 🔴 P0 | 2-3h | ⭐⭐⭐⭐⭐ |
| **RGB** | 无答案场景、干扰上下文、反事实 | 🔴 P0 | 1-2h | ⭐⭐⭐⭐⭐ |
| **TAT-QA** | 表格查询分类、表格+文本联合 | 🟡 P1 | 2-3h | ⭐⭐⭐⭐ |
| **CRUD-RAG** | 生命周期操作、状态时间线 | 🟡 P1 | 1-2h | ⭐⭐⭐⭐ |
| **DocLayNet** | 结构标注、Parser 检查点 | 🟡 P1 | 2-3h | ⭐⭐⭐ |
| **MTEB** | Embedding 比较基线 | 🟢 P2 | 1h | ⭐⭐ |

---

## 📝 提取模板

### 通用提取记录模板

```yaml
extraction_record:
  source_dataset: "BEIR / NFCorpus"
  source_url: "https://github.com/beir-cellar/beir"
  extraction_date: "2026-09-03"
  extractor: "AI 应用测试工程师"
  
  what_extracted:
    schemas:
      - qrels 三级相关度
      - 查询类型分类
    
    scenarios:
      - 干扰文档测试
      - Top-K 边界测试
    
    metrics:
      - Recall@K
      - NDCG@K
  
  what_not_extracted:
    - 公开语料（Wikipedia/论文）
    - 平均分门槛
    - 上传/Parser/权限测试
  
  adaptation:
    adapted_to_cases: [KBV1-R-010, KBV1-R-015, KBV1-R-017]
    self_built_data_used: true
    original_data_kept: false  # 只借鉴思路，不用原数据
  
  files_created:
    - test-datasets/sources/beir-nfcorpus-extract.yaml
    - test-datasets/retrieval/golden-queries-v1.yaml (新增 3 条)
```

---

## ⚠️ 注意事项

### 必须做

- ✅ 提取前填写 sources/registry.md 登记
- ✅ 确认许可证允许内部测试使用
- ✅ 保留原始 ID 映射和出处
- ✅ 明确标注"借鉴思路"还是"使用原数据"
- ✅ 计算并记录文件 SHA-256

### 不要做

- ❌ 不要全量下载（BEIR 全集、MS MARCO）
- ❌ 不要直接用开源平均分做发布门槛
- ❌ 不要把公开语料当作企业文档
- ❌ 不要混淆"参考方法"和"使用数据"
- ❌ 不要在未登记的情况下使用外部数据

### 判断标准

**什么时候直接用原数据？**
- 只用于校准检索基线（如 BEIR 小子集）
- 明确标记为"校准集"，不混入发布门槛
- 保留原始 ID 和许可证信息

**什么时候只借鉴思路？**
- 用例维度、错误分类、判定规则
- 测试场景设计、边界条件
- Schema、Rubric、检查点列表

**什么时候完全不用？**
- 领域差异太大（科学论文 vs 企业纪要）
- 能力不匹配（OCR数据 vs 纯文本产品）
- 许可证不清楚或不允许

---

## 🎯 快速开始

### 本周推荐提取计划

**第 1 天**（2-3 小时）:
1. 从 BEIR NFCorpus 提取干扰文档思路
2. 适配到 KBV1-R-010, R-017
3. 提取 qrels 结构到 retrieval/

**第 2 天**（2-3 小时）:
1. 从 RAGTruth 提取幻觉四分类
2. 适配到 KBV1-A-021 至 A-025
3. 补充 span-level 标注格式

**第 3 天**（1-2 小时）:
1. 从 RGB 提取无答案场景
2. 适配到 KBV1-R-016, R-018
3. 补充拒答测试用例

**总计**: 5-8 小时，可提取 10-15 条新用例

---

## 📚 相关文档

- **开源资源登记**: `sources/registry.md`
- **已有用例**: `retrieval/`, `answer/`, `ux/`, `lifecycle/`
- **真值表**: `truth/task-a-facts.yaml`
- **原始调研**: `docs/09-开源测试集调研与知识库V1数据集规划.md`

---

**版本**: kb-v1-extraction-guide-2026-09-03  
**维护者**: AI 应用测试工程师  
**最后更新**: 2026-09-03
