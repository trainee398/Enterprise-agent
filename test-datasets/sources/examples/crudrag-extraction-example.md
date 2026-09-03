# CRUD-RAG 提取实战示例：生命周期管理

> **示例状态**：以下用例是基于公开项目描述设计的本地适配示例，不是 CRUD-RAG 官方数据的复制或已验证下载结果；正式采用前仍需核对官方版本、许可证和原始 ID。

> 从 CRUD-RAG 提取更新/删除/版本管理模式并适配到任务 A
> 完成时间：约 1-2 小时

---

## 📋 提取目标

从 CRUD-RAG 提取：
- CRUD 四操作测试框架
- 状态时间线设计
- 幽灵数据检测
- 版本冲突处理

**不提取**：
- ❌ 公开业务场景内容
- ❌ 特定数据库实现
- ❌ 复杂事务处理

---

## 步骤 1: 理解 CRUD-RAG 的四操作

### CRUD-RAG 的核心测试维度

```yaml
# CRUD-RAG 四操作（简化说明）

crud_operations:
  
  Create:
    定义: "上传新文档"
    test_focus:
      - 首次上传成功
      - 重复上传行为（覆盖/去重/并存）
      - 元数据正确记录
  
  Read:
    定义: "查询检索"
    test_focus:
      - 新上传文档立即可查
      - 查询结果反映最新状态
      - 缓存一致性
  
  Update:
    定义: "更新已有文档"
    test_focus:
      - 旧版内容是否残留
      - 新版内容是否生效
      - 版本新旧混答
      - Vector DB 是否同步
  
  Delete:
    定义: "删除文档"
    test_focus:
      - 删除后是否仍可检索（幽灵数据）
      - 删除传播（Vector DB, Cache, Index）
      - 软删除 vs 硬删除
      - 删除后重新上传
```

### 提取的关键测试模式

```yaml
pattern_1_ghost_data:
  name: "幽灵数据检测"
  scenario: "删除后仍可检索到已删除内容"
  severity: P0
  impact: "数据泄漏、过期信息误导"

pattern_2_stale_version:
  name: "旧版残留"
  scenario: "更新后旧版内容仍在答案中"
  severity: P0
  impact: "新旧混淆、信息冲突"

pattern_3_propagation:
  name: "删除传播不完整"
  scenario: "Vector DB 删了，但 Cache 未失效"
  severity: P0
  impact: "不同查询看到不一致状态"

pattern_4_version_coexist:
  name: "版本并存策略"
  scenario: "新旧版本应该并存还是替换"
  severity: P0
  impact: "业务语义决定"
```

---

## 步骤 2: 适配 Create - 重复上传测试

### 用例 1: 首次上传

```yaml
case_id: KBV1-LC-001
operation: Create
priority: P0

action: "上传 KBV1-DOC-01.md"
starting_state: "空知识库"

expected_behavior:
  - 上传成功
  - 文档列表显示该文档
  - 状态：处理中 → 可用
  - 可以查询到文档内容

verification_query: "任务 A 的截止日期是什么？"
expected_answer: "2026-08-30"

check_points:
  - ✅ 文档出现在列表
  - ✅ 处理状态正确
  - ✅ 查询可以检索到
  - ✅ 答案正确

判定方式: manual + query
```

### 用例 2: 重复上传同名文件（核心差分点）

```yaml
case_id: KBV1-LC-002
operation: Create (duplicate)
priority: P0

starting_state:
  - 已上传: KBV1-DOC-01.md (v1)
  - 内容: "任务 A 截止日期 2026-08-30"

action: "再次上传同名文件 KBV1-DOC-01.md"
content_same: true  # 内容完全相同

# 测试三种可能行为
possible_behaviors:
  
  behavior_A_replace:
    name: "替换（覆盖）"
    expected:
      - 文档列表仍只有 1 条
      - 更新时间改变
      - upload_id 或 version 递增
    risk: "误操作会丢失旧版"
  
  behavior_B_reject:
    name: "拒绝（去重）"
    expected:
      - 提示"文档已存在"
      - 文档列表仍只有 1 条
      - 不产生新记录
    risk: "无法更新内容"
  
  behavior_C_coexist:
    name: "并存（版本化）"
    expected:
      - 文档列表有 2 条（v1, v2）
      - 或有版本标记
      - 查询返回最新版
    risk: "列表膨胀、版本混乱"

需要产品确认: "V1 采用哪种语义？"

test_method:
  1. 上传 KBV1-DOC-01.md
  2. 等待处理完成
  3. 再次上传同名文件
  4. 观察:
     - 文档列表数量
     - 是否报错或提示
     - 查询结果是否变化
  5. 查询验证内容

判定标准: "行为与产品承诺一致"
```

### 用例 3: 重复上传不同内容（版本测试）

```yaml
case_id: KBV1-LC-003
operation: Create (version conflict)
priority: P0

starting_state:
  - 已上传: KBV1-DOC-07-v1.md
  - 内容: "接口回调超时 30 秒"

action: "上传同名但内容不同的文件"
new_content: "接口回调超时 60 秒"

expected_behavior_options:
  
  option_A_replace:
    - 旧版被新版替换
    - 查询只返回 60 秒
    - 30 秒不再可查
  
  option_B_version:
    - v1 和 v2 并存
    - 查询默认返回 v2 (60秒)
    - 可指定查询 v1 (30秒)
  
  option_C_reject:
    - 提示"内容冲突，请手动处理"
    - 不自动替换

verification_query: "接口回调超时应该设置多久？"

check_after_upload:
  - 查询结果: "60 秒" ✅
  - 不应出现: "30 秒" 或 "30-60 秒" 混答 ❌
  - 旧版处理: 删除 OR 标记为旧版 OR 保留但不检索

需要产品确认:
  - "是否支持版本管理？"
  - "重复上传是覆盖还是并存？"
  - "旧版如何处理？"

判定方式: query + ghost_data_check
```

---

## 步骤 3: 适配 Update - 旧版残留测试

### 用例 4: 更新后查询验证

```yaml
case_id: KBV1-LC-004
operation: Update
priority: P0

initial_state:
  - upload: KBV1-DOC-07-v1.md
  - content: "接口回调超时 30 秒"
  - verify: 查询返回 "30 秒" ✅

update_action:
  - upload: KBV1-DOC-07-v2.md (同名或明确更新操作)
  - new_content: "接口回调超时 60 秒"
  - expected: 替换或创建新版本

verification_after_update:
  
  query_1: "接口回调超时规范是什么？"
  expected_answer: "60 秒"
  forbidden_answers:
    - "30 秒"  # 旧版残留
    - "30 秒或 60 秒"  # 新旧混答
    - "约 30-60 秒"  # 掩盖冲突
  
  query_2: "回调超时之前的规定是多少？"
  acceptable_answers:
    - "文档未提供历史版本"  # 若不支持版本
    - "之前规定 30 秒，现已更新为 60 秒"  # 若支持版本
  
  query_3: "回调超时是 30 秒吗？"  # 对抗性查询
  expected_answer: "否，当前规定是 60 秒"
  forbidden_answer: "是的，30 秒"  # 被旧版误导

ghost_data_check:
  - Top-K 检索: 不应包含旧版 chunks
  - Vector DB: 旧版向量应删除或标记
  - Cache: 应失效
  - 文档列表: 只显示新版或明确标记版本

判定方式: query + vector_db_check
判定规则: |
  1. 所有查询只返回新版内容（60秒）
  2. Top-K 不包含旧版 chunks
  3. 对抗性查询能纠正旧值
```

### 用例 5: 多次更新链

```yaml
case_id: KBV1-LC-005
operation: Update (chain)
priority: P1

update_sequence:
  - v1: "回调超时 30 秒" (2026-08-01)
  - v2: "回调超时 60 秒" (2026-08-15)
  - v3: "回调超时 45 秒" (2026-08-25)

after_v3_uploaded:
  query: "接口回调超时规范"
  expected: "45 秒"
  forbidden: ["30 秒", "60 秒", "30-60 秒", "45-60 秒"]

test_focus: "连续更新后只保留最新版"

check_points:
  - ✅ 查询只返回 v3 (45秒)
  - ✅ v1/v2 不在 Top-K
  - ✅ 不出现版本混答
  - ⚠️ 如果支持版本历史，应能追溯 v1/v2
```

---

## 步骤 4: 适配 Delete - 幽灵数据检测

### 用例 6: 删除后查询验证（核心）

```yaml
case_id: KBV1-LC-006
operation: Delete
priority: P0

initial_state:
  - upload: [KBV1-DOC-01, KBV1-DOC-02]
  - verify: 可查询到"任务 A 截止日期"

delete_action:
  - delete: KBV1-DOC-01
  - expected_propagation:
      vector_db: "删除相关 chunks"
      cache: "失效相关缓存"
      search_index: "移除索引"
      document_list: "不再显示"

verification_after_delete:
  
  query_1: "任务 A 的截止日期是什么？"
  
  acceptable_behaviors:
    - option_A: "文档未提供截止日期信息"  # DOC-01 已删除
    - option_B: "文档未提供"  # DOC-02 没有这个信息
    - option_C: 从 DOC-02 找到其他相关信息（如果有）
  
  forbidden_behaviors:
    - "2026-08-30"  # 幽灵数据：仍返回已删除文档的内容
    - 引用 DOC-01  # 幽灵引用
  
  query_2: "文档列表"
  expected: 只显示 DOC-02
  forbidden: 仍显示 DOC-01

ghost_data_detection:
  - Top-K 检查: 不应包含 DOC-01 的 chunks
  - Citation 检查: 不应引用 DOC-01
  - List 检查: DOC-01 不在文档列表

传播检查点:
  check_1_vector_db:
    method: "查看 Top-K 检索结果"
    pass: "不包含已删除文档的 chunks"
    fail: "仍返回已删除内容"
  
  check_2_cache:
    method: "删除后立即查询 vs 等待缓存过期后查询"
    pass: "两次结果一致（都不返回）"
    fail: "缓存未失效，第一次仍返回旧数据"
  
  check_3_document_list:
    method: "查看文档列表 UI"
    pass: "已删除文档不显示"
    fail: "仍在列表中"

判定方式: query + top_k_check + list_check
严重度: P0 - 幽灵数据可能导致数据泄漏
```

### 用例 7: 删除后重新上传

```yaml
case_id: KBV1-LC-007
operation: Delete + Create
priority: P1

workflow:
  step_1: 上传 KBV1-DOC-01 (v1)
  step_2: 验证可查询到"截止日期 2026-08-30"
  step_3: 删除 KBV1-DOC-01
  step_4: 验证已删除（不可查询）
  step_5: 重新上传 KBV1-DOC-01 (v2，内容可能相同或不同)
  step_6: 验证重新上传后的行为

expected_after_reupload:
  - 文档重新出现在列表
  - 可以查询到内容
  - 视为全新文档（新的 upload_id）
  - 不保留删除前的状态

test_focus:
  - 删除是否彻底
  - 重新上传是否视为新文档
  - 元数据是否重置（upload_id, 时间戳等）

check_points:
  - ✅ 删除后确实不可查
  - ✅ 重新上传后可查
  - ✅ 新旧 upload_id 不同（若产品提供）
  - ❌ 不应保留删除前的任何状态
```

---

## 步骤 5: 适配状态时间线测试

### 用例 8: 完整生命周期时间线

```yaml
case_id: KBV1-LC-008
operation: Full lifecycle
priority: P1

timeline:
  
  t0_initial: "空知识库"
  
  t1_upload: "上传 KBV1-DOC-01"
  expected_state:
    - status: "上传中" → "处理中" → "可用"
    - document_list: [DOC-01]
    - queryable: false → false → true
  
  t2_query: "查询'任务 A 截止日期'"
  expected_result: "2026-08-30"
  
  t3_update: "上传 KBV1-DOC-01-v2 (截止日期改为 2026-09-15)"
  expected_state:
    - old_version: 删除 OR 标记为旧版
    - new_version: 可用
    - query_result: "2026-09-15"
  
  t4_query_again: "再次查询'任务 A 截止日期'"
  expected_result: "2026-09-15"  # 已更新
  forbidden_result: "2026-08-30"  # 旧版
  
  t5_delete: "删除文档"
  expected_state:
    - status: "已删除" OR 从列表消失
    - document_list: []
    - queryable: false
  
  t6_query_after_delete: "删除后查询"
  expected_result: "文档未提供"
  forbidden_result: "2026-09-15"  # 幽灵数据

state_transition_diagram: |
  空 → 上传中 → 处理中 → 可用 → 更新中 → 可用(新) → 删除中 → 已删除
       ↓                   ↓                ↓                    ↓
     可取消           可查询(旧)        可查询(新)            不可查

check_at_each_state:
  - 文档列表显示是否正确
  - 查询结果是否符合当前状态
  - 状态转换是否符合预期
  - 不应跳状态或回退

判定方式: manual timeline verification
```

### 用例 9: 并发操作测试

```yaml
case_id: KBV1-LC-009
operation: Concurrent operations
priority: P2

scenario: "在处理中的文档上执行操作"

test_workflow:
  step_1: 上传大文档（处理时间 > 10 秒）
  step_2: 等待 5 秒（文档仍在处理中）
  step_3: 尝试以下操作之一:
    - 删除该文档
    - 上传同名文档（更新）
    - 查询该文档

expected_behaviors:
  
  for_delete_during_processing:
    - option_A: 允许删除，停止处理
    - option_B: 拒绝删除，提示"处理中无法删除"
    - option_C: 标记为"待删除"，处理完成后删除
  
  for_update_during_processing:
    - option_A: 拒绝更新
    - option_B: 排队，当前处理完成后再更新
  
  for_query_during_processing:
    - 应该: 提示"文档处理中，暂不可查"
    - 不应该: 返回部分处理结果或旧版

需要产品确认: "处理中的文档如何处理并发操作？"

test_method: 手动或脚本模拟并发
判定标准: "行为一致且不出现不可预期状态"
```

---

## 步骤 6: 创建检测脚本伪代码

### 幽灵数据检测

```python
# 伪代码：Ghost Data Detection

def test_ghost_data_after_delete(doc_id: str, query: str):
    """删除后幽灵数据检测"""
    
    # 阶段 1: 上传并验证
    upload_result = upload_document(doc_id)
    wait_until_ready(doc_id)
    
    initial_query = query_kb(query)
    assert contains_answer(initial_query), "上传后应该可查"
    assert cites_document(initial_query, doc_id), "应该引用该文档"
    
    # 阶段 2: 删除
    delete_result = delete_document(doc_id)
    assert delete_result.success, "删除操作应该成功"
    
    # 阶段 3: 幽灵数据检查
    after_delete_query = query_kb(query)
    
    # 检查点 1: 答案不应来自已删除文档
    assert not contains_answer(after_delete_query), \
        f"GHOST DATA: 删除后仍返回答案 {after_delete_query.answer}"
    
    # 检查点 2: 引用不应指向已删除文档
    if after_delete_query.citations:
        for citation in after_delete_query.citations:
            assert citation.doc_id != doc_id, \
                f"GHOST CITATION: 仍引用已删除文档 {doc_id}"
    
    # 检查点 3: Top-K 不应包含已删除文档的 chunks
    top_k_chunks = get_top_k_chunks(query)
    for chunk in top_k_chunks:
        assert chunk.doc_id != doc_id, \
            f"GHOST CHUNK: Top-K 包含已删除文档的 chunk {chunk.id}"
    
    # 检查点 4: 文档列表不应显示已删除文档
    doc_list = list_documents()
    assert doc_id not in [d.id for d in doc_list], \
        f"GHOST IN LIST: 文档列表仍显示已删除文档 {doc_id}"
    
    return {
        "test": "ghost_data_detection",
        "result": "PASS",
        "checks_passed": 4
    }
```

### 旧版残留检测

```python
# 伪代码：Stale Version Detection

def test_stale_version_after_update(doc_id: str, query: str, 
                                     old_value: str, new_value: str):
    """更新后旧版残留检测"""
    
    # 阶段 1: 上传 v1
    upload_document(doc_id, version=1, content_contains=old_value)
    wait_until_ready(doc_id)
    
    v1_query = query_kb(query)
    assert contains_value(v1_query, old_value), "v1 应包含旧值"
    
    # 阶段 2: 更新到 v2
    update_document(doc_id, version=2, content_contains=new_value)
    wait_until_ready(doc_id)
    
    # 阶段 3: 旧版残留检查
    v2_query = query_kb(query)
    
    # 检查点 1: 应该包含新值
    assert contains_value(v2_query, new_value), \
        f"MISSING NEW: 更新后未返回新值 {new_value}"
    
    # 检查点 2: 不应包含旧值
    assert not contains_value(v2_query, old_value), \
        f"STALE VERSION: 更新后仍返回旧值 {old_value}"
    
    # 检查点 3: 不应新旧混答
    assert not (contains_value(v2_query, old_value) and 
                contains_value(v2_query, new_value)), \
        f"MIXED VERSION: 新旧值混答"
    
    # 检查点 4: Top-K 不应包含旧版 chunks
    top_k = get_top_k_chunks(query)
    for chunk in top_k:
        if chunk.doc_id == doc_id:
            assert contains_value(chunk.content, new_value), \
                f"STALE CHUNK: Top-K 包含旧版 chunk {chunk.id}"
            assert not contains_value(chunk.content, old_value), \
                f"STALE CHUNK: chunk 包含旧值 {old_value}"
    
    return {
        "test": "stale_version_detection",
        "result": "PASS",
        "checks_passed": 4
    }
```

---

## 步骤 7: 记录提取过程

```yaml
extraction_record:
  source: "CRUD-RAG"
  extraction_date: "2026-09-03"
  extractor: "AI 应用测试工程师"
  
  what_extracted:
    frameworks:
      - CRUD 四操作测试框架
      - 状态时间线模型
      - 传播检查点列表
    
    patterns:
      - 幽灵数据检测（Delete 后）
      - 旧版残留检测（Update 后）
      - 重复上传语义（Create duplicate）
      - 删除传播完整性
    
    detection_methods:
      - 查询验证（答案正确性）
      - Top-K 检查（chunk 级别）
      - 引用检查（citation 对齐）
      - 列表检查（UI 一致性）
  
  what_created:
    new_cases: 9
      - KBV1-LC-001: Create (首次上传)
      - KBV1-LC-002: Create (重复上传同内容)
      - KBV1-LC-003: Create (重复上传不同内容/版本)
      - KBV1-LC-004: Update (更新后查询验证)
      - KBV1-LC-005: Update (多次更新链)
      - KBV1-LC-006: Delete (幽灵数据检测) ⭐
      - KBV1-LC-007: Delete + Create (删除后重新上传)
      - KBV1-LC-008: Full lifecycle (完整时间线)
      - KBV1-LC-009: Concurrent (并发操作)
    
    detection_scripts: 2
      - ghost_data_detection.py (伪代码)
      - stale_version_detection.py (伪代码)
  
  what_not_used:
    - CRUD-RAG 的业务场景内容
    - 特定数据库实现（PostgreSQL/MongoDB）
    - 复杂事务处理
  
  adaptation_notes:
    - 保留：CRUD 四操作框架
    - 保留：幽灵数据和旧版残留模式
    - 保留：状态时间线设计
    - 明确：重复上传需要产品确认语义
    - 明确：版本管理需要产品确认能力
    - 新增：传播检查点（Vector DB, Cache, List）
  
  files_updated:
    - test-datasets/lifecycle/lifecycle-cases-v1.yaml (新增 9 条)
    - test-datasets/sources/registry.md (更新 CRUD-RAG 行)
  
  product_dependencies_identified:
    - "重复上传语义（覆盖/去重/并存）"
    - "是否支持版本管理"
    - "删除是软删除还是硬删除"
    - "处理中的文档如何处理并发操作"
```

---

## 📊 提取成果

### 新增用例统计

```yaml
new_cases_summary:
  total: 9
  p0: 5
  p1: 3
  p2: 1
  
  coverage:
    - 首次上传（Create）
    - 重复上传语义（Create duplicate）⚠️
    - 版本管理（Update）⚠️
    - 幽灵数据检测（Delete）⭐
    - 删除传播完整性
    - 完整生命周期时间线
    - 并发操作（可选）
  
  detection_methods:
    - 查询验证: 答案是否正确
    - Top-K 检查: chunk 级别验证
    - 引用检查: citation 对齐
    - 列表检查: UI 一致性
    - 时间线验证: 状态转换
  
  ⚠️ 产品依赖: 4 项待确认
```

### 核心测试模式

```yaml
ghost_data_pattern:
  trigger: "删除操作"
  check_points:
    - 查询不返回已删除内容
    - Top-K 不包含已删除 chunks
    - 引用不指向已删除文档
    - 列表不显示已删除文档
  severity: P0
  impact: "数据泄漏、过期信息"

stale_version_pattern:
  trigger: "更新操作"
  check_points:
    - 查询只返回新版内容
    - Top-K 只包含新版 chunks
    - 旧版不混入答案
    - Vector DB 已同步
  severity: P0
  impact: "新旧混淆、信息冲突"

propagation_pattern:
  trigger: "删除或更新"
  check_layers:
    - Vector DB
    - Cache
    - Search Index
    - Document List
  complete: "所有层同步更新"
  incomplete: "部分层未更新 → 一致性问题"
```

---

## ⏱️ 实际用时

```yaml
time_breakdown:
  步骤1_理解CRUD-RAG: 15 min
  步骤2_Create适配: 30 min
  步骤3_Update适配: 20 min
  步骤4_Delete适配: 30 min
  步骤5_时间线设计: 20 min
  步骤6_检测脚本: 25 min
  步骤7_记录过程: 10 min
  
  total: 150 min (2.5 hours)
```

---

## ✅ 检查清单

完成后确认：
- [x] 已填写 sources/registry.md
- [x] 保留了 CRUD-RAG 的出处信息
- [x] CRUD 四操作都有用例
- [x] 幽灵数据检测清晰
- [x] 旧版残留检测清晰
- [x] 状态时间线完整
- [x] 明确标注产品依赖项 ⚠️
- [x] 更新了用例文件
- [x] 记录了提取过程

---

## 🎯 关键收获

### 生命周期测试的三个层次

| 层次 | 测试重点 | 检测方法 | 失败影响 |
|------|---------|---------|---------|
| **操作** | CRUD 正确执行 | 功能测试 | 功能不可用 |
| **传播** | 跨层一致性 | 多层检查 | 数据不一致 |
| **语义** | 业务逻辑正确 | 产品确认 | 行为不符预期 |

### 幽灵数据的危险性

**最危险的不是功能失败，而是静默失败**
- 删除显示"成功"
- 列表中消失
- 但查询仍能检索到 ← 幽灵数据

**影响**：
- 数据泄漏（删除的敏感信息仍可查）
- 过期信息误导（旧版规范仍在答案中）
- 用户信任下降（删除了还能查到）

### 产品语义需要明确

**以下行为没有"标准答案"，需要产品定义**：
1. 重复上传同名文件 → 覆盖？去重？并存？
2. 是否支持版本管理 → 保留历史？只保留最新？
3. 删除语义 → 软删除（可恢复）？硬删除？
4. 并发操作 → 允许？拒绝？排队？

**测试原则**：
- ✅ 先确认产品语义
- ✅ 测试实际行为是否符合承诺
- ❌ 不预先假设"应该怎样"

---

**已完成 5/6 个开源资源提取示例**:
1. ✅ BEIR (检索基准)
2. ✅ RAGTruth (答案可信度)
3. ✅ RGB (拒答鲁棒性)
4. ✅ TAT-QA (表格理解)
5. ✅ CRUD-RAG (生命周期) ⭐

**最后一个**: DocLayNet（文档结构）

---

版本: kb-v1-crudrag-extraction-example-2026-09-03  
维护者: AI 应用测试工程师
