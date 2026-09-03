# TAT-QA 提取实战示例：表格理解与表格+文本联合

> **示例状态**：以下用例是借鉴 TAT-QA 查询类型后基于本项目任务 A 构造的示例，不是官方财务语料的直接使用；正式下载和纳入校准集前需复核版本、许可证和原始 ID。

> 从 TAT-QA 提取表格查询模式并适配到任务 A
> 完成时间：约 2-3 小时

---

## 📋 提取目标

从 TAT-QA (Tabular And Textual dataset for Question Answering) 提取：
- 表格查询四分类
- 表格+文本联合取证模式
- 表格结构理解检查点

**不提取**：
- ❌ 财务报告内容
- ❌ 复杂数学推理（若产品不承诺）
- ❌ 跨表计算

---

## 步骤 1: 理解 TAT-QA 的表格查询分类

### TAT-QA 的四种查询类型

```yaml
# TAT-QA 查询分类（简化说明）

query_types:
  
  1. single_span:
    定义: "答案是表格中的单个单元格"
    示例:
      table: |
        | Product | Revenue | Growth |
        | A       | 100M    | 10%    |
        | B       | 200M    | 15%    |
      query: "What is the revenue of Product A?"
      answer: "100M"
      type: single_span
      cell: row=1, col="Revenue"
  
  2. multiple_span:
    定义: "答案需要多个单元格"
    示例:
      query: "What are the revenues of Product A and B?"
      answer: "100M and 200M"
      type: multiple_span
      cells: [(1, Revenue), (2, Revenue)]
  
  3. arithmetic:
    定义: "需要表格内计算"
    示例:
      query: "What is the total revenue?"
      answer: "300M"
      type: arithmetic
      operation: "100M + 200M"
  
  4. count:
    定义: "计数查询"
    示例:
      query: "How many products are listed?"
      answer: "2"
      type: count
```

### TAT-QA 的表格+文本联合

```yaml
table_text_joint:
  定义: "答案需要同时依赖表格和正文"
  
  示例:
    table: |
      | Task    | Status  | Owner |
      | Task A  | Blocked | 李四   |
    
    text: "会议纪要：2026-08-20 客户要求修改接口协议"
    
    query: "为什么 Task A 被阻塞？"
    
    answer_structure:
      - from_table: "Task A 状态为 Blocked"
      - from_text: "客户要求修改接口协议"
      - joint: "Task A 被阻塞，会议纪要显示客户要求修改协议"
```

---

## 步骤 2: 适配表格查询到任务 A

### 用例 1: Single Span - 单字段查询

```yaml
case_id: KBV1-R-031
category: table_single_span
priority: P0

query: "李四的计划交付日期是什么时候？"
input_documents: [KBV1-DOC-03]

table_structure:
  headers: ["负责人", "交付物", "计划日期", "状态"]
  rows:
    - ["张三", "需求文档", "2026-08-25", "已完成"]
    - ["李四", "接口适配", "2026-08-28", "Blocked"]
    - ["王五", "测试报告", "2026-08-30", "进行中"]

must_retrieve:
  - doc_id: KBV1-DOC-03
    table_id: TABLE-01
    target_cell:
      row: 2  # 李四那一行
      column: "计划日期"
      value: "2026-08-28"

expected_answer: "2026-08-28"

answer_constraints:
  - 必须返回具体日期
  - 不可混淆其他人的日期
  - 不可改写为"约 8 月底"

forbidden_answers:
  - "2026-08-25"  # 张三的日期
  - "2026-08-30"  # 王五的日期
  - "8 月底"      # 模糊化

判定方式: code
判定规则: |
  extract_date(answer) == "2026-08-28"
  AND mentioned_person(answer) in ["李四", "implicit"]
  AND NOT contains(answer, ["约", "左右"])

table_understanding_check:
  - ✅ 能定位到正确的行（李四）
  - ✅ 能定位到正确的列（计划日期）
  - ✅ 不会混淆其他行的值
```

### 用例 2: Multiple Span - 多字段查询

```yaml
case_id: KBV1-R-032
category: table_multiple_span
priority: P0

query: "李四负责的交付物和计划日期分别是什么？"
input_documents: [KBV1-DOC-03]

must_retrieve:
  - doc_id: KBV1-DOC-03
    table_id: TABLE-01
    target_cells:
      - row: 2, column: "交付物", value: "接口适配"
      - row: 2, column: "计划日期", value: "2026-08-28"

expected_answer_structure:
  field_1: "接口适配"
  field_2: "2026-08-28"
  order_matters: true  # 不可颠倒

acceptable_answers:
  - "交付物是接口适配，计划日期是 2026-08-28"
  - "李四负责接口适配，计划日期 2026-08-28"
  - "接口适配，2026-08-28"

forbidden_answers:
  - "2026-08-28，接口适配"  # 顺序错误（日期和交付物颠倒）
  - "接口适配"              # 不完整，缺日期
  - "2026-08-28"            # 不完整，缺交付物
  - "需求文档，2026-08-25"  # 混淆了其他人

判定方式: code
判定规则: |
  contains(answer, "接口适配") AND contains(answer, "2026-08-28")
  AND NOT contains(answer, ["需求文档", "测试报告"])
  
  # 检查顺序（可选，取决于产品要求）
  position_of("接口适配") < position_of("2026-08-28")

table_understanding_check:
  - ✅ 能同时提取多个字段
  - ✅ 字段对应关系正确
  - ✅ 不会张冠李戴
  - ✅ 保持合理的字段顺序
```

### 用例 3: Arithmetic - 表内计算（简单）

```yaml
case_id: KBV1-R-033
category: table_arithmetic
priority: P1

query: "有几个任务还没完成？"
input_documents: [KBV1-DOC-03]

table_structure:
  headers: ["负责人", "交付物", "计划日期", "状态"]
  rows:
    - ["张三", "需求文档", "2026-08-25", "已完成"]
    - ["李四", "接口适配", "2026-08-28", "Blocked"]
    - ["王五", "测试报告", "2026-08-30", "进行中"]

reasoning_required:
  - step_1: "识别状态列"
  - step_2: "筛选非'已完成'状态"
  - step_3: "计数：Blocked(1) + 进行中(1) = 2"

expected_answer: "2"

acceptable_answers:
  - "2 个任务还没完成"
  - "有 2 个未完成任务（李四的接口适配和王五的测试报告）"
  - "2 个"

forbidden_answers:
  - "1 个"   # 计数错误
  - "3 个"   # 包含了已完成的
  - "两个"   # 应该用数字（可根据产品要求调整）

判定方式: code
判定规则: |
  extract_number(answer) == 2
  AND NOT contains(answer, ["约", "左右"])

calculation_check:
  - ✅ 能理解状态字段的语义
  - ✅ 能筛选满足条件的行
  - ✅ 能正确计数
  - ❌ 不需要跨表计算（超出此用例范围）
```

### 用例 4: 表头理解 - 区分相似列名

```yaml
case_id: KBV1-R-034
category: table_header_disambiguation
priority: P0

# 创建包含相似列名的表格
document_with_similar_columns:
  id: KBV1-DOC-TABLE-02
  content: |
    ## 任务进度跟踪
    
    | 负责人 | 交付物 | 计划日期 | 实际日期 | 状态 |
    |--------|--------|----------|----------|------|
    | 张三   | 需求   | 08-25    | 08-24    | 完成 |
    | 李四   | 接口   | 08-28    | -        | 进行中 |

query: "李四的实际交付日期是什么时候？"
input_documents: [KBV1-DOC-TABLE-02]

must_retrieve:
  - doc_id: KBV1-DOC-TABLE-02
    target_cell:
      row: 2  # 李四
      column: "实际日期"  # NOT "计划日期"
      value: "-"  # 空值

expected_answer: "尚未实际交付"

acceptable_answers:
  - "李四尚未实际交付（实际日期为空）"
  - "实际交付日期暂无记录"
  - "还没有实际交付"

forbidden_answers:
  - "2026-08-28"  # 错误：返回了"计划日期"而非"实际日期"
  - "08-28"       # 同上
  - "未知"        # 不够明确

判定方式: manual + rubric
判定规则: |
  1. 不得返回"计划日期"的值（08-28）
  2. 必须说明"实际日期"为空或未交付
  3. 不可混淆"计划"和"实际"两列

table_understanding_check:
  - ✅ 能区分相似列名（计划日期 vs 实际日期）
  - ✅ 能正确处理空值单元格
  - ✅ 不会用其他列的值填补空值
  - ⚠️ 这是 Parser 质量的关键测试点
```

---

## 步骤 3: 适配表格+文本联合

### 用例 5: 表格提供事实，文本提供原因

```yaml
case_id: KBV1-R-035
case_id_answer: KBV1-A-029
category: table_text_joint_causality
priority: P0

query: "为什么李四的接口适配被标记为 Blocked？"
input_documents: [KBV1-DOC-03, KBV1-DOC-02]

# 表格提供状态
table_source:
  doc_id: KBV1-DOC-03
  fact_id: KBV1-F-06
  provides: "李四接口适配状态为 Blocked"

# 文本提供原因
text_source:
  doc_id: KBV1-DOC-02
  fact_id: KBV1-F-07
  provides: "2026-08-20 客户提出修改接口协议"

must_retrieve_both: true

expected_answer_structure:
  from_table: "接口适配状态为 Blocked"
  from_text: "会议纪要显示客户要求修改协议"
  connection: "可能相关" OR "时间上接近" BUT NOT "因果确认"

acceptable_answers:
  - "接口适配被标记为 Blocked，会议纪要显示客户于 08-20 要求修改接口协议"
  - "状态为 Blocked（表格），会议纪要提到客户修改协议（纪要）"
  - "表格显示 Blocked，纪要显示客户改了协议，可能相关"

forbidden_answers:
  - "因为客户修改协议导致 Blocked"  # 未经验证的因果
  - "由于客户需求变更"              # 未经验证的因果
  - 只提表格或只提文本，缺少另一侧

判定方式: rubric + citation_check
判定规则: |
  1. 必须同时引用表格和文本
  2. 不可断言未经验证的因果关系
  3. 可以说"可能相关"、"时间接近"
  4. 不可直接说"因为...所以..."

joint_retrieval_check:
  - ✅ 能识别需要跨文档取证
  - ✅ 表格和文本都能检索到
  - ✅ 能整合两侧信息
  - ⚠️ 不过度推断因果关系

重要原则: "表格+文本联合 ≠ 可以推断因果"
```

### 用例 6: 表格提供数据，文本提供解释

```yaml
case_id: KBV1-R-036
category: table_text_joint_context
priority: P1

# 创建表格+文本组合文档
document_with_table_and_text:
  id: KBV1-DOC-JOINT-01
  content: |
    ## 任务 A 里程碑
    
    | 阶段 | 计划完成 | 实际完成 | 差异 |
    |------|----------|----------|------|
    | 需求 | 08-15    | 08-14    | 提前1天 |
    | 开发 | 08-25    | 08-28    | 延迟3天 |
    
    **说明**: 开发阶段延迟是因为客户在 08-20 临时增加了安全认证需求。

query: "开发阶段为什么延迟了？"
input_documents: [KBV1-DOC-JOINT-01]

must_retrieve:
  - table_cell: "开发阶段延迟 3 天"
  - text_span: "客户在 08-20 临时增加了安全认证需求"

expected_answer: "开发阶段延迟 3 天，说明显示是因为客户临时增加了安全认证需求"

acceptable_answers:
  - "延迟 3 天，原因是客户增加安全认证需求"
  - "表格显示延迟 3 天，文档说明是因为客户临时加需求"

forbidden_answers:
  - "延迟了 3 天"               # 缺少原因
  - "因为客户加需求"           # 缺少具体延迟时间
  - "延迟了，但不知道原因"     # 忽略了文本说明

判定方式: code + citation_check
判定规则: |
  contains(answer, "3 天" OR "延迟 3 天")
  AND contains(answer, "客户" AND "安全认证")
  AND citation_count >= 2  # 至少引用表格和文本各一次

joint_retrieval_check:
  - ✅ 能从表格提取数值事实
  - ✅ 能从文本提取解释性说明
  - ✅ 能自然整合两侧信息
  - ✅ 这种因果是文档明确说明的（不是推断）
```

---

## 步骤 4: 表格结构理解检查点

### Parser 质量检查清单

```yaml
table_parsing_checks:
  
  check_1_header_preservation:
    name: "表头保留完整"
    test_case: KBV1-R-037
    original: |
      | 负责人 | 交付物 | 计划日期 |
      |--------|--------|----------|
      | 张三   | 需求   | 08-25    |
    
    expected_parsed:
      headers: ["负责人", "交付物", "计划日期"]
      rows: [["张三", "需求", "08-25"]]
    
    forbidden_parsed:
      - 表头丢失，变成普通数据行
      - 表头与数据混淆
      - 列名变成"列1"、"列2"
  
  check_2_cell_alignment:
    name: "单元格对齐正确"
    test_case: KBV1-R-038
    query: "李四负责什么？"
    
    correct_mapping:
      row: "李四 | 接口适配 | 08-28"
      answer: "接口适配"  # 第2列
    
    incorrect_mapping:
      - "李四"      # 错位到第1列
      - "08-28"     # 错位到第3列
    
    test_method: "查询特定单元格，检查返回值是否对应正确列"
  
  check_3_merged_cells:
    name: "合并单元格处理"
    test_case: KBV1-R-039
    original: |
      | 项目   | 任务   | 负责人 |
      |--------|--------|--------|
      | 项目A  | 任务1  | 张三   |
      |        | 任务2  | 李四   |  ← "项目A"合并单元格
    
    expected_understanding:
      - row_1: 项目A, 任务1, 张三
      - row_2: 项目A, 任务2, 李四  # "项目A"应该传播到第2行
    
    query: "李四负责哪个项目的任务？"
    expected_answer: "项目 A 的任务 2"
    forbidden_answer: "不知道项目"  # 说明合并单元格丢失
  
  check_4_table_caption:
    name: "表格标题关联"
    test_case: KBV1-R-040
    document: |
      表1: 任务 A 进度表
      
      | 负责人 | 状态 |
      |--------|------|
      | 张三   | 完成 |
      
      表2: 任务 B 进度表
      
      | 负责人 | 状态 |
      |--------|------|
      | 李四   | 进行中 |
    
    query: "任务 A 的负责人是谁？"
    expected: "张三"
    forbidden: "李四"  # 混淆了表2
    
    check: "能否根据表格标题定位到正确的表格"
  
  check_5_table_not_flattened:
    name: "表格不被打散成纯文本"
    test_case: KBV1-R-041
    
    correct_parsing: "保留表格结构，行列可区分"
    
    incorrect_parsing:
      example: "负责人 张三 交付物 需求 日期 08-25 负责人 李四 交付物 接口..."
      problem: "表格被打散成一段连续文本"
      consequence: "无法定位特定单元格"
```

---

## 步骤 5: 创建测试文档

### 标准表格文档

```markdown
# KBV1-DOC-03-extended.md（扩展版）

## 任务 A 交付物跟踪表

| 负责人 | 交付物   | 计划日期 | 实际日期 | 状态   | 备注 |
|--------|----------|----------|----------|--------|------|
| 张三   | 需求文档 | 08-25    | 08-24    | 已完成 | 提前1天 |
| 李四   | 接口适配 | 08-28    | -        | Blocked | 等待客户确认 |
| 王五   | 测试报告 | 08-30    | -        | 进行中 | 预计按时 |

---

# 设计意图
table_test_coverage:
  - single_span: 李四的计划日期（08-28）
  - multiple_span: 李四的交付物和日期（接口适配, 08-28）
  - header_disambiguation: 计划日期 vs 实际日期
  - empty_cell: 李四的实际日期为空
  - arithmetic: 有几个未完成任务（2个）
  - status_query: 李四的状态（Blocked）
```

### 合并单元格表格

```markdown
# KBV1-DOC-TABLE-03.md

## 项目任务分配表

| 项目   | 阶段   | 任务     | 负责人 | 状态   |
|--------|--------|----------|--------|--------|
| 项目A  | 需求   | 需求调研 | 张三   | 完成   |
|        |        | 需求评审 | 李四   | 完成   |
|        | 开发   | 接口开发 | 李四   | 进行中 |
|        |        | 前端开发 | 王五   | 进行中 |

注: "项目A"和"需求"、"开发"是合并单元格

---

# 设计意图
merged_cell_tests:
  query_1: "李四负责项目A的哪些任务？"
  expected: "需求评审和接口开发"
  test: "合并单元格是否正确传播到所有相关行"
  
  query_2: "项目A开发阶段有几个任务？"
  expected: "2个（接口开发、前端开发）"
  test: "能否理解阶段（合并单元格）的范围"
```

---

## 步骤 6: 记录提取过程

```yaml
extraction_record:
  source: "TAT-QA (Tabular And Textual QA)"
  extraction_date: "2026-09-03"
  extractor: "AI 应用测试工程师"
  
  what_extracted:
    query_types:
      - single_span: 单字段查询
      - multiple_span: 多字段查询
      - arithmetic: 表内简单计算
      - count: 计数查询
    
    table_text_joint:
      - 表格提供事实 + 文本提供原因
      - 表格提供数据 + 文本提供解释
    
    parsing_checks:
      - 表头保留
      - 单元格对齐
      - 合并单元格
      - 表格标题关联
      - 表格不被打散
  
  what_created:
    new_cases: 11
      - KBV1-R-031: single_span (李四日期)
      - KBV1-R-032: multiple_span (李四交付物+日期)
      - KBV1-R-033: arithmetic (未完成任务计数)
      - KBV1-R-034: header_disambiguation (计划vs实际)
      - KBV1-R-035/A-029: table_text_joint (Blocked原因)
      - KBV1-R-036: table_text_joint (延迟解释)
      - KBV1-R-037~041: Parser检查点 (5个)
    
    new_documents: 3
      - KBV1-DOC-03-extended: 扩展表格（6列）
      - KBV1-DOC-TABLE-02: 相似列名表格
      - KBV1-DOC-TABLE-03: 合并单元格表格
  
  what_not_used:
    - TAT-QA 的财务报告内容
    - 复杂数学推理（除法、百分比变化等）
    - 跨表查询（JOIN操作）
    - 英文样例
  
  adaptation_notes:
    - 保留：四种查询分类
    - 保留：表格+文本联合模式
    - 保留：Parser 检查点
    - 简化：只保留简单算术（计数、求和）
    - 改变：从财务表格 → 项目管理表格
    - 新增：合并单元格测试
  
  files_updated:
    - test-datasets/retrieval/golden-queries-v1.yaml (新增 11 条)
    - test-datasets/answer/trust-golden-v1.yaml (新增 1 条联合)
    - test-datasets/corpus/ (新增 3 份表格文档)
    - test-datasets/sources/registry.md (更新 TAT-QA 行)
```

---

## 📊 提取成果

### 新增用例统计

```yaml
new_cases_summary:
  total: 11
  p0: 7
  p1: 4
  
  coverage:
    - 单字段查询（日期、人名、状态）
    - 多字段查询（交付物+日期）
    - 表内计算（计数、筛选）
    - 表头消歧（计划vs实际）
    - 表格+文本联合（2种模式）
    - Parser质量（5个检查点）
  
  detection_methods:
    - 代码判定: 单字段、多字段、计数
    - Rubric: 表头消歧、因果关系
    - Manual: 联合取证、Parser质量
```

### 可复用模式

```yaml
reusable_table_patterns:
  
  single_field_query:
    - 人名 → 日期
    - 人名 → 状态
    - 人名 → 交付物
    可扩展到: 任何"实体 → 属性"查询
  
  multi_field_query:
    - 人名 → 交付物 + 日期
    - 项目 → 负责人 + 状态
    可扩展到: 任何需要同一行多列的查询
  
  table_calculation:
    - 计数（有几个...）
    - 筛选（状态为X的...）
    - 求和（简单）
    不扩展到: 除法、百分比、跨表
  
  table_text_joint:
    - 表格（事实） + 文本（原因）
    - 表格（数据） + 文本（解释）
    可扩展到: 任何需要跨模态取证的场景
```

---

## ⏱️ 实际用时

```yaml
time_breakdown:
  步骤1_理解TAT-QA: 20 min
  步骤2_适配查询类型: 60 min
  步骤3_表格+文本联合: 40 min
  步骤4_Parser检查点: 30 min
  步骤5_创建测试文档: 30 min
  步骤6_记录过程: 20 min
  
  total: 200 min (3.3 hours)
```

---

## ✅ 检查清单

完成后确认：
- [x] 已填写 sources/registry.md
- [x] 保留了 TAT-QA 的出处信息
- [x] 四种查询类型都有用例
- [x] 表格+文本联合有2种模式
- [x] Parser 检查点清晰
- [x] 创建了测试表格文档
- [x] 更新了用例文件
- [x] 记录了提取过程

---

## 🎯 关键收获

### 表格查询的四个层次

| 类型 | 复杂度 | 检测方式 | 常见错误 |
|------|--------|---------|---------|
| Single Span | 低 | 代码 | 行列混淆 |
| Multiple Span | 中 | 代码 | 字段颠倒 |
| Arithmetic | 中-高 | 代码+推理 | 计算错误 |
| Count | 中 | 代码 | 筛选条件错 |

### 表格+文本联合的价值

**测试跨模态取证能力**
- 单看表格：知道"什么状态"
- 单看文本：知道"发生什么事"
- 联合：能回答"为什么是这个状态"

**但要警惕过度推断**
- ✅ "表格X，文本Y，可能相关"
- ❌ "因为Y所以X"（除非文档明确说）

### Parser 是表格测试的前提

**表格用例失败的两种原因**：
1. 检索/生成错误（算法问题）
2. Parser 错误（表格被打散、表头丢失）

**必须区分**：
- 先测 Parser：表格结构是否保留
- 再测算法：基于正确结构的查询能力

---

**已完成 4/6 个开源资源提取示例**:
1. ✅ BEIR (检索基准)
2. ✅ RAGTruth (答案可信度)
3. ✅ RGB (拒答鲁棒性)
4. ✅ TAT-QA (表格理解) ⭐

**下一步**: CRUD-RAG（生命周期）或 DocLayNet（文档结构）

---

版本: kb-v1-tatqa-extraction-example-2026-09-03  
维护者: AI 应用测试工程师
