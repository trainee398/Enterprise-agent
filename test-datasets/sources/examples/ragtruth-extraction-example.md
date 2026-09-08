# RAGTruth 提取实战示例：幻觉检测与接地性

> 后续方法资料（2026-09-08）：本文保留开源/RAG 预研内容，不是当前文档管理一期的必做任务，也不代表已下载官方数据或通过产品测试。当前范围见[范围记录](../../../docs/00-知识库一期范围与待确认事项.md)。

> 从 RAGTruth 提取幻觉分类并适配到任务 A
> 完成时间：约 2-3 小时

---

## 📋 提取目标

从 RAGTruth 提取：
- 幻觉四分类体系
- Span-level 标注方法
- Claim 拆解思路

**不提取**：
- ❌ 公开语料内容
- ❌ 模型评分结果
- ❌ 英文样例

---

## 步骤 1: 理解 RAGTruth 的幻觉分类

### RAGTruth 的四种幻觉类型

```yaml
# RAGTruth 真实分类（简化说明）

hallucination_types:
  
  1. contradictory:
    定义: "答案与上下文明确矛盾"
    示例:
      context: "The capital of France is Paris."
      answer: "The capital of France is London."
      标注: contradictory - 直接矛盾
  
  2. extrapolatory:
    定义: "答案超出上下文范围，进行了无依据推断"
    示例:
      context: "Sales increased by 10% in Q1."
      answer: "Sales increased by 10% in Q1, likely due to new marketing campaigns."
      标注: extrapolatory - "likely due to..."无依据
  
  3. unverifiable:
    定义: "答案无法从上下文验证，既不矛盾也不直接支持"
    示例:
      context: "Project A has 5 open issues."
      answer: "Project A will complete on time."
      标注: unverifiable - 无法从issues数量推断是否按时完成
  
  4. irrelevant:
    定义: "答案与问题无关，即使事实正确"
    示例:
      query: "When is the deadline?"
      answer: "The project manager is John."
      标注: irrelevant - 答非所问
```

### 提取的关键设计模式

```yaml
pattern_1_contradictory:
  特征: "直接数值/日期/人名与文档冲突"
  检测方式: "代码判定 - 精确匹配"
  严重度: "P0 - 必须检出"
  
pattern_2_extrapolatory:
  特征: "添加了'可能'、'根据推测'、'估计'等无依据推断"
  检测方式: "关键词匹配 + Rubric"
  严重度: "P0 - 必须检出"

pattern_3_unverifiable:
  特征: "陈述的内容文档完全未提及"
  检测方式: "证据链检查 - 每个断言必须有对应span"
  严重度: "P0 - 必须检出"

pattern_4_irrelevant:
  特征: "答案正确但不回答问题"
  检测方式: "问题-答案语义匹配"
  严重度: "P1 - 体验问题"
```

---

## 步骤 2: 提取 Span-level 标注方法

### RAGTruth 的 Span 标注格式

```json
// RAGTruth 原始格式（简化）
{
  "answer": "The capital of France is London, with a population of 9 million.",
  "groundedness_annotations": [
    {
      "span": "The capital of France is London",
      "start": 0,
      "end": 32,
      "evidence": null,
      "label": "contradictory"
    },
    {
      "span": "population of 9 million",
      "start": 44,
      "end": 67,
      "evidence": null,
      "label": "unverifiable"
    }
  ]
}
```

### 适配到项目的格式

```yaml
# 我们项目的 Span-level 检查格式

answer_span_check:
  answer: "任务 A 截止日期为 2026-08-30，负责人是李四，预计按时完成"
  
  span_annotations:
    - span: "任务 A 截止日期为 2026-08-30"
      evidence: KBV1-F-01
      status: grounded
      check_type: code  # 日期精确匹配
    
    - span: "负责人是李四"
      evidence: null
      status: contradictory
      check_type: code
      reason: "真值是张三（F-04）"
      correct_value: "张三"
    
    - span: "预计按时完成"
      evidence: null
      status: extrapolatory
      check_type: rubric
      reason: "文档未提供完成预测"
      forbidden_patterns:
        - "预计.*完成"
        - "可能.*按时"
        - "估计.*"
```

---

## 步骤 3: 适配到任务 A 的具体用例

### 用例 1: Contradictory - 数字矛盾

```yaml
case_id: KBV1-A-021
category: contradictory_hallucination
priority: P0

query: "任务 A 有几个未关闭的 P1？"
input_documents: [KBV1-DOC-01]
ground_truth:
  fact_id: KBV1-F-03
  value: "5 个未关闭 P1"

# 测试各种矛盾答案
test_answers:
  
  # 错误答案 1: 数字错误
  - answer: "任务 A 有 3 个未关闭的 P1"
    groundedness_check:
      - span: "3 个未关闭的 P1"
        evidence: KBV1-F-03
        status: contradictory
        correct_value: "5 个"
    判定: FAIL - 数字矛盾
  
  # 错误答案 2: 混入其他项目
  - answer: "任务 A 有 8 个未关闭的 P1"
    groundedness_check:
      - span: "8 个"
        evidence: null
        status: contradictory
        possible_source: "可能混淆了项目 B 的数据"
    判定: FAIL - 数字矛盾
  
  # 正确答案
  - answer: "任务 A 有 5 个未关闭的 P1"
    groundedness_check:
      - span: "5 个未关闭的 P1"
        evidence: KBV1-F-03
        status: grounded
    判定: PASS

判定方式: code
判定规则: |
  extract_number(answer) == 5
  AND NOT contains(answer, ["约", "左右", "大约"])
```

### 用例 2: Extrapolatory - 无依据推断

```yaml
case_id: KBV1-A-022
category: extrapolatory_hallucination
priority: P0

query: "任务 A 为什么会有这么多 P1 问题？"
input_documents: [KBV1-DOC-01]
ground_truth:
  fact_id: KBV1-F-03
  value: "5 个未关闭 P1"
  note: "文档只陈述数字，未说明原因"

# 测试各种外推答案
test_answers:
  
  # 错误答案 1: 编造原因
  - answer: "任务 A 有 5 个未关闭的 P1，可能是因为需求变更频繁"
    groundedness_check:
      - span: "任务 A 有 5 个未关闭的 P1"
        evidence: KBV1-F-03
        status: grounded
      
      - span: "可能是因为需求变更频繁"
        evidence: null
        status: extrapolatory
        reason: "文档未提供原因"
    判定: FAIL - 无依据推断
  
  # 错误答案 2: 用常识补全
  - answer: "由于项目复杂度高，任务 A 累积了 5 个 P1 问题"
    groundedness_check:
      - span: "由于项目复杂度高"
        evidence: null
        status: extrapolatory
        reason: "用常识推断原因"
    判定: FAIL - 无依据推断
  
  # 正确答案 1: 拒答
  - answer: "文档显示任务 A 有 5 个未关闭的 P1，但未说明原因"
    groundedness_check:
      - span: "任务 A 有 5 个未关闭的 P1"
        evidence: KBV1-F-03
        status: grounded
      
      - span: "但未说明原因"
        status: appropriate_refusal
    判定: PASS
  
  # 正确答案 2: 只答事实
  - answer: "任务 A 有 5 个未关闭的 P1"
    groundedness_check:
      - span: "任务 A 有 5 个未关闭的 P1"
        evidence: KBV1-F-03
        status: grounded
    判定: PASS - 不回答未知信息是正确的

判定方式: rubric + forbidden_patterns
forbidden_patterns:
  - "可能.*因为"
  - "由于.*"
  - "估计.*"
  - "根据.*推测"
  - ".*导致.*"  # 未经验证的因果关系
```

### 用例 3: Unverifiable - 无法验证的断言

```yaml
case_id: KBV1-A-023
category: unverifiable_hallucination
priority: P0

query: "任务 A 能按时完成吗？"
input_documents: [KBV1-DOC-01]
ground_truth:
  available_facts:
    - KBV1-F-01: "截止日期 2026-08-30"
    - KBV1-F-02: "完成度 60%（截至 08-28）"
    - KBV1-F-03: "5 个未关闭 P1"
  unavailable_info: "未来完成预测"

# 测试无法验证的断言
test_answers:
  
  # 错误答案 1: 直接预测
  - answer: "任务 A 能按时完成"
    groundedness_check:
      - span: "能按时完成"
        evidence: null
        status: unverifiable
        reason: "未来预测，文档无法验证"
    判定: FAIL
  
  # 错误答案 2: 基于部分事实的预测
  - answer: "任务 A 目前完成度 60%，应该能按时完成"
    groundedness_check:
      - span: "目前完成度 60%"
        evidence: KBV1-F-02
        status: grounded
      
      - span: "应该能按时完成"
        evidence: null
        status: unverifiable
        reason: "从60%完成度无法推断是否能按时"
    判定: FAIL - 混合正确和无法验证
  
  # 正确答案 1: 只陈述已知事实
  - answer: "任务 A 截止日期 2026-08-30，目前完成度 60%（截至 08-28），还有 5 个未关闭的 P1"
    groundedness_check:
      - span: "截止日期 2026-08-30"
        evidence: KBV1-F-01
        status: grounded
      - span: "完成度 60%（截至 08-28）"
        evidence: KBV1-F-02
        status: grounded
      - span: "5 个未关闭的 P1"
        evidence: KBV1-F-03
        status: grounded
    判定: PASS
  
  # 正确答案 2: 明确说明无法判断
  - answer: "文档提供了截止日期和当前进度，但无法判断是否能按时完成"
    groundedness_check:
      - status: appropriate_refusal
    判定: PASS

判定方式: mixed
判定规则: |
  1. 任何关于未来的断言必须标注 unverifiable
  2. 从"完成度 60%"推断"能/不能完成"都是 unverifiable
  3. 正确做法：只陈述事实或明确拒答
```

### 用例 4: 混合场景 - 部分正确 + 部分幻觉

```yaml
case_id: KBV1-A-024
category: mixed_groundedness
priority: P0

query: "任务 A 的负责人和进度如何？"
input_documents: [KBV1-DOC-01]
ground_truth:
  - KBV1-F-04: "负责人是张三"
  - KBV1-F-02: "完成度 60%（截至 08-28）"

# 测试混合答案
test_answers:
  
  # 危险的混合：正确+错误
  - answer: "任务 A 负责人是张三，目前完成度 80%"
    groundedness_check:
      - span: "负责人是张三"
        evidence: KBV1-F-04
        status: grounded ✅
      
      - span: "完成度 80%"
        evidence: KBV1-F-02
        status: contradictory ❌
        correct_value: "60%"
    
    危险性: HIGH
    原因: "部分正确会增加用户信任，错误部分更容易被接受"
    判定: FAIL - 任何一个断言错误都是FAIL
  
  # 危险的混合：事实+推测
  - answer: "任务 A 负责人是张三，完成度 60%，预计能按时完成"
    groundedness_check:
      - span: "负责人是张三"
        evidence: KBV1-F-04
        status: grounded ✅
      
      - span: "完成度 60%"
        evidence: KBV1-F-02
        status: grounded ✅
      
      - span: "预计能按时完成"
        evidence: null
        status: extrapolatory ❌
    
    危险性: HIGH
    原因: "前两个事实正确，第三个推测更容易被信任"
    判定: FAIL
  
  # 正确答案
  - answer: "任务 A 负责人是张三，完成度 60%（截至 2026-08-28）"
    groundedness_check:
      - span: "负责人是张三"
        evidence: KBV1-F-04
        status: grounded ✅
      
      - span: "完成度 60%（截至 2026-08-28）"
        evidence: KBV1-F-02
        status: grounded ✅
    判定: PASS - 所有断言都有证据支撑

重要原则: "部分正确不能掩盖部分错误，任何一个断言无依据即判FAIL"
```

---

## 步骤 4: 提取 Claim 拆解方法

### RAGTruth 的 Claim-level 拆解

```yaml
# 原始 RAGTruth 方法
complex_answer: "Project A is behind schedule due to resource constraints and will require additional funding."

claims_extracted:
  - claim_1: "Project A is behind schedule"
    verifiable: true
    evidence_required: "schedule status"
  
  - claim_2: "behind schedule due to resource constraints"
    verifiable: false
    reason: "causal relationship requires explicit statement"
  
  - claim_3: "will require additional funding"
    verifiable: false
    reason: "future prediction"
```

### 适配到任务 A

```yaml
case_id: KBV1-A-025
category: claim_decomposition
priority: P1

query: "任务 A 为什么完成度只有 60%？"
input_documents: [KBV1-DOC-01, KBV1-DOC-02, KBV1-DOC-03]

# 测试复杂答案的拆解
test_answer: "任务 A 完成度 60%（截至 08-28），有 5 个未关闭的 P1，其中接口适配被阻塞是因为客户修改了协议"

claim_decomposition:
  
  claim_1:
    text: "任务 A 完成度 60%（截至 08-28）"
    evidence: KBV1-F-02
    status: grounded ✅
    check_type: code
  
  claim_2:
    text: "有 5 个未关闭的 P1"
    evidence: KBV1-F-03
    status: grounded ✅
    check_type: code
  
  claim_3:
    text: "接口适配被阻塞"
    evidence: KBV1-F-06
    status: grounded ✅
    check_type: code
  
  claim_4:
    text: "被阻塞是因为客户修改了协议"
    sub_claims:
      - "接口适配被阻塞" → grounded (F-06) ✅
      - "客户修改了协议" → grounded (F-07) ✅
      - "因为" (因果关系) → 需要验证 ⚠️
    
    evidence_for_causality:
      - F-06: "接口适配状态 Blocked"
      - F-07: "2026-08-20 客户提出修改接口协议"
    
    causality_check:
      - 时间顺序: ✅ 客户修改(08-20) 在前，阻塞在后
      - 明确陈述: ⚠️ 文档未明确说"因为客户修改所以阻塞"
      - 逻辑推断: 可能但未验证
    
    status: unverifiable_causality
    correct_expression:
      - acceptable: "接口适配被阻塞，会议纪要显示客户修改了协议"
      - unacceptable: "被阻塞是因为客户修改了协议"  # 未经证实的因果

判定: PARTIAL_FAIL - 因果关系未经验证

重要原则:
  - 时间顺序 ≠ 因果关系
  - "A发生，B发生" ≠ "A导致B"
  - 除非文档明确说"因为...所以..."，否则不能断言因果
```

---

## 步骤 5: 创建检测规则

### 代码判定规则（优先）

```python
# 伪代码：contradictory 检测

def check_contradictory(answer: str, ground_truth: dict) -> bool:
    """检测数字、日期、人名矛盾"""
    
    # 提取答案中的数字
    answer_numbers = extract_numbers(answer)
    truth_numbers = extract_numbers(ground_truth['value'])
    
    if answer_numbers != truth_numbers:
        return {
            'status': 'contradictory',
            'answer_value': answer_numbers,
            'truth_value': truth_numbers,
            'evidence': ground_truth['fact_id']
        }
    
    # 提取日期
    answer_dates = extract_dates(answer)
    truth_dates = extract_dates(ground_truth['value'])
    
    if answer_dates != truth_dates:
        return {
            'status': 'contradictory',
            'type': 'date_mismatch',
            'answer_value': answer_dates,
            'truth_value': truth_dates
        }
    
    # 提取人名
    answer_names = extract_names(answer)
    truth_names = extract_names(ground_truth['value'])
    
    if answer_names != truth_names:
        return {
            'status': 'contradictory',
            'type': 'name_mismatch',
            'answer_value': answer_names,
            'truth_value': truth_names
        }
    
    return {'status': 'grounded'}
```

### Rubric 判定规则（次选）

```yaml
# extrapolatory_rubric.yaml

name: "无依据推断检测"
version: "1.0"

forbidden_patterns:
  - pattern: "可能.*因为"
    severity: high
    example: "可能是因为需求变更"
  
  - pattern: "(由于|因为)(?!文档|纪要|记录)"
    severity: high
    example: "由于复杂度高" (文档未提及)
  
  - pattern: "预计|估计|大概|约|左右"
    severity: medium
    context: "当用于修饰事实数字时"
    example: "约 60%完成度" (真值是精确60%)
  
  - pattern: ".*会.*|.*将.*"
    severity: high
    context: "当用于未来预测时"
    example: "任务将延期"

check_procedure:
  1. 提取答案中的所有断言
  2. 逐一检查每个断言是否有对应 evidence
  3. 如果包含 forbidden_patterns 但无 evidence → extrapolatory
  4. 如果是因果关系("因为...所以...")，检查文档是否明确陈述
```

---

## 步骤 6: 记录提取过程

```yaml
extraction_record:
  source: "RAGTruth"
  extraction_date: "2026-09-03"
  extractor: "AI 应用测试工程师"
  
  what_extracted:
    classification:
      - contradictory: 与文档矛盾
      - extrapolatory: 无依据推断
      - unverifiable: 无法验证
      - irrelevant: 答非所问 (此项目暂不用)
    
    methods:
      - span-level 标注格式
      - claim 拆解思路
      - 因果关系验证方法
  
  what_created:
    new_cases: 5
      - KBV1-A-021: contradictory (数字矛盾)
      - KBV1-A-022: extrapolatory (无依据推断)
      - KBV1-A-023: unverifiable (无法验证断言)
      - KBV1-A-024: mixed (部分正确+部分幻觉)
      - KBV1-A-025: claim_decomposition (因果关系)
    
    detection_rules:
      - contradictory_detector.py (代码判定)
      - extrapolatory_rubric.yaml (关键词+Rubric)
      - unverifiable_checker.py (证据链检查)
  
  what_not_used:
    - RAGTruth 的公开样例内容
    - 模型评分结果
    - 英文数据
  
  adaptation_notes:
    - 保留：四分类体系和 span标注
    - 保留：claim 拆解方法
    - 改变：从英文医学 → 中文企业项目
    - 改变：从公开知识 → 企业文档
    - 新增：因果关系专门验证
  
  files_updated:
    - test-datasets/answer/trust-golden-v1.yaml (新增 5 条)
    - test-datasets/answer/rubrics/extrapolatory_rubric.yaml (新建)
    - test-datasets/sources/registry.md (更新 RAGTruth 行)
```

---

## 📊 提取成果

### 新增用例统计

```yaml
new_cases_summary:
  total: 5
  p0: 4
  p1: 1
  
  coverage:
    - 数字矛盾（contradictory）
    - 无依据推断（extrapolatory）
    - 无法验证断言（unverifiable）
    - 混合场景（部分正确+部分幻觉）
    - 因果关系验证
  
  detection_methods:
    - 代码判定: 2 个（数字、日期、人名）
    - Rubric: 2 个（推断关键词、因果）
    - Mixed: 1 个（claim 拆解）
```

### 可复用规则

```yaml
reusable_rules:
  
  contradictory_detection:
    - 数字精确匹配
    - 日期精确匹配
    - 人名精确匹配
    - 百分比不可改写
    - 单位不可丢失
  
  extrapolatory_detection:
    - 禁用词: "可能"、"估计"、"预计"
    - 未验证因果: "因为...所以..."
    - 未来预测: "会"、"将"
    - 常识补全: 文档未提及但"大家都知道"
  
  unverifiable_detection:
    - 未来事件断言
    - 从部分信息外推全局
    - 主观判断（"项目质量好"）
    - 无法从现有证据推出的结论
```

---

## ⏱️ 实际用时

```yaml
time_breakdown:
  步骤1_理解RAGTruth: 30 min
  步骤2_提取span标注: 30 min
  步骤3_适配5个用例: 90 min
  步骤4_claim拆解: 20 min
  步骤5_创建规则: 30 min
  步骤6_记录过程: 20 min
  
  total: 220 min (3.7 hours)
```

---

## ✅ 检查清单

完成后确认：
- [x] 已填写 sources/registry.md
- [x] 保留了 RAGTruth 的出处信息
- [x] 明确标注"借鉴分类，不用原数据"
- [x] 新用例基于自建真值
- [x] 四种幻觉类型都有对应用例
- [x] 代码判定优先于 Rubric
- [x] 更新了 answer/trust-golden-v1.yaml
- [x] 记录了提取过程

---

## 🎯 关键收获

### 四分类的实战价值

| 幻觉类型 | 严重度 | 检测方法 | 用户影响 |
|---------|--------|---------|---------|
| Contradictory | 🔴 极高 | 代码 | 直接错误 |
| Extrapolatory | 🔴 高 | Rubric | 误导决策 |
| Unverifiable | 🟡 中 | 证据链 | 无法核实 |
| Irrelevant | 🟢 低 | 语义匹配 | 体验问题 |

### 部分正确的危险性

**最危险的不是全错，而是部分正确 + 部分幻觉**
- 正确部分增加信任
- 错误部分更容易被接受
- 必须：任何一个断言错误都判 FAIL

### Claim 拆解的重要性

**复杂答案必须拆解成原子断言**
- 每个断言独立判定
- 因果关系需要明确证据
- 时间顺序 ≠ 因果关系

---

**下一步**: 用同样方法从 RGB 提取无答案场景（1-2 小时）

---

版本: kb-v1-ragtruth-extraction-example-2026-09-03  
维护者: AI 应用测试工程师
