# DocLayNet 提取实战示例：文档结构与 Parser 质量

> **示例状态**：以下内容是将 DocLayNet 的结构标签和检查思路适配到企业文档的教学示例，不是官方标注数据的复制；不应据此宣称 OCR、版面或 BBox 能力已经通过。

> 从 DocLayNet 提取文档结构标注方法并适配到任务 A
> 完成时间：约 1.5-2 小时

---

## 📋 提取目标

从 DocLayNet (Document Layout Analysis Dataset) 提取：
- 文档元素分类体系
- 结构层级表示方法
- Parser 质量检查点

**不提取**：
- ❌ 精确 Bbox 坐标（除非产品承诺）
- ❌ OCR 数据（若产品只处理文本层）
- ❌ 科学论文特定结构

---

## 步骤 1: 理解 DocLayNet 的文档元素分类

### DocLayNet 的元素类型

```yaml
# DocLayNet 文档元素分类（简化）

document_elements:
  
  text_elements:
    - title: 文档标题
    - section_heading: 章节标题
    - paragraph: 正文段落
    - list_item: 列表项
    - caption: 图表标题
  
  non_text_elements:
    - table: 表格
    - figure: 图片/图表
    - formula: 数学公式
  
  structural_elements:
    - header: 页眉
    - footer: 页脚
    - page_number: 页码
  
  metadata_elements:
    - author: 作者
    - date: 日期
    - document_info: 文档信息
```

### 提取的核心测试维度

```yaml
parser_quality_dimensions:
  
  1. element_classification:
    name: "元素分类准确性"
    test: "标题是否被识别为标题，而非普通段落"
  
  2. hierarchy_preservation:
    name: "层级关系保留"
    test: "能否保留标题-子标题-段落的嵌套关系"
  
  3. reading_order:
    name: "阅读顺序正确"
    test: "双栏布局时，顺序是否符合人类阅读习惯"
  
  4. table_structure:
    name: "表格结构完整"
    test: "表格是否保留行列结构，而非打散成纯文本"
  
  5. noise_filtering:
    name: "噪音过滤"
    test: "页眉页脚是否正确识别并处理"
```

---

## 步骤 2: 适配文档元素分类测试

### 用例 1: 标题层级识别

```yaml
case_id: KBV1-PARSER-001
category: hierarchy_preservation
priority: P0

test_document:
  id: KBV1-DOC-HIERARCHY-01
  content: |
    # 项目 A 说明文档
    
    ## 1. 项目背景
    
    项目 A 旨在实现企业知识库管理...
    
    ### 1.1 业务需求
    
    客户需要一个能够...
    
    ### 1.2 技术选型
    
    我们选择了...
    
    ## 2. 实施计划
    
    项目分为三个阶段...

expected_structure:
  - level: 1 (H1)
    text: "项目 A 说明文档"
    type: document_title
  
  - level: 2 (H2)
    text: "1. 项目背景"
    type: section_heading
    parent: "项目 A 说明文档"
  
  - level: 3 (H3)
    text: "1.1 业务需求"
    type: subsection_heading
    parent: "1. 项目背景"
  
  - level: 3 (H3)
    text: "1.2 技术选型"
    type: subsection_heading
    parent: "1. 项目背景"
  
  - level: 2 (H2)
    text: "2. 实施计划"
    type: section_heading
    parent: "项目 A 说明文档"

test_query: "项目背景部分包含哪些内容？"

expected_behavior:
  - 能识别"1. 项目背景"是章节标题
  - 能识别"1.1"和"1.2"是子章节
  - 能理解层级关系
  - 答案应该包含 1.1 和 1.2 的内容

parser_checks:
  
  check_1_title_not_flatten:
    description: "标题不应与正文混为一谈"
    correct: |
      title: "1. 项目背景"
      content: "项目 A 旨在..."
    
    incorrect: |
      "1. 项目背景 项目 A 旨在实现企业知识库..."
      # 标题和正文连在一起
  
  check_2_hierarchy_preserved:
    description: "子标题应该关联到父标题"
    correct: |
      1. 项目背景
        1.1 业务需求
        1.2 技术选型
    
    incorrect: |
      1. 项目背景
      1.1 业务需求
      1.2 技术选型
      # 全部平级，层级丢失
  
  check_3_numbering_preserved:
    description: "编号应该保留"
    correct: "1. 项目背景"、"1.1 业务需求"
    incorrect: "项目背景"、"业务需求"  # 编号丢失

判定方式: manual + query
判定规则: |
  1. 查询"项目背景包含什么"能正确关联 1.1 和 1.2
  2. 不会把标题当作正文内容
  3. 能理解层级关系
```

### 用例 2: 列表结构保留

```yaml
case_id: KBV1-PARSER-002
category: list_structure_preservation
priority: P0

test_document:
  id: KBV1-DOC-LIST-01
  content: |
    ## 任务 A 的交付物
    
    项目需要交付以下内容：
    
    1. 需求文档
    2. 接口设计文档
    3. 测试报告
    
    其中需求文档包括：
    - 业务需求
    - 功能需求
    - 非功能需求

expected_structure:
  
  ordered_list:
    - "1. 需求文档"
    - "2. 接口设计文档"
    - "3. 测试报告"
    type: numbered_list
  
  unordered_list:
    - "业务需求"
    - "功能需求"
    - "非功能需求"
    type: bullet_list

test_query: "任务 A 需要交付哪些文档？"

expected_answer: "需求文档、接口设计文档、测试报告"

parser_checks:
  
  check_1_list_not_merged:
    description: "列表项不应合并成一段"
    correct: |
      - 需求文档
      - 接口设计文档
      - 测试报告
    
    incorrect: |
      "需求文档、接口设计文档、测试报告"
      # 列表变成逗号分隔的一句话
  
  check_2_numbering_preserved:
    description: "有序列表编号应保留"
    correct: "1. 需求文档"、"2. 接口设计文档"
    incorrect: "需求文档"、"接口设计文档"
  
  check_3_nested_list:
    description: "嵌套列表应保留层级"
    correct: |
      1. 需求文档
         - 业务需求
         - 功能需求
    
    incorrect: |
      1. 需求文档
      - 业务需求
      - 功能需求
      # 嵌套关系丢失

判定方式: query + structure_check
判定规则: |
  1. 查询能返回所有列表项
  2. 列表项的顺序和编号保留
  3. 嵌套列表的层级关系清晰
```

---

## 步骤 3: 适配阅读顺序测试

### 用例 3: 单栏文档阅读顺序

```yaml
case_id: KBV1-PARSER-003
category: reading_order
priority: P0

test_document:
  id: KBV1-DOC-ORDER-01
  content: |
    项目 A 概述
    
    这是第一段正文。
    
    重要提示框：
    注意事项：需要在 08-30 前完成
    
    这是第二段正文。

expected_reading_order:
  1. "项目 A 概述" (标题)
  2. "这是第一段正文。" (段落1)
  3. "重要提示框..." (提示框)
  4. "这是第二段正文。" (段落2)

test_query: "文档按顺序说了什么？"

expected_behavior:
  - 按照从上到下的顺序理解内容
  - 提示框不应被跳过或放在最后
  - 不应打乱顺序

parser_checks:
  
  check_correct_order:
    description: "内容按文档出现顺序排列"
    correct: "段落1 → 提示框 → 段落2"
    incorrect: "段落1 → 段落2 → 提示框"  # 提示框被移到最后
  
  check_no_duplication:
    description: "内容不应重复"
    incorrect: "段落1 出现两次"

判定方式: manual + sequence_check
```

### 用例 4: 双栏布局（如果存在）

```yaml
case_id: KBV1-PARSER-004
category: reading_order_complex
priority: P1

test_document:
  id: KBV1-DOC-TWOCOL-01
  layout: two_column
  content: |
    [左栏]                [右栏]
    第一段左栏内容        第一段右栏内容
    第二段左栏内容        第二段右栏内容

expected_reading_order:
  option_A_column_first: 
    - 左栏所有内容 → 右栏所有内容
  
  option_B_row_first:
    - 第一段左栏 → 第一段右栏 → 第二段左栏 → 第二段右栏

acceptable: "根据文档类型，两种都可以，但需要一致"

parser_checks:
  check_not_interleaved_randomly:
    description: "不应随机交错"
    incorrect: "左1 → 右2 → 左2 → 右1"  # 混乱

判定方式: manual
判定标准: "阅读顺序符合人类习惯"

注: 若产品只处理单栏文档，可跳过此用例
```

---

## 步骤 4: 适配表格结构测试（已在 TAT-QA 中）

### 用例 5: 表格不被打散（引用 TAT-QA）

```yaml
case_id: KBV1-PARSER-005
category: table_structure
priority: P0

reference: "详见 tatqa-extraction-example.md 的 check_5"

简化测试:
  original_table: |
    | 负责人 | 交付物 |
    |--------|--------|
    | 张三   | 需求   |
    | 李四   | 接口   |
  
  correct_parsing:
    type: table
    headers: ["负责人", "交付物"]
    rows: [["张三", "需求"], ["李四", "接口"]]
  
  incorrect_parsing:
    type: text
    content: "负责人 张三 交付物 需求 负责人 李四 交付物 接口"
    # 表格被打散成纯文本

test_query: "李四负责什么？"
expected: "接口"
如果表格被打散: 可能无法定位到"李四"对应的"接口"

判定方式: query + structure_inspection
重要性: P0 - 表格是企业文档的核心结构
```

---

## 步骤 5: 适配噪音过滤测试

### 用例 6: 页眉页脚识别

```yaml
case_id: KBV1-PARSER-006
category: noise_filtering
priority: P1

test_document:
  id: KBV1-DOC-NOISE-01
  content: |
    【页眉】项目 A 说明文档 v1.0                 Page 1
    
    ## 项目背景
    
    项目 A 旨在...
    
    【页脚】公司机密 - 仅供内部使用          2026-08-30

expected_behavior:
  - 页眉: "项目 A 说明文档 v1.0" → 可保留或过滤
  - 页码: "Page 1" → 应该识别为页码
  - 页脚: "公司机密..." → 可保留或过滤
  - 正文: "项目 A 旨在..." → 必须保留

test_query: "文档说了什么？"

acceptable_answers:
  - 只包含正文内容
  - 包含正文 + 页眉（若有语义价值）

forbidden_behaviors:
  - 丢失正文内容
  - 把页眉/页脚当作正文重复出现在每个 chunk

parser_checks:
  
  check_1_footer_not_repeated:
    description: "页脚不应在每页都作为正文"
    scenario: "多页文档，每页都有相同页脚"
    correct: "页脚识别为元数据，不重复索引"
    incorrect: "页脚在每个 chunk 都出现，导致无意义重复"
  
  check_2_page_number_handled:
    description: "页码应该识别为结构元素"
    correct: "页码可作为 citation 的定位信息"
    incorrect: "页码混入正文，导致'Page 1 项目 A 旨在...'"

判定方式: manual + repetition_check
判定标准: "噪音不干扰正文理解，不造成无意义重复"
```

### 用例 7: 水印和装饰元素

```yaml
case_id: KBV1-PARSER-007
category: noise_filtering
priority: P2

test_document:
  id: KBV1-DOC-WATERMARK-01
  content: |
    [水印: DRAFT - 草稿版本]
    
    项目 A 说明
    
    这是正文内容...

expected_behavior:
  - 水印: 识别为元数据或过滤
  - 正文: 完整保留

test_query: "文档内容是什么？"

expected: "项目 A 说明，正文内容..."
forbidden: 答案中重复出现"DRAFT"或水印文字

判定方式: manual
判定标准: "水印不干扰内容理解"

注: 若产品只处理纯文本（无水印），可跳过
```

---

## 步骤 6: 创建 Parser 质量检查清单

### 综合检查清单

```yaml
parser_quality_checklist:
  
  # ============================================================
  # 必须通过（P0）
  # ============================================================
  
  P0_checks:
    
    1. 标题层级保留:
      test_case: KBV1-PARSER-001
      check: "H1/H2/H3 能够区分，父子关系明确"
      failure_impact: "无法理解文档结构"
    
    2. 列表结构保留:
      test_case: KBV1-PARSER-002
      check: "列表项不合并，编号/符号保留"
      failure_impact: "列表内容被打散"
    
    3. 阅读顺序正确:
      test_case: KBV1-PARSER-003
      check: "从上到下，内容不乱序"
      failure_impact: "因果颠倒、逻辑混乱"
    
    4. 表格结构完整:
      test_case: KBV1-PARSER-005 (TAT-QA)
      check: "表格不被打散成纯文本"
      failure_impact: "表格查询失败"
    
    5. 段落边界正确:
      test_case: (可扩展)
      check: "段落不混成一大段，也不过度拆分"
      failure_impact: "上下文断裂"
  
  # ============================================================
  # 建议通过（P1）
  # ============================================================
  
  P1_checks:
    
    6. 页眉页脚识别:
      test_case: KBV1-PARSER-006
      check: "页眉页脚不重复出现在每个 chunk"
      failure_impact: "噪音干扰、无意义重复"
    
    7. 编号保留:
      test_case: KBV1-PARSER-001, 002
      check: "标题和列表的编号保留"
      failure_impact: "顺序不清、引用困难"
    
    8. 双栏/复杂布局:
      test_case: KBV1-PARSER-004
      check: "复杂布局的阅读顺序合理"
      failure_impact: "内容交错混乱"
  
  # ============================================================
  # 可选（P2）
  # ============================================================
  
  P2_checks:
    
    9. 水印过滤:
      test_case: KBV1-PARSER-007
      check: "水印不干扰正文"
      failure_impact: "轻微噪音"
    
    10. 图表标题关联:
      test_case: (可扩展)
      check: "图表标题与图表内容关联"
      failure_impact: "上下文断裂"
```

### Parser 证据收集方法

```yaml
evidence_collection:
  
  method_1_chunk_inspection:
    name: "Chunk 导出检查"
    requirement: "产品能导出 chunk 内容"
    procedure: |
      1. 上传测试文档
      2. 导出所有 chunks
      3. 检查每个 chunk:
         - 标题是否被识别
         - 表格结构是否保留
         - 列表项是否完整
         - 顺序是否正确
    
    limitation: "需要产品提供 chunk 导出功能"
  
  method_2_query_based:
    name: "查询反推 Parser 质量"
    requirement: "无特殊要求"
    procedure: |
      1. 设计特定查询（如"李四负责什么"）
      2. 观察答案是否正确
      3. 如果答案错误，可能是:
         - 检索失败（算法问题）
         - Parser 失败（结构丢失）
      4. 通过多个查询交叉验证
    
    limitation: "无法直接看到 chunk 内容，只能间接推断"
  
  method_3_citation_inspection:
    name: "引用位置检查"
    requirement: "产品提供 citation 功能"
    procedure: |
      1. 查询并获取答案
      2. 检查 citation:
         - 是否指向正确的文档
         - 是否指向正确的段落/页码
         - 引用片段是否完整
      3. 如果 citation 位置错误，可能是 Parser 问题
    
    limitation: "依赖产品 citation 实现质量"

recommendation:
  - 优先使用 method_1（如果产品支持）
  - 否则用 method_2 + method_3 组合
  - 明确标注"Parser 质量检查依赖产品能力"
```

---

## 步骤 7: 记录提取过程

```yaml
extraction_record:
  source: "DocLayNet (Document Layout Analysis)"
  extraction_date: "2026-09-03"
  extractor: "AI 应用测试工程师"
  
  what_extracted:
    element_types:
      - title, section_heading, paragraph
      - list_item (ordered/unordered)
      - table, figure
      - header, footer, page_number
    
    quality_dimensions:
      - 元素分类准确性
      - 层级关系保留
      - 阅读顺序正确
      - 表格结构完整
      - 噪音过滤
    
    check_methods:
      - Chunk 导出检查（理想，需产品能力）
      - 查询反推（通用）
      - 引用位置检查（需 citation 功能）
  
  what_created:
    new_cases: 7
      - KBV1-PARSER-001: 标题层级识别
      - KBV1-PARSER-002: 列表结构保留
      - KBV1-PARSER-003: 单栏阅读顺序
      - KBV1-PARSER-004: 双栏布局（可选）
      - KBV1-PARSER-005: 表格不被打散（引用TAT-QA）
      - KBV1-PARSER-006: 页眉页脚识别
      - KBV1-PARSER-007: 水印过滤（可选）
    
    checklists: 1
      - Parser 质量综合检查清单（10 项）
  
  what_not_used:
    - 精确 Bbox 坐标（除非产品承诺）
    - OCR 测试（若产品只处理文本层）
    - 科学论文特定结构（LaTeX 公式等）
  
  adaptation_notes:
    - 保留：元素分类体系
    - 保留：层级关系检查
    - 保留：阅读顺序检查
    - 简化：不要求精确 Bbox
    - 改变：从科学论文 → 企业文档
    - 新增：证据收集方法（3 种）
  
  files_updated:
    - test-datasets/corpus/README.md (新增 Parser 检查清单)
    - test-datasets/GAPS.md (更新缺口 5: Parser 证据)
    - test-datasets/sources/registry.md (更新 DocLayNet 行)
  
  product_dependencies_identified:
    - "Chunk 导出能力（理想）"
    - "Citation 功能（用于位置验证）"
    - "支持的文档格式（PDF/DOCX 的 Parser 质量不同）"
```

---

## 📊 提取成果

### 新增用例统计

```yaml
new_cases_summary:
  total: 7 (+ 1 检查清单)
  p0: 4
  p1: 2
  p2: 1
  
  coverage:
    - 标题层级识别
    - 列表结构保留
    - 阅读顺序正确
    - 表格结构完整（引用 TAT-QA）
    - 页眉页脚过滤
    - 水印处理（可选）
  
  detection_methods:
    - Chunk 导出检查（需产品能力）⚠️
    - 查询反推（通用）✅
    - 引用位置检查（需 citation）⚠️
  
  product_dependencies: 2 项
    - Chunk 导出（理想）
    - Citation 功能（辅助）
```

### Parser 质量的重要性

```yaml
why_parser_matters:
  
  for_retrieval:
    - 标题丢失 → 无法理解章节范围
    - 表格打散 → 无法定位单元格
    - 顺序混乱 → 因果颠倒
  
  for_answer:
    - 列表合并 → 答案不完整
    - 层级丢失 → 无法理解从属关系
    - 噪音混入 → 答案包含页眉页脚
  
  for_citation:
    - 结构丢失 → 无法准确定位
    - 页码错误 → 引用无法验证

conclusion:
  "Parser 是 RAG 的基础设施"
  "Parser 失败 → 后续所有层都失败"
  "必须单独验证 Parser 质量"
```

---

## ⏱️ 实际用时

```yaml
time_breakdown:
  步骤1_理解DocLayNet: 15 min
  步骤2_元素分类适配: 30 min
  步骤3_阅读顺序: 20 min
  步骤4_表格引用TAT-QA: 10 min
  步骤5_噪音过滤: 20 min
  步骤6_检查清单: 25 min
  步骤7_记录过程: 10 min
  
  total: 130 min (2.2 hours)
```

---

## ✅ 检查清单

完成后确认：
- [x] 已填写 sources/registry.md
- [x] 保留了 DocLayNet 的出处信息
- [x] 元素分类清晰
- [x] 层级关系检查完整
- [x] 阅读顺序测试覆盖
- [x] Parser 质量检查清单完整
- [x] 证据收集方法明确 ⚠️
- [x] 明确标注产品依赖
- [x] 更新了相关文件
- [x] 记录了提取过程

---

## 🎯 关键收获

### Parser 测试的三层方法

| 方法 | 优点 | 缺点 | 依赖 |
|------|------|------|------|
| **Chunk 导出** | 直接看到结构 | 需产品能力 | 导出功能 |
| **查询反推** | 通用 | 间接推断 | 无 |
| **Citation 检查** | 位置精确 | 需 citation | Citation 功能 |

**推荐策略**：
- 有 Chunk 导出 → 优先用导出检查
- 无导出 → 用查询反推 + Citation 组合
- 明确标注依赖项，不假设产品能力

### Parser 失败的常见模式

```yaml
common_parser_failures:
  
  1. 表格被打散:
    symptom: "查询表格字段失败"
    root_cause: "表格被识别为纯文本"
    fix: "改进 Parser 表格识别"
  
  2. 标题与正文混淆:
    symptom: "无法理解章节范围"
    root_cause: "标题未被识别为标题"
    fix: "改进标题检测（字体/位置）"
  
  3. 列表项合并:
    symptom: "列表内容丢失或不完整"
    root_cause: "列表被合并成一段"
    fix: "保留列表结构"
  
  4. 页眉页脚重复:
    symptom: "每个 chunk 都有相同页脚"
    root_cause: "未识别为结构元素"
    fix: "过滤或标记为元数据"
```

### 企业文档 vs 科学论文

```yaml
differences:
  
  enterprise_docs:
    focus:
      - 标题层级（H1-H3）
      - 表格（项目跟踪表）
      - 列表（交付物清单）
      - 会议纪要格式
    
    can_skip:
      - LaTeX 公式
      - 参考文献格式
      - 作者/机构信息
  
  scientific_papers:
    focus:
      - 数学公式
      - 图表标题
      - 参考文献
      - 多栏复杂布局
    
    less_important:
      - 业务表格
      - 项目列表
```

---

## 🎉 完成全部 6 个开源资源提取示例！

1. ✅ **BEIR** (检索基准) - 干扰文档、qrels
2. ✅ **RAGTruth** (答案可信度) - 幻觉检测、span 标注
3. ✅ **RGB** (拒答鲁棒性) - 无答案场景、反事实
4. ✅ **TAT-QA** (表格理解) - 表格查询、表格+文本联合
5. ✅ **CRUD-RAG** (生命周期) - 幽灵数据、旧版残留
6. ✅ **DocLayNet** (文档结构) - Parser 质量、结构保留 ⭐

**总计提取时间**: ~14-16 小时（6 个资源）  
**可新增用例**: 40-50 条（基于提取的模式）  
**实战价值**: 每个示例都有完整流程和时间估算

---

版本: kb-v1-doclaynet-extraction-example-2026-09-03  
维护者: AI 应用测试工程师

**🎊 开源资源提取指南 v2.0 完整交付！**
