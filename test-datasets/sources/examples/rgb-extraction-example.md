# RGB 提取实战示例：无答案拒答与鲁棒性

> 后续方法资料（2026-09-08）：本文保留开源/RAG 预研内容，不是当前文档管理一期的必做任务，也不代表已下载官方数据或通过产品测试。当前范围见[范围记录](../../../docs/00-知识库一期范围与待确认事项.md)。

> 从 RGB 提取无答案场景和干扰测试并适配到任务 A
> 完成时间：约 1-2 小时

---

## 📋 提取目标

从 RGB (Retrieval-Augmented Generation Benchmark) 提取：
- 无答案三分类
- 干扰上下文设计
- 反事实文档测试

**不提取**：
- ❌ 公开问答对内容
- ❌ 评分模型
- ❌ 聚合指标

---

## 步骤 1: 理解 RGB 的无答案分类

### RGB 的三种无答案场景

```yaml
# RGB 无答案分类（简化说明）

unanswerable_types:
  
  1. absence_of_info:
    定义: "文档中完全没有相关信息"
    示例:
      documents: ["Project timeline", "Team structure"]
      query: "What is the project budget?"
      answer: "The documents do not provide budget information."
      类型: absence_of_info
  
  2. ambiguous:
    定义: "信息模糊或不完整，无法给出明确答案"
    示例:
      document: "The task will complete soon."
      query: "When will the task complete?"
      answer: "Cannot determine - 'soon' is not a specific date."
      类型: ambiguous
  
  3. conflicting:
    定义: "多个文档信息冲突，无法确定正确答案"
    示例:
      doc_A: "Deadline is 2026-08-30"
      doc_B: "Deadline is 2026-09-30"
      query: "What is the deadline?"
      answer: "Conflicting information: Doc A says 08-30, Doc B says 09-30."
      类型: conflicting
```

### 提取的设计模式

```yaml
pattern_1_absence:
  特征: "问题合理，但文档确实没有"
  正确行为: "明确说明'文档未提供X信息'"
  错误行为: "编造答案或用常识补全"
  检测方式: "关键词不在文档中 + 禁止编造"

pattern_2_ambiguous:
  特征: "有相关信息但过于模糊"
  正确行为: "说明信息模糊，无法给出确切答案"
  错误行为: "强行解读模糊信息"
  检测方式: "答案精确度要求 vs 文档精确度"

pattern_3_conflicting:
  特征: "多源信息不一致"
  正确行为:
    - 选项1: "列出冲突并注明来源"
    - 选项2: "说明存在冲突，无法确定"
    - 选项3: "选择权威来源并说明理由"
  错误行为: "只返回其中一个，不说明冲突"
  检测方式: "检查是否识别并处理冲突"
```

---

## 步骤 2: 适配无答案场景到任务 A

### 场景 1: Absence - 信息缺失

```yaml
case_id: KBV1-R-024
case_id_answer: KBV1-A-026
category: absence_of_info
priority: P0

query: "任务 A 的预算是多少？"
input_documents: [KBV1-DOC-01, KBV1-DOC-02, KBV1-DOC-03]
answerability: unanswerable
reason: "文档未提供预算信息"

ground_truth:
  available_info:
    - 截止日期
    - 完成度
    - P1 数量
    - 负责人
  missing_info:
    - 预算
    - 成本
    - 资金审批

# 测试各种答案
test_answers:
  
  # 错误答案 1: 编造数字
  - answer: "任务 A 预算约 50 万元"
    forbidden_reason: "编造了不存在的数字"
    判定: FAIL
  
  # 错误答案 2: 用常识推测
  - answer: "根据项目规模，预算应该在 30-100 万之间"
    forbidden_reason: "用常识推测，无文档依据"
    判定: FAIL
  
  # 错误答案 3: 用相关但不同的信息
  - answer: "文档提到任务 A 的完成度，但未提供预算"
    status: acceptable_but_incomplete
    判定: PARTIAL - 说明了没有，但多余信息可能误导
  
  # 正确答案 1: 明确拒答
  - answer: "文档未提供任务 A 的预算信息"
    判定: PASS
  
  # 正确答案 2: 列出可用信息
  - answer: "文档未提供预算信息。可用信息包括：截止日期、完成度、P1 数量等"
    判定: PASS - 更有帮助

expected_behavior:
  must: "明确说明'文档未提供预算信息'"
  must_not:
    - 编造数字
    - 用常识推测
    - 返回无关信息
  may: "列出实际可用的相关信息"

判定方式: code + forbidden_patterns
forbidden_patterns:
  - "预算.*\\d+"  # 任何预算+数字组合
  - "(约|大概|估计).*元"
  - "根据.*推测"
  - "应该.*之间"
```

### 场景 2: Ambiguous - 信息模糊

```yaml
case_id: KBV1-R-025
case_id_answer: KBV1-A-027
category: ambiguous_info
priority: P0

# 创建模糊文档
document_ambiguous:
  id: KBV1-DOC-AMBIGUOUS-01
  content: |
    任务 A 进展顺利，团队正在全力推进。
    预计很快就能完成剩余工作。

query: "任务 A 什么时候完成？"
input_documents: [KBV1-DOC-AMBIGUOUS-01]
answerability: unanswerable
reason: "信息模糊（'很快'不是具体日期）"

ground_truth:
  provided_info: "预计很快完成"
  missing_specificity: "没有具体日期"

# 测试各种答案
test_answers:
  
  # 错误答案 1: 强行解读
  - answer: "任务 A 将在本周完成"
    forbidden_reason: "'很快' → '本周' 是无依据解读"
    判定: FAIL
  
  # 错误答案 2: 量化模糊词
  - answer: "任务 A 预计 3-5 天内完成"
    forbidden_reason: "把'很快'量化为具体天数"
    判定: FAIL
  
  # 正确答案 1: 说明模糊性
  - answer: "文档提到'很快完成'，但未给出具体日期"
    判定: PASS
  
  # 正确答案 2: 引用原文
  - answer: "文档表述为'预计很快就能完成剩余工作'，无法确定具体完成时间"
    判定: PASS - 更准确

expected_behavior:
  must: "说明信息模糊或不够具体"
  must_not:
    - 把模糊词转为具体值
    - 强行解读主观表述
  should: "引用原文模糊表述"

判定方式: rubric
ambiguous_indicators:
  - "很快"、"不久"、"近期"
  - "大约"、"左右"（当用于关键信息时）
  - "顺利"、"良好"（主观评价）
```

### 场景 3: Conflicting - 信息冲突

```yaml
case_id: KBV1-R-026
case_id_answer: KBV1-A-028
category: conflicting_info
priority: P0

# 使用已有版本文档
query: "接口回调超时应该设置多久？"
input_documents: [KBV1-DOC-07-v1, KBV1-DOC-07-v2]
answerability: conflicting
reason: "旧版说 30 秒，新版说 60 秒"

ground_truth:
  conflict_details:
    - source: KBV1-DOC-07-v1
      value: "30 秒"
      date: "旧版"
    - source: KBV1-DOC-07-v2
      value: "60 秒"
      date: "新版"

# 测试各种答案
test_answers:
  
  # 错误答案 1: 只返回一个值
  - answer: "接口回调超时设置为 60 秒"
    forbidden_reason: "未说明存在旧版 30 秒的冲突"
    判定: FAIL - 隐藏了冲突
  
  # 错误答案 2: 平均或折中
  - answer: "接口回调超时建议 30-60 秒"
    forbidden_reason: "人为折中，掩盖了明确的版本差异"
    判定: FAIL
  
  # 正确答案 1: 明确说明冲突
  - answer: "文档存在冲突：旧版规定 30 秒，新版修改为 60 秒"
    判定: PASS
  
  # 正确答案 2: 选择新版并说明
  - answer: "当前版本规定 60 秒（新版），旧版曾规定 30 秒"
    判定: PASS - 选择了权威来源并说明历史
  
  # 正确答案 3: 列出冲突，让用户决定
  - answer: "发现两个版本：\n- 旧版：30 秒\n- 新版：60 秒\n建议以新版为准"
    判定: PASS - 最透明的方式

expected_behavior:
  must_do_one:
    - 明确说明存在冲突
    - 选择权威来源并说明理由
    - 列出所有冲突值和来源
  must_not:
    - 只返回一个值不说明冲突
    - 人为平均或折中
    - 隐藏任何一方的信息

判定方式: code + manual
conflict_detection:
  - 相同问题有不同答案
  - 来源可追溯（文档 ID/版本）
  - 答案必须处理冲突
```

---

## 步骤 3: 提取干扰上下文设计

### RGB 的干扰类型

```yaml
# RGB 干扰上下文分类

distractor_types:
  
  1. similar_topic_wrong_focus:
    示例:
      query: "What are the side effects?"
      relevant: "Drug A side effects: nausea, headache"
      distractor: "Drug A benefits: improved sleep, reduced pain"
    适配: 任务A日期 vs 任务A进度
  
  2. similar_entity_type:
    示例:
      query: "Population of Paris?"
      relevant: "Paris population: 2.1M"
      distractor: "London population: 9M"
    适配: 任务A vs 任务B
  
  3. keyword_match_wrong_context:
    示例:
      query: "project deadline"
      relevant: "Project A deadline: 2026-08-30"
      distractor: "Met the deadline for Project B last month"
    适配: 不同时态、不同项目的相似表述
```

### 适配干扰文档到任务 A

```yaml
case_id: KBV1-R-027
category: distractor_context
priority: P0

query: "任务 A 什么时候截止？"
input_documents:
  - KBV1-DOC-01:  # 相关文档
      content: "任务 A 截止日期为 2026-08-30"
      relevance: 2
  
  - KBV1-DOC-DISTRACTOR-03:  # 干扰文档（过去时态）
      content: "任务 A 在 2026-08-15 完成了需求评审"
      relevance: 0
      why_distractor: "包含'任务A'和日期，但是过去事件，不是截止日期"
  
  - KBV1-DOC-DISTRACTOR-04:  # 干扰文档（其他任务）
      content: "任务 B 截止日期为 2026-09-15"
      relevance: 0
      why_distractor: "包含'截止日期'，但是任务B"

must_retrieve: [KBV1-DOC-01]
must_not_retrieve: [KBV1-DOC-DISTRACTOR-03, KBV1-DOC-DISTRACTOR-04]

expected_answer: "2026-08-30"
forbidden_answers:
  - "2026-08-15"  # 误用过去事件日期
  - "2026-09-15"  # 误用其他任务日期

test_dimensions:
  - 时态区分（截止 vs 已完成）
  - 实体消歧（任务A vs 任务B）
  - 关键词不足以确定答案
```

---

## 步骤 4: 提取反事实文档设计

### RGB 的反事实测试

```yaml
# RGB 反事实文档（Counterfactual）

counterfactual_pattern:
  original_fact: "The capital of France is Paris"
  counterfactual: "In this alternate universe, the capital of France is Lyon"
  query: "What is the capital of France?"
  expected: 模型应该基于给定上下文回答"Lyon"，不用记忆中的"Paris"
```

### 适配到任务 A（不推荐全量使用）

```yaml
case_id: KBV1-R-028
category: counterfactual
priority: P2  # 降低优先级

说明: |
  反事实文档在公开知识测试中有用（测试是否依赖记忆而非上下文）
  但在企业私有文档场景中价值有限：
  - 企业文档本身就是私有的，模型不太可能有记忆
  - 反事实容易与"错误信息"混淆
  - 更应该测试"当文档错误时是否照搬"

替代测试: 测试模型是否过度依赖常识

query: "任务 A 的负责人是谁？"
input_documents:
  - KBV1-DOC-01:
      content: "任务 A 负责人是张三"

test_scenario:
  # 不创建反事实文档，而是测试：
  # 如果文档说"张三"，即使用户询问时暗示是"李四"，也应该回答"张三"
  
  misleading_query: "李四负责的任务 A 进展如何？"
  correct_behavior: "纠正错误：任务 A 负责人是张三，不是李四"
  incorrect_behavior: "顺着错误假设回答"

# 结论：企业场景不需要大量反事实文档，更需要测试纠错能力
```

---

## 步骤 5: 创建组合测试场景

### 干扰 + 无答案组合

```yaml
case_id: KBV1-R-029
category: distractor_plus_absence
priority: P1

query: "任务 A 的客户联系方式是什么？"
input_documents:
  - KBV1-DOC-01:  # 相关但没有联系方式
      content: "任务 A 截止日期 2026-08-30..."
  
  - KBV1-DOC-DISTRACTOR-05:  # 干扰：其他联系方式
      content: "项目组联系邮箱：team@company.com"

answerability: unanswerable
reason: "文档未提供客户联系方式"

# 测试答案
test_answers:
  
  # 错误答案 1: 误用干扰信息
  - answer: "客户联系方式是 team@company.com"
    forbidden_reason: "这是项目组邮箱，不是客户联系方式"
    判定: FAIL
  
  # 错误答案 2: 编造
  - answer: "客户联系方式未在文档中提供，但通常可以联系销售部门获取"
    forbidden_reason: "添加了文档未提及的建议"
    判定: FAIL
  
  # 正确答案
  - answer: "文档未提供客户联系方式"
    判定: PASS

test_focus: "有干扰信息时，仍能正确拒答"
```

### 模糊 + 冲突组合

```yaml
case_id: KBV1-R-030
category: ambiguous_plus_conflicting
priority: P1

# 创建测试文档
document_ambiguous_conflict:
  - doc_1: "任务进展顺利，预计不久完成"
  - doc_2: "目前遇到一些阻碍，可能需要延期"

query: "任务 A 能按时完成吗？"
answerability: unanswerable
reason: "信息既模糊（'不久'、'一些阻碍'）又冲突（顺利 vs 阻碍）"

expected_answer_structure:
  - 识别冲突: "文档存在矛盾表述"
  - 说明模糊: "'不久'和'一些阻碍'都不够具体"
  - 拒答: "无法基于当前信息判断"

test_focus: "复杂场景的正确处理"
```

---

## 步骤 6: 记录提取过程

```yaml
extraction_record:
  source: "RGB (Retrieval-Augmented Generation Benchmark)"
  extraction_date: "2026-09-03"
  extractor: "AI 应用测试工程师"
  
  what_extracted:
    unanswerable_types:
      - absence_of_info: 信息缺失
      - ambiguous: 信息模糊
      - conflicting: 信息冲突
    
    distractor_patterns:
      - similar_topic_wrong_focus
      - similar_entity_type
      - keyword_match_wrong_context
    
    counterfactual:
      - 理解概念，但降低优先级
      - 企业场景更需要纠错能力测试
  
  what_created:
    new_cases: 7
      - KBV1-R-024/A-026: absence (预算)
      - KBV1-R-025/A-027: ambiguous (模糊日期)
      - KBV1-R-026/A-028: conflicting (版本冲突)
      - KBV1-R-027: distractor (时态+实体)
      - KBV1-R-028: counterfactual (降低优先级)
      - KBV1-R-029: distractor+absence 组合
      - KBV1-R-030: ambiguous+conflicting 组合
    
    new_documents: 4
      - KBV1-DOC-AMBIGUOUS-01: 模糊表述文档
      - KBV1-DOC-DISTRACTOR-03: 过去时态干扰
      - KBV1-DOC-DISTRACTOR-04: 其他实体干扰
      - KBV1-DOC-DISTRACTOR-05: 相似但不同信息
  
  what_not_used:
    - RGB 公开问答对
    - 评分模型
    - 反事实文档（大量）
  
  adaptation_notes:
    - 保留：三种无答案分类
    - 保留：干扰文档设计模式
    - 改变：从公开知识 → 企业文档
    - 降级：反事实文档（企业场景价值有限）
    - 新增：组合场景测试
  
  files_updated:
    - test-datasets/retrieval/golden-queries-v1.yaml (新增 7 条)
    - test-datasets/answer/trust-golden-v1.yaml (新增 3 条拒答)
    - test-datasets/corpus/ (新增 4 份干扰/模糊文档)
    - test-datasets/sources/registry.md (更新 RGB 行)
```

---

## 📊 提取成果

### 新增用例统计

```yaml
new_cases_summary:
  total: 7 retrieval + 3 answer = 10
  p0: 6
  p1: 3
  p2: 1
  
  coverage:
    - 信息缺失拒答（预算、联系方式）
    - 信息模糊拒答（'很快'、'顺利'）
    - 信息冲突处理（版本新旧）
    - 干扰文档测试（时态、实体、关键词）
    - 组合场景（干扰+缺失、模糊+冲突）
  
  detection_methods:
    - 代码判定: 冲突检测、关键词不存在
    - Rubric: 模糊性识别、拒答质量
    - Manual: 组合场景、冲突处理方式
```

### 拒答质量标准

```yaml
refusal_quality_levels:
  
  excellent:
    - 明确说明无答案原因
    - 区分"缺失"、"模糊"、"冲突"
    - 提供可用的相关信息
    example: "文档未提供预算信息。可用信息包括截止日期、完成度等。"
  
  good:
    - 明确说明无答案
    - 说明原因
    example: "文档未提供客户联系方式"
  
  acceptable:
    - 说明无答案
    example: "无法回答"
  
  poor:
    - 编造答案
    - 用常识推测
    - 强行解读模糊信息
```

---

## ⏱️ 实际用时

```yaml
time_breakdown:
  步骤1_理解RGB: 15 min
  步骤2_适配无答案: 40 min
  步骤3_干扰文档: 20 min
  步骤4_反事实评估: 10 min
  步骤5_组合场景: 20 min
  步骤6_记录过程: 15 min
  
  total: 120 min (2 hours)
```

---

## ✅ 检查清单

完成后确认：
- [x] 已填写 sources/registry.md
- [x] 保留了 RGB 的出处信息
- [x] 三种无答案场景都有用例
- [x] 干扰文档设计清晰
- [x] 反事实文档评估（降低优先级）
- [x] 创建了组合场景
- [x] 更新了用例文件
- [x] 记录了提取过程

---

## 🎯 关键收获

### 三种无答案的区别

| 类型 | 特征 | 正确处理 | 错误处理 |
|------|------|---------|---------|
| Absence | 完全没有 | 明确说明缺失 | 编造答案 |
| Ambiguous | 太模糊 | 说明不够具体 | 强行解读 |
| Conflicting | 互相矛盾 | 说明冲突或选择权威 | 隐藏冲突 |

### 干扰文档的价值

**测试模型是否能精确定位答案，而非被相似信息误导**
- 时态干扰：已完成 vs 截止日期
- 实体干扰：任务A vs 任务B
- 关键词干扰：包含查询词但语境不同

### 拒答是能力不是缺陷

**好的 RAG 系统应该**：
- ✅ 有答案时准确回答
- ✅ 无答案时明确拒答
- ❌ 不编造、不推测、不用常识补全

---

**已完成三个主要开源资源提取示例**:
1. ✅ BEIR (检索基准) - 干扰文档
2. ✅ RAGTruth (答案可信度) - 幻觉检测
3. ✅ RGB (拒答鲁棒性) - 无答案场景

**下一步**: 根据实际需求选择 TAT-QA、CRUD-RAG 或 DocLayNet

---

版本: kb-v1-rgb-extraction-example-2026-09-03  
维护者: AI 应用测试工程师
